from firebase.firebase_config import db


def fetch_rect_coordinates(uid: str):
    rect_coordinates_ref = db.collection("rect-coordinates").document(uid)
    doc = rect_coordinates_ref.get()
    if doc.exists:
        return doc.to_dict()
    else:
        return None
