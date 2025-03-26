from flask import Flask
from config import DevelopmentConfig
from database import db  # Importing the initialized database instance
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
      # Enable CORS based on allowed origins
    CORS(app, resources={r"/*": {"origins": app.config["CORS_ALLOWED_ORIGINS"]}})

    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)
    # Import and register blueprints
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.visits import visit_bp
    from app.routes.users import user_bp

    app.register_blueprint(user_bp, prefix="/user")
    app.register_blueprint(auth_bp, prefix="/auth")
    app.register_blueprint(dashboard_bp, prefix="/dashboard")
    app.register_blueprint(visit_bp, prefix="/visit")
    
    return app
