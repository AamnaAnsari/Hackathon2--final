from sqlmodel import SQLModel
from database import engine
# Ye zaroori hai taaki SQLModel ko pata chale ke 'Task' table exist karti hai
import models  

print("Deleting old tables...")
# Purani tables khatam
SQLModel.metadata.drop_all(engine)

print("Creating new tables...")
# Nayi tables (Priority column ke sath) banayi
SQLModel.metadata.create_all(engine)

print("✅ Database has been updated successfully!")