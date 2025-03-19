# app/models/report.py
from database import db
from app.models.base_model import BaseModel

class Report(BaseModel):
    __tablename__ = "reports"

    visit_id = db.Column(db.Integer, db.ForeignKey("visits.id"), nullable=False)
    report_text = db.Column(db.Text, nullable=False)

    visit = db.relationship("Visit", backref="reports")

    def __repr__(self):
        return f"<Report {self.id} for Visit {self.visit_id}>"
