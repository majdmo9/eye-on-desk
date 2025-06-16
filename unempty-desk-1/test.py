from ultralytics import YOLO
from shapely.geometry import Point, Polygon
import numpy as np
import cv2

# Load the trained model
model = YOLO("./best.pt")

# Define the polygon (replace with your actual coordinates)
polygon_points = [
    (100, 200),
    (1500, 200),
    (1500, 1000),
    (100, 1000),
]  # Example coordinates
polygon = Polygon(polygon_points)


# Draw the polygon on the output images
def draw_polygon(image, points):
    cv2.polylines(
        image,
        [np.array(points, dtype=np.int32)],
        isClosed=True,
        color=(0, 255, 0),
        thickness=2,
    )


# Process live video from a phone camera
def process_phone_camera(camera_url):
    # Open the phone camera stream
    cap = cv2.VideoCapture(camera_url)
    if not cap.isOpened():
        print("Error: Unable to access the phone camera.")
        return

    # Precompute polygon bounding box for faster checks
    polygon_bounds = polygon.bounds  # (min_x, min_y, max_x, max_y)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Unable to read from the camera.")
            break

        # Run YOLOv8 inference on the current frame
        results = model.predict(source=frame, conf=0.4, save=False, stream=True)

        # Draw the polygon on the frame
        draw_polygon(frame, polygon_points)

        # Process detections
        for result in results:
            detected_classes = []
            for box, cls, conf in zip(
                result.boxes.xyxy, result.boxes.cls, result.boxes.conf
            ):
                x1, y1, x2, y2 = map(int, box)  # Bounding box coordinates
                class_name = model.names[int(cls)]
                bbox_center = Point(
                    (x1 + x2) / 2, (y1 + y2) / 2
                )  # Center of the bounding box

                # Optimize polygon checks: skip if outside polygon bounding box
                if not (
                    polygon_bounds[0] <= bbox_center.x <= polygon_bounds[2]
                    and polygon_bounds[1] <= bbox_center.y <= polygon_bounds[3]
                ):
                    inside_polygon = False
                else:
                    inside_polygon = polygon.contains(bbox_center)

                # Draw bounding boxes and labels
                color = (0, 255, 0) if inside_polygon else (0, 0, 255)
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
            item_inside_polygon = any(
                cls in detected_classes for cls in ["bag", "ipad", "laptop", "mouse"]
            )
            if "person" in detected_classes and item_inside_polygon:
                print("in use")
            elif item_inside_polygon:
                print("on hold")
            else:
                print("avaliable")

        # Display the live feed with annotations
        cv2.imshow("Phone Camera Object Detection", frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Release resources
    cap.release()
    cv2.destroyAllWindows()


# Replace with the phone camera's URL (example: "http://192.168.0.100:8080/video")
phone_camera_url = "rtsp://admin:admin123@10.0.0.11/live/ch00_0"
process_phone_camera(phone_camera_url)
