export type LiveJournalSessionGenerateResponseRaw = {
    ljsession: string;
};

export type LiveJournalSessionGenerateResponse = LiveJournalSessionGenerateResponseRaw & {
    expires: Date;
};