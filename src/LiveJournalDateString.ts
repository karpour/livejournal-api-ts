/** Date in the format "YYYY-MM-DD hh:mm:ss" */

export type LiveJournalDateString = `${number}${number}${number}${number}-${number}${number}-${number}${number} ${number}${number}:${number}${number}:${number}${number}`;

export function convertToLiveJournalDateString(date: Date): LiveJournalDateString {
    return date.toISOString().replace('T', " ").split('.')[0] as LiveJournalDateString;
}