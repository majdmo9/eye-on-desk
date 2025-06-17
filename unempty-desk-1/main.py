from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from sse_starlette.sse import EventSourceResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from shapely.geometry import Point, Polygon
from datetime import datetime
from dotenv import load_dotenv

import cv2
import numpy as np
import uvicorn
import asyncio
import os
import time

from utils.csv_crud import append_csv_row
from obj_types.csv import Row
from obj_types.predictions import RowToPredict
from classes.SpaceState import SpaceState
from classes.DetectedClasses import DetectedClasses
from classes.RectangleCoordinates import RectangleCoordinates
from classes.PolygonWrapper import PolygonWrapper
from utils.constants import DESK_ITEMS, POLYGON_POINTS
from utils.rect_to_polygon_points import rect_to_polygon_points
from utils.denormalize_rect import denormalize_rect
from mean_prediction import predict_use_time as predict_student_use_time
from firebase.firebase_config import verify_firebase_token, db
from firebase.fetch import fetch_rect_coordinates


load_dotenv()
uid = os.environ["RECT_CORDS_UID"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state = SpaceState()
detected_classes = DetectedClasses()
rect = RectangleCoordinates()
model = YOLO("./yolo11n.pt")


def update_polygon():
    rect_coordinates = fetch_rect_coordinates(uid)
    new_rect = RectangleCoordinates(
        rect_coordinates["x"],
        rect_coordinates["y"],
        rect_coordinates["width"],
        rect_coordinates["height"],
    )
    if not rect_coordinates:
        print("No rectangle coordinates found, using default polygon points.")
        return POLYGON_POINTS
    rect.set_rect_coordinates(
        new_rect.x,
        new_rect.y,
        new_rect.width,
        new_rect.height,
    )
    # Convert rectangle coordinates to polygon points
    # rect_coordinates = rect.get_rect_coordinates()
    # Ensure the rectangle coordinates are in the correct format
    # for polygon conversion
    if not isinstance(rect_coordinates, dict):
        raise ValueError("Invalid rectangle coordinates format")
    if not all(key in rect_coordinates for key in ("x", "y", "width", "height")):
        raise ValueError("Rectangle coordinates must contain x, y, width, and height")
    points = rect_to_polygon_points(denormalize_rect(rect.get_rect_coordinates()))
    return points


polygon = PolygonWrapper(update_polygon())


def get_box_color(inside_polygon):
    return (0, 255, 0) if inside_polygon else (0, 0, 255)


def create_detected_obj_box(frame, x1, y1, x2, y2, color, class_name, conf):
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    cv2.putText(
        frame,
        f"{class_name} ({conf:.2f})",
        (x1, y1 - 10),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        color,
        2,
    )


def update_space_status(
    currently_detected_classes: set[str], person_currently_inside: bool
):
    if person_currently_inside:
        state.set_status("in use")
    elif state.start_time and any(
        cls in currently_detected_classes for cls in DESK_ITEMS
    ):
        state.set_status("on hold")
    else:
        state.set_status("available")


def process_frame(frame):
    results = model.track(source=frame, conf=0.35, save=False, persist=True)

    cv2.polylines(
        frame,
        [
            np.array(
                rect_to_polygon_points(denormalize_rect(rect.get_rect_coordinates())),
                dtype=np.int32,
            )
        ],
        True,
        (255, 255, 0),
        2,
    )

    result = results[0] if results else None
    person_currently_inside = False
    currently_detected_classes = set()

    if result and result.boxes and result.boxes.id is not None:
        for box, cls, conf, track_id in zip(
            result.boxes.xyxy, result.boxes.cls, result.boxes.conf, result.boxes.id
        ):
            x1, y1, x2, y2 = map(int, box)
            class_name = model.names[int(cls)]
            bbox_center = Point((x1 + x2) / 2, (y1 + y2) / 2)
            inside_polygon = polygon.contains(bbox_center)
            if inside_polygon:
                detected_classes.append_class(class_name)
                currently_detected_classes.add(class_name)
                if class_name == "person":
                    person_currently_inside = True
                    if not state.person_inside:
                        state.person_inside = True
                        state.start_time = datetime.now()
                        state.student_id = track_id
                        print(f"[INFO] Person entered at: {state.start_time}")

            color = get_box_color(inside_polygon)
            create_detected_obj_box(frame, x1, y1, x2, y2, color, class_name, conf)

    update_space_status(currently_detected_classes, person_currently_inside)
    if state.person_inside and not person_currently_inside and state.is_available():
        state.person_inside = False
        state.end_time = datetime.now()
        duration = state.end_time - state.start_time
        state.duration_minutes = int(duration.total_seconds() // 60)
        print(
            f"[INFO] Person left at: {state.end_time}, duration: {state.duration_minutes} min"
        )

        if state.duration_minutes > 0 and not state.record_logged:
            state.record_logged = True
            state.detected_items = [
                1 if item in detected_classes.get_classes() else 0
                for item in DESK_ITEMS
            ]

            append_csv_row(
                "cam-records.csv",
                row=Row(
                    start_time=state.start_time.hour,
                    duration=state.duration_minutes,
                    laptop=state.detected_items[0],
                    ipad=state.detected_items[1],
                    mouse=state.detected_items[2],
                    bag=state.detected_items[3],
                ),
            )
            detected_classes.clear()
    elif state.person_inside:
        state.record_logged = False

    return frame


def video_stream():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("Unable to open video stream")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame = process_frame(frame)
            _, buffer = cv2.imencode(".jpg", frame)
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
            )
            time.sleep(0.03)
    finally:
        cap.release()


@app.get("/video-stream")
def get_video_stream():
    return StreamingResponse(
        video_stream(), media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/space-status/stream")
async def stream_space_status():
    async def event_generator():
        prev_status = None
        while True:
            await asyncio.sleep(1)  # stream check every second
            current_status = state.get_status()
            if current_status != prev_status:
                prev_status = current_status
                yield f"data: {current_status}\n\n"

    return EventSourceResponse(event_generator())


@app.get("/predict_duration")
def predict_use_time():
    if not state.person_inside:
        return JSONResponse(
            content={"error": "No person detected in the space."}, status_code=400
        )
    return JSONResponse(
        content={
            "predicted_duration": predict_student_use_time(
                new_data=RowToPredict(
                    start_time=state.start_time.hour,
                    laptop=state.detected_items[0],
                    ipad=state.detected_items[1],
                    mouse=state.detected_items[2],
                    bag=state.detected_items[3],
                )
            )
        }
    )


@app.get("/coordinates")
async def get_rect_coordinates():
    return fetch_rect_coordinates(uid)


@app.put("/coordinates")
async def put_rect_coordinates(
    rect_coordinates: dict[str, float], user_data=Depends(verify_firebase_token)
):
    if not user_data or not user_data.get("uid"):
        return JSONResponse(content={"error": "Unauthorized"}, status_code=401)

    rect_coordinates_ref = db.collection("rect-coordinates")
    try:
        # Update the rectangle coordinates in Firestore
        rect_coordinates_ref.document(uid).set(rect_coordinates)
        # Update the rectangle object with new coordinates
        rect.set_rect_coordinates(
            rect_coordinates["x"],
            rect_coordinates["y"],
            rect_coordinates["width"],
            rect_coordinates["height"],
        )
        polygon.update(
            rect_to_polygon_points(denormalize_rect(rect.get_rect_coordinates()))
        )
    except Exception as e:
        print(f"Error updating coordinates: {e}")
        return JSONResponse(
            content={"error": "Failed to update coordinates"}, status_code=500
        )
    print(f"Coordinates updated by user: {user_data['uid']}")
    return JSONResponse(
        content={"message": "Coordinates updated successfully"}, status_code=204
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
