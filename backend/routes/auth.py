from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db import db
from models import User

bp = Blueprint("auth", __name__)

def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()

@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = _normalize_email(data.get("email"))
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "email already registered"}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "registered"}), 201

@bp.post("/login")
def login():
    # parse JSON safely and always return something
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"message": "invalid JSON"}), 400

    email = _normalize_email(data.get("email"))
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token}), 200

    
# validate token & return the current user
@bp.get("/me")
@jwt_required()
def me():
    uid = get_jwt_identity()            # this is the same identity in create_access_token
    user = User.query.get(int(uid))     # optional: look up details
    if not user:
        return jsonify({"message": "user not found"}), 404
    # keep it simple—frontend just needs to know token is valid
    return jsonify({"user": {"id": user.id, "email": user.email}}), 200
