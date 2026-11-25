from app.database.connection import Base, engine

# Import all models so SQLAlchemy registers them
from app.models import Organization, User, Product

Base.metadata.create_all(bind=engine)

print("StockFlow database tables created successfully!")