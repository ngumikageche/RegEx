"""
Image model for storing image information, linked to User and Product.
"""
from app.models.base_model import BaseModel
from app.models.user import User
from app.models.catalogue import Product
from database import db

class Image(BaseModel):
    __tablename__ = 'images'

    name = db.Column(db.String(128), nullable=False)
    url = db.Column(db.String(256), nullable=False)
    color = db.Column(db.String(32), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('images', lazy=True))
    product = db.relationship('Product', backref=db.backref('images', lazy=True))

    def __repr__(self):
        return f"<Image {self.name} for Product {self.product_id} by User {self.user_id}>"
