"""
Manual test script for MCP tools. Run after update_schema.py.
"""
from sqlmodel import Session

from database import engine
from mcp_tools import add_task, complete_task, delete_task, list_tasks

TEST_USER_ID = "test-user"

if __name__ == "__main__":
    with Session(engine) as session:
        # a. Add Task
        print("--- Add Task ---")
        result = add_task(
            TEST_USER_ID,
            "Testing AI Tools",
            description="This was added via Python",
            session=session,
        )
        print(result)

        task_id = result.get("id")
        if not task_id:
            print("Add failed, aborting.")
            exit(1)

        # b. List Tasks
        print("\n--- List Tasks ---")
        tasks = list_tasks(TEST_USER_ID, status="all", session=session)
        print(tasks)

        # c. Complete Task
        print("\n--- Complete Task ---")
        complete_result = complete_task(TEST_USER_ID, task_id, session=session)
        print(complete_result)

        # d. Delete Task
        print("\n--- Delete Task ---")
        delete_result = delete_task(TEST_USER_ID, task_id, session=session)
        print(delete_result)

    print("\nDone.")
