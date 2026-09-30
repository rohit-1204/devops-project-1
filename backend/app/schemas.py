from pydantic import BaseModel, ConfigDict


class TodoCreate(BaseModel):
    text: str


class TodoUpdate(BaseModel):
    text: str | None = None
    completed: bool | None = None


class TodoResponse(BaseModel):
    id: int
    text: str
    completed: bool

    model_config = ConfigDict(from_attributes=True)
