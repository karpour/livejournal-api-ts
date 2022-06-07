import { convertLiveJournalFriendGroup, LiveJournalFriendGroup, LiveJournalFriendGroupRaw } from "../types/LiveJournalFriendGroup";

export type LiveJournalGetFriendGroupsResponse = {
    friendgroups: LiveJournalFriendGroup[];
};

export type LiveJournalGetFriendGroupsResponseRaw = {
    friendgroups: LiveJournalFriendGroupRaw[];
};

export function convertGetFriendGroupsResponse(response: LiveJournalGetFriendGroupsResponseRaw): LiveJournalGetFriendGroupsResponse {
    return {
        friendgroups: response.friendgroups.map(convertLiveJournalFriendGroup)
    };
}