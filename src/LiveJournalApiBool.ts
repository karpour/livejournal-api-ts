
export type LiveJournalApiBool = 0 | 1;

export function convertLiveJournalApiBool(ljBool: LiveJournalApiBool | undefined): boolean {
    return ljBool ? true : false;
}


export function convertToLiveJournalApiBool(bool: boolean | undefined): LiveJournalApiBool {
    return bool ? 1 : 0;
}
