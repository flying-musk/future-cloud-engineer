import os
from datetime import datetime

from dotenv import load_dotenv

if os.getenv("ENV", "dev") == "dev":
    load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db import SessionLocal, engine, Base
from models import DayRecord
from schemas import DayRecordOut, DayRecordCreate, DayRecordUpdate

app = FastAPI(title="Cloud Learning Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 建表（demo / 小專案很方便）
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Cloud Learning Tracker API"}


@app.get("/api/days", response_model=list[DayRecordOut])
def get_all_days(db: Session = Depends(get_db)):
    stmt = select(DayRecord).order_by(DayRecord.date.desc())
    rows = db.execute(stmt).scalars().all()
    return rows


@app.get("/api/days/{date}", response_model=DayRecordOut)
def get_day_by_date(date: str, db: Session = Depends(get_db)):
    stmt = select(DayRecord).where(DayRecord.date == date)
    row = db.execute(stmt).scalar_one_or_none()
    if row is None:
        # 跟你原本一樣：找不到就回預設
        return DayRecordOut(date=date, completed=False, content="")
    return row


@app.post("/api/days", response_model=DayRecordOut)
def create_day(payload: DayRecordCreate, db: Session = Depends(get_db)):
    now = datetime.now().isoformat()

    record = DayRecord(
        date=payload.date,
        completed=payload.completed,
        content=payload.content,
        updated_at=now,
    )
    db.add(record)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Day record already exists")

    db.refresh(record)
    return record


@app.put("/api/days/{date}", response_model=DayRecordOut)
def update_day(date: str, payload: DayRecordUpdate, db: Session = Depends(get_db)):
    stmt = select(DayRecord).where(DayRecord.date == date)
    record = db.execute(stmt).scalar_one_or_none()

    now = datetime.now().isoformat()

    if record is None:
        # upsert: 不存在就建立
        record = DayRecord(
            date=date,
            completed=True if payload.completed is True else False,
            content=payload.content or "",
            updated_at=now,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    # 存在就更新（只更新有帶的欄位）
    if payload.completed is not None:
        record.completed = payload.completed
    if payload.content is not None:
        record.content = payload.content
    record.updated_at = now

    db.commit()
    db.refresh(record)
    return record


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "db": os.getenv("DATABASE_URL", "sqlite:///./cloud_learning.db"),
    }
