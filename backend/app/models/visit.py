# app/models/visit.py
from database import db
from app.models.base_model import BaseModel
from datetime import datetime

class Visit(BaseModel):
    __tablename__ = "visits"

    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    patient_name = db.Column(db.String(100), nullable=False)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    doctor = db.relationship("User", backref="visits")

    def __repr__(self):
        return f"<Visit {self.patient_name} - {self.visit_date}>"
