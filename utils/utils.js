export function stripSeconds(dateInput) {
  const date = new Date(dateInput);
  date.setSeconds(0, 0);
  return date;
}