
export type LiveJournalUpdateCommentsOptions =
    ({
        journal: string;
    } | {
        journalid: string;
    }) & ({
        /** Comment ID */
        dtalkid: string;
    } | {
        /** Comma-separated comment IDs */
        dtalkids: string;
    }) & {
        action: 'screen' | 'unscreen' | 'freeze' | 'unfreeze' | 'unspam';
    };
