# app/models/catalogue.py
"""
Catalogue model for storing product information with a relation to User.
"""
from app.models.base_model import BaseModel
from app.models.user import User
from database import db

class Product(BaseModel):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)

    user = db.relationship('User', backref=db.backref('products', lazy=True))
    # category relationship is defined in Category model as backref

    def __repr__(self):
        return f"<Product {self.name} - ${self.price}>"
