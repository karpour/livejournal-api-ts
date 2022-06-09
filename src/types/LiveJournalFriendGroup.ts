import { Replace } from "../Replace";
import { convertLiveJournalApiBool, LiveJournalApiBool } from "./LiveJournalApiBool";
import { LiveJournalFriendGroupNumber } from "./LiveJournalFriendGroupNumber";

export type LiveJournalFriendGroup = {
    /** bit number assigned to a friend group (1 to 30) */
    id: LiveJournalFriendGroupNumber;
    /** Friend group name */
    name: string;
    /** Group number for sorting (from 0 to 255) */
    sortorder: number;
    /* Indicates whether a group is public */
    public: boolean;
};

/** @internal */
export type LiveJournalFriendGroupRaw = Replace<LiveJournalFriendGroup, {
    /** Indicates whether a group is public (1) or private (0) */
    public: LiveJournalApiBool;
}>;

/** @internal */
export function convertLiveJournalFriendGroup(friendGroupRaw: LiveJournalFriendGroupRaw): LiveJournalFriendGroup {
    return { ...friendGroupRaw, public: convertLiveJournalApiBool(friendGroupRaw.public) };
}
