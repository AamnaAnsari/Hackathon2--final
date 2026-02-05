import os
from sqlmodel import Session, create_engine
from dotenv import load_dotenv  # Ye line zaroori hai

# 1. Load .env file
load_dotenv()

# 2. Get URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Check agar URL nahi mila
if not DATABASE_URL:
    raise ValueError("DATABASE_URL .env file mein nahi mila!")

# 3. Neon DB Fix: 'postgres://' ko 'postgresql://' mein badalna padta hai SQLAlchemy ke liye
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 4. Engine Create karo
engine = create_engine(DATABASE_URL, echo=False)


def get_session():
    """Dependency: yields a database session."""
    with Session(engine) as session:
        yield session