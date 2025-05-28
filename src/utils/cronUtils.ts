// Utilities for working with cron expressions

/**
 * Check if a cron expression matches the current time
 * 
 * @param cronExpression - Cron expression (e.g. "0 8 * * *" for 8 AM daily)
 * @param date - Date to check against, defaults to current time
 * @returns boolean - Whether the cron expression matches the date
 */
export function cronMatches(cronExpression: string, date: Date = new Date()): boolean {
  // Parse cron expression
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');
  
  // Extract date components
  const currentMinute = date.getMinutes();
  const currentHour = date.getHours();
  const currentDayOfMonth = date.getDate();
  const currentMonth = date.getMonth() + 1; // JavaScript months are 0-indexed
  const currentDayOfWeek = date.getDay() || 7; // JavaScript days are 0-indexed (0 = Sunday), convert to 1-indexed (1 = Monday, 7 = Sunday)
  
  // Check each component
  return (
    matchesCronPart(minute, currentMinute) &&
    matchesCronPart(hour, currentHour) &&
    matchesCronPart(dayOfMonth, currentDayOfMonth) &&
    matchesCronPart(month, currentMonth) &&
    matchesCronPart(dayOfWeek, currentDayOfWeek)
  );
}

/**
 * Check if a cron expression part matches a value
 */
function matchesCronPart(cronPart: string, value: number): boolean {
  // Handle wildcards
  if (cronPart === '*') {
    return true;
  }
  
  // Handle ranges (e.g. "1-5")
  if (cronPart.includes('-')) {
    const [start, end] = cronPart.split('-').map(Number);
    return value >= start && value <= end;
  }
  
  // Handle lists (e.g. "1,3,5")
  if (cronPart.includes(',')) {
    const values = cronPart.split(',').map(Number);
    return values.includes(value);
  }
  
  // Handle steps (e.g. "*/15")
  if (cronPart.includes('/')) {
    const [range, step] = cronPart.split('/');
    const numStep = Number(step);
    
    // If range is "*", check if value is divisible by step
    if (range === '*') {
      return value % numStep === 0;
    }
    
    // Otherwise, check if value is in range and divisible by step
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number);
      return value >= start && value <= end && (value - start) % numStep === 0;
    }
  }
  
  // Handle simple values
  return Number(cronPart) === value;
}

/**
 * Get a human-readable description of a cron expression
 * 
 * @param cronExpression - Cron expression
 * @returns string - Human-readable description
 */
export function getReadableCronDescription(cronExpression: string): string {
  // This is a simplified implementation - a real one would be more comprehensive
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');
  
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every minute';
  }
  
  if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every hour';
  }
  
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every day at midnight';
  }
  
  if (minute === '0' && hour === '8' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every day at 8 AM';
  }
  
  if (minute === '0' && hour === '12' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every day at noon';
  }
  
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '1') {
    return 'Every Monday at midnight';
  }
  
  return cronExpression; // Fallback to raw expression
}

/**
 * Get next execution time for a cron expression
 * 
 * @param cronExpression - Cron expression
 * @param fromDate - Reference date, defaults to current time
 * @returns Date - Next execution time 
 */
export function getNextExecutionTime(cronExpression: string, fromDate: Date = new Date()): Date | null {
  // This is a simplified implementation that only checks the next 365 days
  const maxIterations = 365 * 24 * 60; // Check up to 1 year ahead (minutes)
  
  const testDate = new Date(fromDate);
  
  for (let i = 0; i < maxIterations; i++) {
    // Add one minute
    testDate.setMinutes(testDate.getMinutes() + 1);
    
    if (cronMatches(cronExpression, testDate)) {
      return testDate;
    }
  }
  
  return null; // Couldn't find a match in the reasonable future
}

/**
 * Common cron expressions
 */
export const commonCronExpressions = {
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