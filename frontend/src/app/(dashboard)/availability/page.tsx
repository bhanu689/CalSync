'use client';

import { useAvailabilities, useUpdateAvailability } from '@/queries/useAvailability';
import { WeeklyScheduleEditor } from '@/components/availability/WeeklyScheduleEditor';
import { DateOverrideEditor } from '@/components/availability/DateOverrideEditor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DaySchedule, DateOverride } from '@/types';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function AvailabilityPage() {
  const { data: availabilities, isLoading } = useAvailabilities();
  const { mutate: update, isPending } = useUpdateAvailability();

  const defaultAvailability = availabilities?.find((a) => a.isDefault) || availabilities?.[0];

  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);

  useEffect(() => {
    if (defaultAvailability) {
      setWeeklySchedule(defaultAvailability.weeklySchedule);
      setDateOverrides(defaultAvailability.dateOverrides);
    }
  }, [defaultAvailability]);

  const handleSave = () => {
    if (!defaultAvailability) return;
    update({
      id: defaultAvailability.id,
      weeklySchedule,
      dateOverrides,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set your weekly hours and add date-specific overrides.
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isPending}>
          Save Changes
        </Button>
      </div>

      {!defaultAvailability ? (
        <Card className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No availability schedule found.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Hours</h2>
            <WeeklyScheduleEditor
              schedule={weeklySchedule}
              onChange={setWeeklySchedule}
            />
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Overrides</h2>
            <p className="text-sm text-gray-500 mb-4">
              Override your availability for specific dates.
            </p>
            <DateOverrideEditor
              overrides={dateOverrides}
              onChange={setDateOverrides}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
