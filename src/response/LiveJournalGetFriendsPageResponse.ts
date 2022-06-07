import { LiveJournalFriendsEventRaw } from "../types/LiveJournalFriendsEvent";

export type LiveJournalGetFriendsPageResponse = {
    skip: number;
    entries: LiveJournalFriendsEventRaw[];
};

