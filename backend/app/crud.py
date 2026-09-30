from sqlalchemy.orm import Session

from .models import Todo
from .schemas import TodoCreate, TodoUpdate


def get_todos(db: Session):
    return db.query(Todo).all()


def get_todo(db: Session, todo_id: int):
    return db.query(Todo).filter(Todo.id == todo_id).first()


def create_todo(db: Session, todo: TodoCreate):
    new_todo = Todo(
        text=todo.text.strip(),
        completed=False
    )

    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)

    return new_todo


def update_todo(
    db: Session,
    todo_id: int,
    todo: TodoUpdate
):
    existing_todo = get_todo(db, todo_id)

    if not existing_todo:
        return None

    if todo.text is not None:
        existing_todo.text = todo.text.strip()

    if todo.completed is not None:
        existing_todo.completed = todo.completed

    db.commit()
    db.refresh(existing_todo)

    return existing_todo


def delete_todo(db: Session, todo_id: int):
    existing_todo = get_todo(db, todo_id)

    if not existing_todo:
        return None

    db.delete(existing_todo)
    db.commit()

    return existing_todo
