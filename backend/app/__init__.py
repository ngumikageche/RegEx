# app/__init__.py
from flask import Flask, request
from config import DevelopmentConfig
from database import db  # Importing the initialized database instance
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import logging
bcrypt = Bcrypt()  # Initialize Bcrypt globally

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    # Configure logging
    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)
    app.logger.info("Starting Flask application")

    # Explicitly set JWT configurations
    app.config["JWT_SECRET_KEY"] = app.config.get("JWT_SECRET_KEY", "your-secure-secret-key")
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 90000  #  minutes in seconds

    # Build allowed origins from env (CORS_ALLOWED_ORIGINS="*") or comma-separated list
    origins_raw = app.config.get("CORS_ALLOWED_ORIGINS", "*")
    if origins_raw.strip() == "*":
        allowed_origins = ["*"]
    else:
        allowed_origins = [o.strip() for o in origins_raw.split(",") if o.strip()]

    supports_creds = allowed_origins != ["*"]  # Can't use credentials with wildcard in browsers

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=supports_creds,
        resources={r"/*": {"origins": allowed_origins}},
        allow_headers=[
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-User-Role",
            "X-API-Key",
        ],
        expose_headers=["Content-Type"],
    )
    
    # Initialize extensions
    app.logger.info("Initializing extensions")
    db.init_app(app)
    Migrate(app, db)
    bcrypt.init_app(app)
    JWTManager(app)

    # Log JWT configuration for debugging
    app.logger.info(f"JWT_SECRET_KEY: {'set' if app.config['JWT_SECRET_KEY'] else 'not set'}")
    app.logger.info(f"JWT_ACCESS_TOKEN_EXPIRES: {app.config['JWT_ACCESS_TOKEN_EXPIRES']} seconds")

    # Import and register blueprints
    app.logger.info("Registering blueprints")
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.visits import visit_bp
    from app.routes.users import user_bp
    from app.routes.notification import notification_bp
    from app.routes.reports import report_bp
    from app.routes.products import products_bp
    from app.routes.categories import categories_bp
    from app.routes.usergroups import usergroups_bp
    from app.routes.images import images_bp
    from app.routes.public import public_bp

    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/dashboard")
    app.register_blueprint(visit_bp, url_prefix="/visit")
    app.register_blueprint(notification_bp, url_prefix="/notification")
    app.register_blueprint(report_bp, url_prefix="/report")
    app.register_blueprint(products_bp, url_prefix="/products")
    app.register_blueprint(categories_bp, url_prefix="/categories")
    app.register_blueprint(usergroups_bp, url_prefix="/usergroups")
    app.register_blueprint(images_bp, url_prefix="/images")
    app.register_blueprint(public_bp, url_prefix="/public")
    app.logger.info("Blueprints registered successfully")

    # Create database tables
    # with app.app_context():
    #     app.logger.info("Creating database tables")
    #     db.create_all()

    return app