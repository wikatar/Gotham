// Component for scheduling pipeline executions

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  commonCronExpressions, 
  getReadableCronDescription, 
  getNextExecutionTime 
} from '@/src/utils/cronUtils';

interface PipelineSchedulerProps {
  pipelineId: string;
  accountId: string;
  onScheduleSaved: () => void;
}

export default function PipelineScheduler({
  pipelineId,
  accountId,
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
  const handlePresetChange = (value: string) => {
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
          accountId,
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
        <Label htmlFor="schedule-type">Schedule Type</Label>
        <Select
          value={scheduleType}
          onValueChange={(value) => setScheduleType(value)}
        >
          <SelectTrigger id="schedule-type">
            <SelectValue placeholder="Select schedule type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preset">Preset</SelectItem>
            <SelectItem value="custom">Custom (Cron)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scheduleType === 'preset' ? (
        <div className="space-y-2">
          <Label htmlFor="preset">Frequency</Label>
          <Select
            onValueChange={handlePresetChange}
            defaultValue="everyDay"
          >
            <SelectTrigger id="preset">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyMinute">Every Minute</SelectItem>
              <SelectItem value="everyFiveMinutes">Every 5 Minutes</SelectItem>
              <SelectItem value="everyFifteenMinutes">Every 15 Minutes</SelectItem>
              <SelectItem value="everyThirtyMinutes">Every 30 Minutes</SelectItem>
              <SelectItem value="everyHour">Every Hour</SelectItem>
              <SelectItem value="everyDay">Every Day (Midnight)</SelectItem>
              <SelectItem value="everyDayAt8AM">Every Day (8 AM)</SelectItem>
              <SelectItem value="everyDayAtNoon">Every Day (Noon)</SelectItem>
              <SelectItem value="everyMonday">Every Monday</SelectItem>
              <SelectItem value="everyMonthFirstDay">First Day of Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="cron-expression">Cron Expression</Label>
          <Input
            id="cron-expression"
            value={cronExpression}
            onChange={handleCustomCronChange}
            placeholder="* * * * *"
          />
          <p className="text-xs text-gray-500">
            Format: minute hour day-of-month month day-of-week
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={active}
          onCheckedChange={setActive}
        />
        <Label htmlFor="active">Active</Label>
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