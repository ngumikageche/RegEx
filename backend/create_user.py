# create_user.py
"""
Script to create a new user in the database from the command line.
"""

import sys
from app.models.user import User
from app import create_app
from database import db


def create_user(username, email, password, role="user"):
    app = create_app()
    with app.app_context():
        if User.query.filter_by(email=email).first():
            print(f"User with email {email} already exists.")
            return
        if User.query.filter_by(username=username).first():
            print(f"User with username {username} already exists.")
            return
        if len(password) < 6:
            print("Password must be at least 6 characters long.")
            return
        if role not in ["admin", "user", "doctor", "marketer"]:
            print("Invalid role. Must be 'doctor', 'admin', 'user', or 'marketer'.")
            return
        new_user = User(username=username, email=email, role=role)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        print(f"User {username} created successfully.")


def main():
    if len(sys.argv) < 4:
        print("Usage: python create_user.py <username> <email> <password> [role]")
        sys.exit(1)
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    role = sys.argv[4] if len(sys.argv) > 4 else "user"
    create_user(username, email, password, role)

if __name__ == "__main__":
    main()
