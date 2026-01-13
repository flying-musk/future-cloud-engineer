import os
import sqlite3
from sqlalchemy import create_engine, text

SQLITE_PATH = os.getenv("SQLITE_PATH", "./cloud_learning.db")
POSTGRES_URL = os.getenv("POSTGRES_URL")

if not POSTGRES_URL:
    raise SystemExit(
        "❌ POSTGRES_URL is required. Example: postgresql+psycopg://cloud:cloud@localhost:5432/cloud_learning"
    )


def main():
    if not os.path.exists(SQLITE_PATH):
        raise SystemExit(f"❌ SQLite DB not found at: {SQLITE_PATH}")

    print(f"📦 Reading SQLite: {SQLITE_PATH}")
    sconn = sqlite3.connect(SQLITE_PATH)
    sconn.row_factory = sqlite3.Row
    scur = sconn.cursor()

    scur.execute(
        "SELECT id, date, completed, content, updated_at FROM day_records ORDER BY id"
    )
    rows = scur.fetchall()
    print(f"✅ Found {len(rows)} rows in SQLite")

    if len(rows) == 0:
        print("⚠️ SQLite has 0 rows. Nothing to migrate.")
        return

    print(f"🐘 Connecting Postgres: {POSTGRES_URL}")
    engine = create_engine(POSTGRES_URL, pool_pre_ping=True)

    # 將資料插入 Postgres
    # 用 ON CONFLICT(date) DO UPDATE 讓我們能可以重跑 script 不會炸
    stmt = text(
        """
        INSERT INTO day_records (date, completed, content, updated_at)
        VALUES (:date, :completed, :content, :updated_at)
        ON CONFLICT (date)
        DO UPDATE SET
          completed = EXCLUDED.completed,
          content = EXCLUDED.content,
          updated_at = EXCLUDED.updated_at
    """
    )

    inserted = 0
    with engine.begin() as conn:
        for r in rows:
            conn.execute(
                stmt,
                {
                    "date": r["date"],
                    # SQLite 可能是 0/1 或 True/False，都轉成 bool
                    "completed": bool(r["completed"]),
                    "content": r["content"] or "",
                    "updated_at": r["updated_at"] or "",
                },
            )
            inserted += 1

    print(f"🎉 Migrated {inserted} rows into Postgres")
    sconn.close()


if __name__ == "__main__":
    main()
