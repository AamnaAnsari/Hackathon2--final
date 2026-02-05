"""
MCP tools: Python functions that the AI (e.g. Gemini) calls to manage tasks.
These are the core implementations used by the chatbot; API routes are separate.
"""
from sqlmodel import Session, SQLModel, select

from models import Task


def add_task(
    user_id: str,
    title: str,
    description: str | None = None,
    session: Session | None = None,
) -> dict:
    """
    Create a new task for the given user.

    Use this when the user asks to add, create, or remember a task.

    Args:
        user_id: The ID of the user who owns the task (required).
        title: Short title for the task (required, max 200 characters).
        description: Optional longer description or notes for the task.
        session: Database session (injected when called from the app).

    Returns:
        A dictionary with the created task's id, user_id, title, description,
        and completed status. Use this to confirm to the user what was created.
    """
    if not session:
        return {"error": "Database session is required"}
    task = Task(user_id=user_id, title=title.strip(), description=description.strip() if description else None)
    session.add(task)
    session.commit()
    session.refresh(task)
    return {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
    }


def list_tasks(
    user_id: str,
    status: str = "all",
    session: Session | None = None,
) -> list[dict]:
    """
    List tasks for the given user, optionally filtered by completion status.

    Use this when the user asks to see their tasks, list todos, or what's pending.

    Args:
        user_id: The ID of the user whose tasks to list (required).
        status: Filter by status. Use "pending" for incomplete, "completed" for
                done, or "all" for every task (default: "all").
        session: Database session (injected when called from the app).

    Returns:
        A list of task dictionaries, each with id, user_id, title, description,
        and completed. Empty list if no tasks match.
    """
    if not session:
        return []
    statement = select(Task).where(Task.user_id == user_id)
    if status == "pending":
        statement = statement.where(Task.completed == False)
    elif status == "completed":
        statement = statement.where(Task.completed == True)
    tasks = session.exec(statement).all()
    return [
        {
            "id": t.id,
            "user_id": t.user_id,
            "title": t.title,
            "description": t.description,
            "completed": t.completed,
        }
        for t in tasks
    ]


def complete_task(
    user_id: str,
    task_id: int,
    session: Session | None = None,
) -> dict:
    """
    Mark a task as completed by ID.

    Use this when the user says they finished a task, want to mark it done, or
    check it off.

    Args:
        user_id: The ID of the user who owns the task (required).
        task_id: The numeric ID of the task to complete (required).
        session: Database session (injected when called from the app).

    Returns:
        A success message with the task id and title, or an error message if
        the task was not found or does not belong to the user.
    """
    if not session:
        return {"error": "Database session is required"}
    task = session.get(Task, task_id)
    if task is None or task.user_id != user_id:
        return {"error": "Task not found or access denied"}
    task.completed = True
    session.add(task)
    session.commit()
    return {"success": True, "message": f"Task marked complete: {task.title}", "task_id": task_id}


def delete_task(
    user_id: str,
    task_id: int,
    session: Session | None = None,
) -> dict:
    """
    Delete a task by ID. Only the owner can delete it.

    Use this when the user asks to remove, delete, or cancel a task.

    Args:
        user_id: The ID of the user who owns the task (required).
        task_id: The numeric ID of the task to delete (required).
        session: Database session (injected when called from the app).

    Returns:
        A success message with the task id, or an error message if the task
        was not found or does not belong to the user.
    """
    if not session:
        return {"error": "Database session is required"}
    task = session.get(Task, task_id)
    if task is None or task.user_id != user_id:
        return {"error": "Task not found or access denied"}
    session.delete(task)
    session.commit()
    return {"success": True, "message": "Task deleted", "task_id": task_id}


def update_task(
    user_id: str,
    task_id: int,
    title: str | None = None,
    description: str | None = None,
    session: Session | None = None,
) -> dict:
    """
    Update an existing task's title and/or description by ID.

    Use this when the user wants to change the text or details of a task.
    Only provided fields are updated; omit title or description to leave them
    unchanged. Does not change completion status.

    Args:
        user_id: The ID of the user who owns the task (required).
        task_id: The numeric ID of the task to update (required).
        title: New title for the task (optional; omit to keep current).
        description: New description for the task (optional; omit to keep current).
        session: Database session (injected when called from the app).

    Returns:
        The updated task as a dictionary (id, user_id, title, description,
        completed), or an error message if the task was not found or does
        not belong to the user.
    """
    if not session:
        return {"error": "Database session is required"}
    task = session.get(Task, task_id)
    if task is None or task.user_id != user_id:
        return {"error": "Task not found or access denied"}
    if title is not None:
        task.title = title.strip()
    if description is not None:
        task.description = description.strip() or None
    session.add(task)
    session.commit()
    session.refresh(task)
    return {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
    }
