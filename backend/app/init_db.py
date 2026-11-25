
from app.database.connection import Base, engine
from app.models import (
    Organization,
    User,
    Product,
    OrganizationSettings
)

Base.metadata.create_all(bind=engine)

print("StockFlow database tables created successfully!")
