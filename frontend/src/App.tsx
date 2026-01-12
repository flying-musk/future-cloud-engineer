import { useState, useEffect } from 'react';
import FullYearCalendar from './components/FullYearCalendar';
import DayDetail from './components/DayDetail';
import { getAllDays } from './api';
import { DayRecord } from './types';

function App() {
  // Initialize with today's date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayDate());
  const [days, setDays] = useState<DayRecord[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    loadDays();
  }, []);

  const loadDays = async () => {
    try {
      const data = await getAllDays();
      setDays(data);
    } catch (error) {
      console.error('Failed to load days:', error);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleDayUpdate = () => {
    loadDays();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Hello, Future Cloud Engineer!
          </h1>
          <p className="text-xl text-gray-600">
            On my way to growing into a cloud engineer...
          </p>
        </header>

        <div className="mb-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentYear(currentYear - 1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
          >
            ←
          </button>
          <h2 className="text-3xl font-semibold text-gray-800">{currentYear}</h2>
          <button
            onClick={() => setCurrentYear(currentYear + 1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
          >
            →
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const todayYear = today.getFullYear();
              const todayDate = `${todayYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              setCurrentYear(todayYear);
              setSelectedDate(todayDate);
            }}
            className="ml-4 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FullYearCalendar
              year={currentYear}
              days={days}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              onDayUpdate={handleDayUpdate}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {selectedDate ? `${selectedDate}` : 'Select a date'}
              </h2>
              {selectedDate ? (
                <DayDetail
                  date={selectedDate}
                  dayRecord={days.find(d => d.date === selectedDate)}
                  onUpdate={handleDayUpdate}
                />
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <p>Click on a date to view or edit your learning notes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

