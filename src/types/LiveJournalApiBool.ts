
/** @internal */
export type LiveJournalApiBool = 0 | 1;

/** @internal */
export function convertLiveJournalApiBool(ljBool: LiveJournalApiBool | undefined): boolean {
    return ljBool ? true : false;
}

/** @internal */
export function convertToLiveJournalApiBool(bool: boolean | undefined): LiveJournalApiBool {
    return bool ? 1 : 0;
}
