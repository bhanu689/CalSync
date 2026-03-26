'use client';

import { DaySchedule, TimeSlot } from '@/types';
import { Plus, X } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface WeeklyScheduleEditorProps {
  schedule: DaySchedule[];
  onChange: (schedule: DaySchedule[]) => void;
}

export function WeeklyScheduleEditor({ schedule, onChange }: WeeklyScheduleEditorProps) {
  const updateDay = (dayIndex: number, updates: Partial<DaySchedule>) => {
    const newSchedule = schedule.map((day) =>
      day.day === dayIndex ? { ...day, ...updates } : day
    );
    onChange(newSchedule);
  };

  const toggleDay = (dayIndex: number) => {
    const day = schedule.find((d) => d.day === dayIndex)!;
    updateDay(dayIndex, {
      enabled: !day.enabled,
      slots: !day.enabled && day.slots.length === 0 ? [{ start: '09:00', end: '17:00' }] : day.slots,
    });
  };

  const addSlot = (dayIndex: number) => {
    const day = schedule.find((d) => d.day === dayIndex)!;
    const lastSlot = day.slots[day.slots.length - 1];
    const newStart = lastSlot ? lastSlot.end : '09:00';
    const newEnd = lastSlot ? incrementTime(lastSlot.end, 60) : '17:00';
    updateDay(dayIndex, { slots: [...day.slots, { start: newStart, end: newEnd }] });
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const day = schedule.find((d) => d.day === dayIndex)!;
    const newSlots = day.slots.filter((_, i) => i !== slotIndex);
    updateDay(dayIndex, { slots: newSlots, enabled: newSlots.length > 0 ? day.enabled : false });
  };

  const updateSlot = (dayIndex: number, slotIndex: number, field: keyof TimeSlot, value: string) => {
    const day = schedule.find((d) => d.day === dayIndex)!;
    const newSlots = day.slots.map((slot, i) =>
      i === slotIndex ? { ...slot, [field]: value } : slot
    );
    updateDay(dayIndex, { slots: newSlots });
  };

  return (
    <div className="space-y-2">
      {schedule.map((day) => (
        <div
          key={day.day}
          className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
            day.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
          }`}
        >
          {/* Day toggle */}
          <div className="flex items-center gap-3 w-32 flex-shrink-0 pt-1.5">
            <button
              type="button"
              onClick={() => toggleDay(day.day)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                day.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  day.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${day.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
              {DAY_NAMES[day.day].slice(0, 3)}
            </span>
          </div>

          {/* Slots */}
          <div className="flex-1">
            {day.enabled ? (
              <div className="space-y-2">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateSlot(day.day, slotIndex, 'start', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateSlot(day.day, slotIndex, 'end', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(day.day, slotIndex)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSlot(day.day)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add time slot
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 pt-1.5">Unavailable</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function incrementTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
