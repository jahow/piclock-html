/**
 * @param {Date} date
 * @return {number} ratio of time passed in the day (0 to 1)
 */
export function getRatioOfTimeInDay(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return (date - startOfDay) / (endOfDay - startOfDay);
}
