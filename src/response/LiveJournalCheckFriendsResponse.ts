import { LiveJournalDateString } from "../types/LiveJournalDateString";

export type LiveJournalCheckFriendsResponse = {
    lastupdate: LiveJournalDateString;
    new: number;
};