import { convertLiveJournalDateString } from "../types";
import { LiveJournalDateString } from "../types/LiveJournalDateString";

export type LiveJournalCheckFriendsResponseRaw = {
    lastupdate: LiveJournalDateString;
    new: number;
};

export type LiveJournalCheckFriendsResponse = {
    lastupdate: Date;
    new: number;
};

export function convertLiveJournalCheckFriendsResponse(resp: LiveJournalCheckFriendsResponseRaw): LiveJournalCheckFriendsResponse {
    return {
        lastupdate: convertLiveJournalDateString(resp.lastupdate),
        new: resp.new
    };
}