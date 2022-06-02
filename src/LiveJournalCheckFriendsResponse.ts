import { LiveJournalDateString } from "./LiveJournalDateString";

export type LiveJournalCheckFriendsResponse = {
    lastupdate: LiveJournalDateString;
    new: number;
};