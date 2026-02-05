"""
Gemini AI chat agent with MCP tool execution.
Uses google.generativeai (Gemini API); no OpenAI.
"""
import os
from dotenv import load_dotenv  # <--- 1. Ye line add ki hai
from sqlmodel import Session, select
import google.generativeai as genai

from models import Conversation, Message
from mcp_tools import add_task, complete_task, delete_task, list_tasks, update_task

# 2. .env file load karna zaroori hai
load_dotenv()

# 3. Naam 'GOOGLE_API_KEY' kar diya taaki .env se match kare
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: GOOGLE_API_KEY nahi mili! .env file check karein.")
else:
    genai.configure(api_key=api_key)

# Tool declarations for Gemini
GEMINI_TOOL_DECLARATIONS = [
    {
        "name": "add_task",
        "description": "Create a new task for the user. Use when the user asks to add, create, or remember a task.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Short title for the task (required, max 200 characters)."},
                "description": {"type": "string", "description": "Optional longer description or notes."},
            },
            "required": ["title"],
        },
    },
    {
        "name": "list_tasks",
        "description": "List the user's tasks. Use when the user asks to see tasks, list todos, or what's pending.",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "description": "Filter: 'pending' for incomplete, 'completed' for done, 'all' for every task.",
                    "enum": ["all", "pending", "completed"],
                },
            },
            "required": [],
        },
    },
    {
        "name": "complete_task",
        "description": "Mark a task as completed by ID. Use when the user says they finished a task or want to mark it done.",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "The numeric ID of the task to complete."},
            },
            "required": ["task_id"],
        },
    },
    {
        "name": "delete_task",
        "description": "Delete a task by ID. Use when the user asks to remove, delete, or cancel a task.",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "The numeric ID of the task to delete."},
            },
            "required": ["task_id"],
        },
    },
    {
        "name": "update_task",
        "description": "Update an existing task's title and/or description by ID. Only provided fields are updated.",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "The numeric ID of the task to update."},
                "title": {"type": "string", "description": "New title (optional)."},
                "description": {"type": "string", "description": "New description (optional)."},
            },
            "required": ["task_id"],
        },
    },
]


def _get_or_create_conversation(user_id: str, session: Session) -> Conversation:
    """Get the most recent conversation for the user, or create one."""
    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(1)
    )
    conv = session.exec(statement).first()
    if conv:
        return conv
    conv = Conversation(user_id=user_id)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return conv


def _get_last_messages(conversation_id: int, session: Session, limit: int = 10) -> list[Message]:
    """Return the last `limit` messages for the conversation (chronological order)."""
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    messages = list(session.exec(statement).all())
    messages.reverse()
    return messages


def _history_for_gemini(messages: list[Message]) -> list[dict]:
    """Convert DB messages to Gemini chat history format (list of Content-like dicts)."""
    result = []
    for m in messages:
        role = "user" if m.role == "user" else "model"
        result.append({"role": role, "parts": [{"text": m.content}]})
    return result


def _execute_tool(name: str, args: dict, user_id: str, session: Session):
    """Execute an MCP tool by name with injected user_id and session."""
    args = dict(args) if args else {}
    args["user_id"] = user_id
    args["session"] = session
    if name == "add_task":
        return add_task(**{k: v for k, v in args.items() if k in ("user_id", "title", "description", "session")})
    if name == "list_tasks":
        return list_tasks(**{k: v for k, v in args.items() if k in ("user_id", "status", "session")})
    if name == "complete_task":
        return complete_task(**{k: v for k, v in args.items() if k in ("user_id", "task_id", "session")})
    if name == "delete_task":
        return delete_task(**{k: v for k, v in args.items() if k in ("user_id", "task_id", "session")})
    if name == "update_task":
        return update_task(**{k: v for k, v in args.items() if k in ("user_id", "task_id", "title", "description", "session")})
    return {"error": f"Unknown tool: {name}"}


def get_gemini_response(user_id: str, message_text: str, session: Session) -> str:
    """
    Get a response from Gemini for the user's message, with MCP tool execution and history.
    """
    conv = _get_or_create_conversation(user_id, session)
    conversation_id = conv.id
    if conversation_id is None:
        raise ValueError("Conversation has no id")

    last_messages = _get_last_messages(conversation_id, session, limit=10)
    history = _history_for_gemini(last_messages)

    # 4. Model name updated to a stable one (flash-latest is good, but 1.5-flash is safer)
    model = genai.GenerativeModel(
        "gemini-flash-latest", 
        tools=[{"function_declarations": GEMINI_TOOL_DECLARATIONS}],
    )
    chat = model.start_chat(history=history)

    current_message = message_text
    final_text = ""

    while True:
        try:
            response = chat.send_message(current_message)
        except Exception as e:
            return f"Error communicating with Gemini: {str(e)}"

        if not response.candidates or not response.candidates[0].content or not response.candidates[0].content.parts:
            final_text = "I couldn't generate a response."
            break

        parts = response.candidates[0].content.parts
        function_call_part = None
        text_parts = []

        for part in parts:
            if hasattr(part, "function_call") and part.function_call:
                function_call_part = part.function_call
                break
            if hasattr(part, "text") and part.text:
                text_parts.append(part.text)

        if function_call_part:
            name = getattr(function_call_part, "name", None) or (function_call_part.get("name") if isinstance(function_call_part, dict) else None)
            args = getattr(function_call_part, "args", None) or (function_call_part.get("args") if isinstance(function_call_part, dict) else {})
            if args is None:
                args = {}
            if hasattr(args, "items"):
                args = dict(args)
            else:
                args = {}

            # Execute the tool
            result = _execute_tool(name, args, user_id, session)
            
            # Prepare result for Gemini
            response_payload = result if isinstance(result, dict) else {"result": result}
            
            # Send function response back
            current_message = genai.protos.Content(
                role="user",
                parts=[genai.protos.Part(function_response=genai.protos.FunctionResponse(name=name, response=response_payload))]
            )
            continue

        final_text = "".join(text_parts).strip() if text_parts else "I couldn't generate a response."
        break

    # Save to DB
    user_msg = Message(conversation_id=conversation_id, role="user", content=message_text)
    session.add(user_msg)
    session.commit()

    assistant_msg = Message(conversation_id=conversation_id, role="assistant", content=final_text)
    session.add(assistant_msg)
    session.commit()

    return final_text