from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from db import Base


class DayRecord(Base):
    __tablename__ = "day_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    date: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    content: Mapped[str] = mapped_column(String, default="", nullable=False)
    updated_at: Mapped[str] = mapped_column(
        String,
        default=lambda: func.datetime("now"),  # SQLite-friendly default
        nullable=False,
    )
