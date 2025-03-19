from flask import Flask
from config import DevelopmentConfig
from database import db  # Importing the initialized database instance
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)
    # Import and register blueprints
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.visits import visit_bp
    app.register_blueprint(auth_bp, prefix="/auth")
    app.register_blueprint(dashboard_bp, prefix="/dashboard")
    app.register_blueprint(visit_bp, prefix="/visit")
    
    return app
