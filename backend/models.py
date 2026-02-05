from datetime import datetime
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    """Reference model; users are managed by Better Auth."""
    __tablename__ = "users"
    id: str | None = Field(default=None, primary_key=True, max_length=255)

class Task(SQLModel, table=True):
    """Task model: id, user_id, title, completed, priority."""
    __tablename__ = "tasks"
    
    id: int | None = Field(default=None, primary_key=True)
    
    # ✅ NO Foreign Key here. Just a simple String to store user ID.
    user_id: str = Field(index=True, max_length=255) 
    
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    completed: bool = Field(default=False)
    priority: str = Field(default="Medium", max_length=50)  # High, Medium, Low


class Conversation(SQLModel, table=True):
    """Conversation model: id, user_id, created_at, updated_at."""
    __tablename__ = "conversations"
    
    id: int | None = Field(default=None, primary_key=True)
    
    # ✅ NO Foreign Key here. Just a simple String to store user ID.
    user_id: str = Field(index=True, max_length=255)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    """Message model: id, conversation_id, role, content, created_at."""
    __tablename__ = "messages"
    
    id: int | None = Field(default=None, primary_key=True)
    
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    
    role: str = Field(max_length=50)  # e.g., "user" or "assistant"
    content: str  # The actual text
    
    created_at: datetime = Field(default_factory=datetime.utcnow)