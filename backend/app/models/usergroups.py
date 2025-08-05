# app/models/usergroups.py
"""
UserGroup model for grouping users. Many-to-many relationship with User.
"""
from database import db
from app.models.base_model import BaseModel

user_group_association = db.Table(
    'user_group_association',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('usergroups.id'), primary_key=True)
)

class UserGroup(BaseModel):
    __tablename__ = 'usergroups'

    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)

    users = db.relationship('User', secondary=user_group_association, backref=db.backref('groups', lazy='dynamic'))

    def __repr__(self):
        return f"<UserGroup {self.name}>"
