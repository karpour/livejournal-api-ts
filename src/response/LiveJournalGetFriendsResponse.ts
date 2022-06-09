import { Replace } from "../Replace";
import { convertLiveJournalFriend, convertLiveJournalFriendGroup, LiveJournalFriend, LiveJournalFriendGroup, LiveJournalFriendGroupRaw, LiveJournalFriendRaw } from "../types";

export type LiveJournalGetFriendsResponse = {
    /** Array of descriptions for the user's Friends list */
    friends: LiveJournalFriend[];
    /** Array of descriptions for users who friended the current user */
    friendofs?: LiveJournalFriend[];
    /** Array of descriptions for each user group */
    friendgroups?: LiveJournalFriendGroup[];
};

export type LiveJournalGetFriendsResponseWithFriendOfs = Omit<LiveJournalGetFriendsResponse, keyof ExplicitFriendOfs> & ExplicitFriendOfs;
export type LiveJournalGetFriendsResponseWithFriendGroups = Omit<LiveJournalGetFriendsResponse, keyof ExplicitFriendGroups> & ExplicitFriendGroups;
export type LiveJournalGetFriendsResponseWithFriendGroupsAndFriendOfs = Omit<LiveJournalGetFriendsResponse, keyof ExplicitFriendGroups | keyof ExplicitFriendOfs> & ExplicitFriendGroups & ExplicitFriendOfs;

/**
 * @internal
 */
export type LiveJournalGetFriendsResponseRaw = Replace<LiveJournalGetFriendsResponse, {
    /** Array of descriptions for the user's Friends list */
    friends: LiveJournalFriendRaw[];
    /** Array of descriptions for users who friended the current user */
    friendofs?: LiveJournalFriendRaw[];
    /** Array of descriptions for each user group */
    friendgroups?: LiveJournalFriendGroupRaw[];
}>;

/**
 * @internal
 */
type ExplicitFriendOfs = {
    friendofs: LiveJournalFriend[];
};

/**
 * @internal
 */
type ExplicitFriendGroups = {
    friendgroups: LiveJournalFriendGroup[];
};

/**
 * @internal
 */
export function convertLiveJournalGetFriendsResponse(resp: LiveJournalGetFriendsResponseRaw): LiveJournalGetFriendsResponse {
    const cv: LiveJournalGetFriendsResponse = {
        friends: resp.friends.map(convertLiveJournalFriend)
    };
    if (resp.friendofs) cv.friendofs = resp.friendofs.map(convertLiveJournalFriend);
    if (resp.friendgroups) cv.friendgroups = resp.friendgroups.map(convertLiveJournalFriendGroup);
    return cv;
}