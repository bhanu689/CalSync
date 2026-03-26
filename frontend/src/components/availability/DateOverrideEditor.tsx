'use client';

import { DateOverride } from '@/types';
import { Plus, X, Calendar } from 'lucide-react';
import { useState } from 'react';

interface DateOverrideEditorProps {
  overrides: DateOverride[];
  onChange: (overrides: DateOverride[]) => void;
}

export function DateOverrideEditor({ overrides, onChange }: DateOverrideEditorProps) {
  const [newDate, setNewDate] = useState('');

  const addOverride = () => {
    if (!newDate) return;
    if (overrides.some((o) => o.date === newDate)) return;

    onChange([
      ...overrides,
      { date: newDate, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    ]);
    setNewDate('');
  };

  const removeOverride = (date: string) => {
    onChange(overrides.filter((o) => o.date !== date));
  };

  const toggleOverride = (date: string) => {
    onChange(
      overrides.map((o) =>
        o.date === date ? { ...o, enabled: !o.enabled } : o
      )
    );
  };

  const updateSlot = (date: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    onChange(
      overrides.map((o) =>
        o.date === date
          ? {
              ...o,
              slots: o.slots.map((s, i) => (i === slotIndex ? { ...s, [field]: value } : s)),
            }
          : o
      )
    );
  };

  const addSlot = (date: string) => {
    onChange(
      overrides.map((o) =>
        o.date === date
          ? { ...o, slots: [...o.slots, { start: '09:00', end: '17:00' }] }
          : o
      )
    );
  };

  const removeSlot = (date: string, slotIndex: number) => {
    onChange(
      overrides.map((o) =>
        o.date === date
          ? { ...o, slots: o.slots.filter((_, i) => i !== slotIndex) }
          : o
      )
    );
  };

  const sortedOverrides = [...overrides].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      {/* Add new override */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={addOverride}
          disabled={!newDate}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Override
        </button>
      </div>

      {/* Override list */}
      {sortedOverrides.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          No date overrides. Add specific dates with custom hours or mark them as unavailable.
        </p>
      ) : (
        <div className="space-y-2">
          {sortedOverrides.map((override) => (
            <div
              key={override.date}
              className={`p-3 rounded-lg border transition-colors ${
                override.enabled ? 'bg-white border-gray-200' : 'bg-red-50 border-red-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(override.date)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleOverride(override.date)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      override.enabled
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {override.enabled ? 'Available' : 'Day Off'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeOverride(override.date)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {override.enabled && (
                <div className="space-y-2 ml-0">
                  {override.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateSlot(override.date, slotIndex, 'start', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateSlot(override.date, slotIndex, 'end', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {override.slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(override.date, slotIndex)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(override.date)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    Add time slot
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
