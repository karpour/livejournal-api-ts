export type LiveJournalGetDayCountsResponseRaw = {
    daycounts: LiveJournalDayCountObject[];
};

export type LiveJournalDayCountObject = {
    /** Date in YYYY-MM-DD format */
    date: string;
    /** Number of LJ-entries for the date specified in the date key */
    count: number;
};