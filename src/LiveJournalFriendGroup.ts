import { convertLiveJournalApiBool, LiveJournalApiBool } from "./LiveJournalApiBool";
import { LiveJournalFriendGroupNumber } from "./LiveJournalFriendGroupNumber";

export type LiveJournalFriendGroupRaw = {
    /** Indicates whether a group is public (1) or private (0) */
    public: LiveJournalApiBool;
    /** Friend group name */
    name: string;
    /** Bit number assigned to a friend group (1 to 30) */
    id: LiveJournalFriendGroupNumber;
    /** Group number for sorting (from 0 to 255) */
    sortorder: number;
};

export type LiveJournalFriendGroupExtra = {
    /** Indicates whether a group is public (true) or private (false) */
    public: LiveJournalApiBool;
};


export type LiveJournalFriendGroup = Omit<LiveJournalFriendGroupRaw, keyof LiveJournalFriendGroupExtra> & LiveJournalFriendGroupExtra;

export function convertLiveJournalFriendGroup(friendGroupRaw: LiveJournalFriendGroupRaw): LiveJournalFriendGroup {
    return Object.assign({ ...friendGroupRaw }, { public: convertLiveJournalApiBool(friendGroupRaw.public) });
}
