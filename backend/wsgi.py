from app import create_app
from database import db
from flask_migrate import Migrate

app = create_app()
migrate = Migrate(app, db)  # Add this line

if __name__ == "__main__":
    app.run()
