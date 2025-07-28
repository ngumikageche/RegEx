# app/config.py
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "fallback_secret_key")

    # Default to PostgreSQL
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://joseph:regisam_dev@localhost:5433/wms")

    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Boolean environment variable handling
    DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

    # Security settings
    CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "*")
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "True") == "True"

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Show SQL queries in console (for debugging)

class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True  # Enforce HTTPS in production
