// Component for scheduling pipeline executions

import React, { useState } from 'react';
import Button from '../../app/components/ui/Button';

// Simple cron utilities since we don't have the external utils
const commonCronExpressions = {
  everyMinute: '* * * * *',
  everyFiveMinutes: '*/5 * * * *',
  everyFifteenMinutes: '*/15 * * * *',
  everyThirtyMinutes: '*/30 * * * *',
  everyHour: '0 * * * *',
  everyDay: '0 0 * * *',
  everyDayAt8AM: '0 8 * * *',
  everyDayAtNoon: '0 12 * * *',
  everyMonday: '0 0 * * 1',
  everyMonthFirstDay: '0 0 1 * *'
};

const getReadableCronDescription = (cron: string): string => {
  const descriptions: { [key: string]: string } = {
    '* * * * *': 'Every minute',
    '*/5 * * * *': 'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
    '0 * * * *': 'Every hour',
    '0 0 * * *': 'Every day at midnight',
    '0 8 * * *': 'Every day at 8 AM',
    '0 12 * * *': 'Every day at noon',
    '0 0 * * 1': 'Every Monday at midnight',
    '0 0 1 * *': 'First day of every month at midnight'
  };
  return descriptions[cron] || `Custom: ${cron}`;
};

const getNextExecutionTime = (cron: string): Date | null => {
  // Simple approximation - in a real app you'd use a proper cron parser
  const now = new Date();
  const next = new Date(now.getTime() + 60000); // Add 1 minute as approximation
  return next;
};

interface PipelineSchedulerProps {
  pipelineId: string;
  onScheduleSaved: () => void;
}

export default function PipelineScheduler({
  pipelineId,
  onScheduleSaved
}: PipelineSchedulerProps) {
  const [scheduleType, setScheduleType] = useState<string>('preset');
  const [cronExpression, setCronExpression] = useState<string>(commonCronExpressions.everyDay);
  const [active, setActive] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get the readable description and next execution time
  const readableDescription = getReadableCronDescription(cronExpression);
  const nextExecution = getNextExecutionTime(cronExpression);

  // Handle preset selection
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const expression = commonCronExpressions[value as keyof typeof commonCronExpressions] || value;
    setCronExpression(expression);
  };

  // Handle custom cron input
  const handleCustomCronChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronExpression(e.target.value);
  };

  // Save the schedule
  const saveSchedule = async () => {
    setError(null);
    setSaving(true);

    try {
      const response = await fetch('/api/pipeline/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pipelineId,
          cron: cronExpression,
          active
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save schedule');
      }

      onScheduleSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Schedule Pipeline</h3>
      
      <div className="space-y-2">
        <label htmlFor="schedule-type" className="block text-sm font-medium">Schedule Type</label>
        <select
          id="schedule-type"
          value={scheduleType}
          onChange={(e) => setScheduleType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="preset">Preset</option>
          <option value="custom">Custom (Cron)</option>
        </select>
      </div>

      {scheduleType === 'preset' ? (
        <div className="space-y-2">
          <label htmlFor="preset" className="block text-sm font-medium">Frequency</label>
          <select
            id="preset"
            onChange={handlePresetChange}
            defaultValue="everyDay"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="everyMinute">Every Minute</option>
            <option value="everyFiveMinutes">Every 5 Minutes</option>
            <option value="everyFifteenMinutes">Every 15 Minutes</option>
            <option value="everyThirtyMinutes">Every 30 Minutes</option>
            <option value="everyHour">Every Hour</option>
            <option value="everyDay">Every Day (Midnight)</option>
            <option value="everyDayAt8AM">Every Day (8 AM)</option>
            <option value="everyDayAtNoon">Every Day (Noon)</option>
            <option value="everyMonday">Every Monday</option>
            <option value="everyMonthFirstDay">First Day of Month</option>
          </select>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="cron-expression" className="block text-sm font-medium">Cron Expression</label>
          <input
            id="cron-expression"
            value={cronExpression}
            onChange={handleCustomCronChange}
            placeholder="* * * * *"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500">
            Format: minute hour day-of-month month day-of-week
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="text-sm font-medium">Active</label>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm font-medium">Summary</p>
        <p className="text-sm">{readableDescription}</p>
        {nextExecution && (
          <p className="text-sm text-gray-500">
            Next execution: {nextExecution.toLocaleString()}
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <Button
        onClick={saveSchedule}
        disabled={saving || !cronExpression}
        className="w-full"
      >
        {saving ? 'Saving...' : 'Save Schedule'}
      </Button>
    </div>
  );
} 