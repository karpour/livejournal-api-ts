export function addDays(date: Date, days: number): Date {
    return new Date(date.valueOf() + (days * 86400000));
}
