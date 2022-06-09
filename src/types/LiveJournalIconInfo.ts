export type LiveJournalIconInfo = LiveJournalIconInfoUrl & LiveJournalIconInfoDetails;

export type LiveJournalIconInfoUrl = {
    url: string;
};

export type LiveJournalIconInfoDetails = {
    user_id: number;
    icon_id: number;
    is_default: boolean;
    keywords: string[];
    description?: string;
};