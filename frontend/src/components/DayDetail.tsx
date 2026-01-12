import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { getDayByDate, updateDay } from '../api';
import { DayRecord } from '../types';

interface DayDetailProps {
  date: string;
  dayRecord?: DayRecord;
  onUpdate: () => void;
}

const DayDetail: React.FC<DayDetailProps> = ({ date, dayRecord, onUpdate }) => {
  const [content, setContent] = useState<string>('');
  const [completed, setCompleted] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadDayData();
  }, [date]);

  // Sync with external dayRecord data when it changes
  useEffect(() => {
    if (dayRecord) {
      setContent(dayRecord.content || '');
      setCompleted(dayRecord.completed || false);
    }
  }, [dayRecord?.updated_at, dayRecord?.completed]);

  const loadDayData = async () => {
    setLoading(true);
    try {
      const data = await getDayByDate(date);
      setContent(data.content || '');
      setCompleted(data.completed || false);
      setIsEditable(false); // Start with non-editable mode
    } catch (error) {
      console.error('Failed to load day data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDay(date, {
        content,
        completed,
      });
      setIsEditable(false); // Switch back to non-editable mode after saving
      onUpdate();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    try {
      await updateDay(date, {
        completed: newCompleted,
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update completion status:', error);
      setCompleted(completed); // Revert on error
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="day-detail">
      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggleComplete}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-700">
            {completed ? 'Completed today\'s practice' : 'Not completed'}
          </span>
        </label>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Content</h3>
          {isEditable ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button
              onClick={() => setIsEditable(true)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
            >
              Edit
            </button>
          )}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          readOnly={!isEditable}
          className="w-full h-96 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white"
          placeholder={`# ${date} Learning Notes

## What did I learn today?

- [ ] Task 1
- [ ] Task 2

## Code Example

\`\`\`go
func main() {
    fmt.Println("Hello, Cloud Engineer!")
}
\`\`\`

## Notes

...`}
        />

      </div>
    </div>
  );
};

export default DayDetail;

