import { DayRecord } from './types';

const API_BASE = '/api';

export const getAllDays = async (): Promise<DayRecord[]> => {
  const response = await fetch(`${API_BASE}/days`);
  if (!response.ok) {
    throw new Error('Failed to fetch days');
  }
  return response.json();
};

export const getDayByDate = async (date: string): Promise<DayRecord> => {
  const response = await fetch(`${API_BASE}/days/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch day');
  }
  return response.json();
};

export const createDay = async (day: DayRecord): Promise<DayRecord> => {
  const response = await fetch(`${API_BASE}/days`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(day),
  });
  if (!response.ok) {
    throw new Error('Failed to create day');
  }
  return response.json();
};

export const updateDay = async (date: string, day: Partial<DayRecord>): Promise<DayRecord> => {
  const response = await fetch(`${API_BASE}/days/${date}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(day),
  });
  if (!response.ok) {
    throw new Error('Failed to update day');
  }
  return response.json();
};

