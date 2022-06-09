
export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export function* createYearMonthGenerator(startDate: Date, endDate: Date): Generator<{ year: number; month: MonthNumber; }> {
    const startMonth = startDate.getMonth() + 1;
    const startYear = startDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const endYear = endDate.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
        for (let month = year == startYear ? startMonth : 1; month <= 12 && !(year == endYear && month > endMonth); month++) {
            yield {
                year: year,
                month: month as MonthNumber
            };
        }
    }
}