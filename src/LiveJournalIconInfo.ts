export type LiveJournalIconInfo = LiveJournalIconInfoUrl & LiveJournalIconInfoDetails;

export type LiveJournalIconInfoUrl = {
    url: string;
};

export type LiveJournalIconInfoDetails = {
    isdefault: boolean;
    keywords: string[];
    description?: string;
};