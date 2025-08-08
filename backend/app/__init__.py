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

    # Define allowed origins
    allowed_origins = [
        "http://localhost:3000",
        "https://api.nextek.co.ke",  # Add your production frontend domain here
    ]

    # Enable CORS with dynamic origin handling
    CORS(app, origins=allowed_origins, supports_credentials=True, resources={r"/*": {"origins": allowed_origins}})
    
    @app.after_request
    def add_cors_headers(response):
        # Get the origin from the request
        origin = request.headers.get("Origin")
        app.logger.debug(f"Request Origin: {origin}")

        # Only set Access-Control-Allow-Origin if the origin is in the allowed list
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            # Fallback to a default origin or handle as needed
            response.headers["Access-Control-Allow-Origin"] = allowed_origins[0]

        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, , PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, X-User-Role"
        app.logger.debug(f"CORS Headers Set: {response.headers}")
        return response
    
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
    app.logger.info("Blueprints registered successfully")

    # Create database tables
    # with app.app_context():
    #     app.logger.info("Creating database tables")
    #     db.create_all()

    return app