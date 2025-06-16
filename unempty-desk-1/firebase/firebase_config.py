import firebase_admin
from firebase_admin import credentials, auth, firestore
from fastapi import Request, HTTPException
from dotenv import load_dotenv
import os

load_dotenv()

path = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
cred = credentials.Certificate(path)
firebase_admin.initialize_app(cred)

db = firestore.client()


def verify_firebase_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token  # You get user's UID, email, etc.
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
