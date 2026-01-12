import { useState } from 'react';
import { DayRecord } from '../types';
import { updateDay } from '../api';

interface FullYearCalendarProps {
  year: number;
  days: DayRecord[];
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
  onDayUpdate: () => void;
}

const FullYearCalendar: React.FC<FullYearCalendarProps> = ({
  year,
  days,
  onDateSelect,
  selectedDate,
  onDayUpdate,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Create a map of dates to day records for quick lookup
  const daysMap: Record<string, DayRecord> = {};
  days.forEach(day => {
    daysMap[day.date] = day;
  });

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (year: number, month: number): (string | null)[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const daysArray: (string | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(new Date(year, month, day));
      daysArray.push(dateStr);
    }

    return daysArray;
  };

  const today = formatDate(new Date());

  const handleCheckboxChange = async (e: React.MouseEvent<HTMLInputElement>, date: string) => {
    e.stopPropagation(); // Prevent date selection when clicking checkbox
    
    const dayRecord = daysMap[date];
    const newCompleted = !dayRecord?.completed;

    try {
      await updateDay(date, { completed: newCompleted });
      onDayUpdate();
    } catch (error) {
      console.error('Failed to update completion status:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-3 gap-6">
        {monthNames.map((monthName, monthIndex) => {
          const daysArray = getDaysInMonth(year, monthIndex);
          const isCurrentMonth = year === new Date().getFullYear() && monthIndex === new Date().getMonth();

          return (
            <div key={monthIndex} className="mb-6">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                {monthName}
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-medium text-gray-500 text-center py-1"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {daysArray.map((date, index) => {
                  if (date === null) {
                    return (
                      <div
                        key={`empty-${monthIndex}-${index}`}
                        className="aspect-square"
                      />
                    );
                  }

                  const dayRecord = daysMap[date];
                  const isCompleted = dayRecord?.completed || false;
                  const isSelected = selectedDate === date;
                  const isToday = date === today;
                  const isCurrentMonthDate = date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`);

                  // Extract day number from date string (YYYY-MM-DD format)
                  const dayNumber = parseInt(date.split('-')[2], 10);

                  return (
                    <div
                      key={date}
                      className={`
                        aspect-square relative border border-gray-200 rounded
                        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}
                        ${isToday ? 'ring-1 ring-indigo-400' : ''}
                        ${!isCurrentMonthDate ? 'opacity-40' : ''}
                        cursor-pointer transition-all
                      `}
                      onClick={() => onDateSelect(date)}
                    >
                      <div className="flex items-center justify-between h-full p-1">
                        <span
                          className={`
                            text-xs font-medium
                            ${isToday ? 'text-indigo-600 font-bold' : 'text-gray-700'}
                            ${!isCurrentMonthDate ? 'text-gray-400' : ''}
                          `}
                        >
                          {dayNumber}
                        </span>
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onClick={(e) => handleCheckboxChange(e, date)}
                          className="w-3 h-3 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-indigo-400 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-gray-200 rounded bg-green-50 relative">
            <span className="absolute top-0 right-0 text-green-500 text-xs">✓</span>
          </div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default FullYearCalendar;

