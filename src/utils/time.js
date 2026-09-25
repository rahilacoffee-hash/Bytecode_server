export function addMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function addHours(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function addDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function isExpired(date) {
  return new Date(date).getTime() <= Date.now();
}