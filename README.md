# Cloud Learning Tracker

A simple web application to track your daily cloud native learning progress, inspired by Apple Calendar's full-year view.

## Features

- 📅 **Full-Year Calendar View**: See all 12 months at once, just like Apple Calendar
- ✅ **Daily Checkbox**: Mark each day as completed when you've worked on it and learned something
- 📝 **Markdown Editor**: Write learning notes in Markdown format
- 👁️ **Live Preview**: Real-time preview of Markdown rendering
- 💾 **SQLite Storage**: Data stored in local SQLite database

## Tech Stack

### Backend
- FastAPI
- SQLite3
- Python 3.8+

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Markdown
- React Syntax Highlighter

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 18+ and npm/yarn

### Installation & Running

#### 1. Start Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run server (default port 8000)
uvicorn main:app --reload
```

The backend will start at `http://localhost:8000`. The database file `cloud_learning.db` will be automatically created in the `backend` directory.

#### 2. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

## Usage

1. **View Calendar**: See the full year calendar with all 12 months
2. **Select Date**: Click on any date to view or edit that day's learning record
3. **Mark Complete**: Check the checkbox on each date cell to mark that you've worked on it and learned something
4. **Edit Content**:
   - Click "Edit" button to enter edit mode
   - Write learning notes in Markdown format
   - Code blocks will be automatically highlighted
   - Supports GitHub Flavored Markdown (GFM)
5. **Save**: Click "Save" button to save your content

## Markdown Example

```markdown
# 2024-01-15 Learning Notes

## What did I learn today?

- [x] Completed Day 1: Installed Go and Docker
- [ ] Started learning Kubernetes basics

## Code Example

func main() {
    fmt.Println("Hello, Cloud Engineer!")
}

## Notes

Today I learned about Docker basics, including:
- Difference between Image and Container
- Writing Dockerfiles
- Basic Docker commands
```

## Project Structure

```
future-cloud-engineer/
├── backend/
│   ├── main.py              # FastAPI backend
│   ├── requirements.txt     # Python dependencies
│   └── cloud_learning.db    # SQLite database (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Main app component
│   │   ├── api.ts                  # API functions
│   │   ├── types.ts                # TypeScript types
│   │   ├── components/
│   │   │   ├── FullYearCalendar.tsx  # Full-year calendar view
│   │   │   └── DayDetail.tsx          # Day detail component
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── package.json                 # npm dependencies
│   └── vite.config.ts              # Vite configuration
│
└── README.md
```

## API Endpoints

- `GET /api/days` - Get all day records
- `GET /api/days/{date}` - Get record for specific date
- `POST /api/days` - Create new day record
- `PUT /api/days/{date}` - Update day record

## Next Steps

This project can be extended with:

- [ ] User authentication
- [ ] Multiple theme support
- [ ] Search functionality
- [ ] Export learning records as PDF/Markdown
- [ ] Statistics and charts
- [ ] Docker containerization
- [ ] Deploy to cloud platforms (GCP, AWS, Azure)

## Development Tips

You can gradually add features day by day:

- **Day N+1**: Add search functionality
- **Day N+2**: Improve UI/UX
- **Day N+3**: Add statistics
- **Day N+4**: Dockerize the application
- **Day N+5**: Deploy to cloud

Happy learning! 🚀
