
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud
from .database import Base, engine, get_db
from .schemas import TodoCreate, TodoResponse, TodoUpdate


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Todo API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/todos", response_model=list[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    return crud.get_todos(db)


@app.get("/api/todos/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = crud.get_todo(db, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    return todo


@app.post(
    "/api/todos",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED
)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):

    if not todo.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Todo text cannot be empty"
        )

    return crud.create_todo(db, todo)


@app.put("/api/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo: TodoUpdate,
    db: Session = Depends(get_db)
):
    updated_todo = crud.update_todo(db, todo_id, todo)

    if not updated_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    return updated_todo


@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):

    deleted_todo = crud.delete_todo(db, todo_id)

    if not deleted_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    return {"message": "Todo deleted successfully"}
