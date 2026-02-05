"""
Manual migration: add description column to tasks table if missing.
Run once after adding the description field to the Task model.
"""
from sqlmodel import text

from database import engine

if __name__ == "__main__":
    # Table name is "tasks" (plural) per models.Task.__tablename__
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description VARCHAR;"))
        conn.commit()
    print("Schema updated: tasks.description column ensured.")
