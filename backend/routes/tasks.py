from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models import Task

bp = Blueprint("tasks", __name__)

def task_to_dict(t: Task):
    return {
        "id": t.id,
        "title": t.title,
        "done": t.done,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
    }

def get_owned_task_or_404(task_id: int, user_id: int) -> Task | None:
    # Return None if not found OR not owned (avoid leaking existence)
    return Task.query.filter_by(id=task_id, user_id=user_id).first()

@bp.get("/")
@jwt_required()
def list_tasks():
    user_id = int(get_jwt_identity())
    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.id.desc()).all()
    return jsonify([task_to_dict(t) for t in tasks]), 200

@bp.post("/")
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"message": "title is required"}), 400

    task = Task(user_id=user_id, title=title)
    db.session.add(task)
    db.session.commit()
    return jsonify(task_to_dict(task)), 201

@bp.put("/<int:task_id>")
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    task = get_owned_task_or_404(task_id, user_id)
    if not task:
        return jsonify({"message": "not found"}), 404

    data = request.get_json(silent=True) or {}
    if "title" in data and data["title"] is not None:
        title = str(data["title"]).strip()
        if not title:
            return jsonify({"message": "title cannot be empty"}), 400
        task.title = title
    if "done" in data and data["done"] is not None:
        task.done = bool(data["done"])

    db.session.commit()
    return jsonify(task_to_dict(task)), 200

@bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    task = get_owned_task_or_404(task_id, user_id)
    if not task:
        return jsonify({"message": "not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "deleted"}), 200
