from pydantic import BaseModel
from typing import Optional


class DayRecordOut(BaseModel):
    id: Optional[int] = None
    date: str
    completed: bool = False
    content: str = ""
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class DayRecordCreate(BaseModel):
    date: str
    completed: bool = False
    content: str = ""


class DayRecordUpdate(BaseModel):
    completed: Optional[bool] = None
    content: Optional[str] = None
