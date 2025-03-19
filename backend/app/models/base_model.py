# app/models/base_model.py
from datetime import datetime
from database import db

class BaseModel(db.Model):
    __abstract__ = True  # This ensures SQLAlchemy does not create a table for this class

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
