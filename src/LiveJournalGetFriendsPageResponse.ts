import { LiveJournalFriendsEventRaw } from "./LiveJournalFriendsEvent";


export type LiveJournalGetFriendsPageResponse = {
    skip: number;
    entries: LiveJournalFriendsEventRaw[];
};

