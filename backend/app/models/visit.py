from database import db
from app.models.base_model import BaseModel
from datetime import datetime

class Visit(BaseModel):
    __tablename__ = "visits"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)  # Renamed from marketer_id
    doctor_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    user = db.relationship("User", backref="visits")  # Renamed from marketer

    def __repr__(self):
        return f"<Visit {self.doctor_name} at {self.location} - {self.visit_date}>"