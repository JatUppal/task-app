from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from db import db
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow requests from frontend
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Initialize DB
    db.init_app(app)
    JWTManager(app)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    with app.app_context():
        # Debug: see where DB will be created
        print("SQLALCHEMY_DATABASE_URI =", app.config["SQLALCHEMY_DATABASE_URI"])
        uri = app.config["SQLALCHEMY_DATABASE_URI"]
        if uri.startswith("sqlite:///"):
            rel = uri.replace("sqlite:///", "")
            abs_path = os.path.abspath(rel)
            print("Resolved SQLite path =", abs_path)

        from models import User, Task   # <-- import models here
        print("Calling db.create_all() ...")
        db.create_all()
        print("db.create_all() finished.")

        from routes.auth import bp as auth_bp
        app.register_blueprint(auth_bp, url_prefix="/api/auth")


    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)