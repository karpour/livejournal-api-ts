/** Date in the format "YYYY-MM-DD hh:mm:ss" */

/** @internal */
export type LiveJournalDateString = string;
//export type LiveJournalDateString = `${number}${number}${number}${number}-${number}${number}-${number}${number} ${number}${number}:${number}${number}:${number}${number}`;

/** @internal */
export function convertToLiveJournalDateString(date: Date): LiveJournalDateString {
    return date.toISOString().replace('T', " ").split('.')[0] as LiveJournalDateString;
}

/** @internal */
export function convertLiveJournalDateString(ljDateString: LiveJournalDateString): Date {
    return new Date(ljDateString);
}