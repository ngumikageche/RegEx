# app/models/notification.py
from database import db
from datetime import datetime
from app.models.base_model import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="notifications")

    def __repr__(self):
        return f"<Notification {self.id} for User {self.user_id}: {self.message}>"