from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from datetime import datetime
import os

app = FastAPI(title="Cloud Learning Tracker API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DB_PATH = "cloud_learning.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS day_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            completed INTEGER DEFAULT 0,
            content TEXT DEFAULT '',
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Pydantic models
class DayRecord(BaseModel):
    id: Optional[int] = None
    date: str
    completed: bool = False
    content: str = ""
    updated_at: Optional[str] = None

class DayRecordUpdate(BaseModel):
    completed: Optional[bool] = None
    content: Optional[str] = None

# API endpoints
@app.get("/")
def read_root():
    return {"message": "Cloud Learning Tracker API"}

@app.get("/api/days", response_model=List[DayRecord])
def get_all_days():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, date, completed, content, updated_at FROM day_records ORDER BY date DESC")
    rows = cursor.fetchall()
    
    days = []
    for row in rows:
        days.append(DayRecord(
            id=row["id"],
            date=row["date"],
            completed=bool(row["completed"]),
            content=row["content"],
            updated_at=row["updated_at"]
        ))
    
    conn.close()
    return days

@app.get("/api/days/{date}", response_model=DayRecord)
def get_day_by_date(date: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, date, completed, content, updated_at FROM day_records WHERE date = ?", (date,))
    row = cursor.fetchone()
    
    conn.close()
    
    if row is None:
        return DayRecord(
            date=date,
            completed=False,
            content=""
        )
    
    return DayRecord(
        id=row["id"],
        date=row["date"],
        completed=bool(row["completed"]),
        content=row["content"],
        updated_at=row["updated_at"]
    )

@app.post("/api/days", response_model=DayRecord)
def create_day(day: DayRecord):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    completed = 1 if day.completed else 0
    
    try:
        cursor.execute(
            "INSERT INTO day_records (date, completed, content, updated_at) VALUES (?, ?, ?, ?)",
            (day.date, completed, day.content, now)
        )
        conn.commit()
        
        day_id = cursor.lastrowid
        conn.close()
        
        return DayRecord(
            id=day_id,
            date=day.date,
            completed=day.completed,
            content=day.content,
            updated_at=now
        )
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Day record already exists")

@app.put("/api/days/{date}", response_model=DayRecord)
def update_day(date: str, day_update: DayRecordUpdate):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get existing record
    cursor.execute("SELECT * FROM day_records WHERE date = ?", (date,))
    existing = cursor.fetchone()
    
    now = datetime.now().isoformat()
    
    if existing is None:
        # Create new record
        completed = 1 if (day_update.completed is True) else 0
        content = day_update.content or ""
        
        cursor.execute(
            "INSERT INTO day_records (date, completed, content, updated_at) VALUES (?, ?, ?, ?)",
            (date, completed, content, now)
        )
        conn.commit()
        day_id = cursor.lastrowid
        conn.close()
        
        return DayRecord(
            id=day_id,
            date=date,
            completed=bool(completed),
            content=content,
            updated_at=now
        )
    else:
        # Update existing record
        completed = day_update.completed if day_update.completed is not None else bool(existing["completed"])
        content = day_update.content if day_update.content is not None else existing["content"]
        
        cursor.execute(
            "UPDATE day_records SET completed = ?, content = ?, updated_at = ? WHERE date = ?",
            (1 if completed else 0, content, now, date)
        )
        conn.commit()
        conn.close()
        
        return DayRecord(
            id=existing["id"],
            date=date,
            completed=completed,
            content=content,
            updated_at=now
        )

@app.get("/health")
def health_check():
    return {"status": "ok"}

