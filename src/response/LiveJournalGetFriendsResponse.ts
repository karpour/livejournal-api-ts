import { LiveJournalFriend, LiveJournalFriendGroupInfo } from "../types/LiveJournalFriend";


export type LiveJournalGetFriendsResponse = {
    /** Array of descriptions for the user's Friends lis */
    friends: LiveJournalFriend[];
    /** Array of descriptions for users who friended the current user */
    friendofs?: LiveJournalFriend[];
    /** Array of descriptions for each user group */
    friendgroups?: LiveJournalFriendGroupInfo[];
};

export type ExplicitFriendOfs = {
    friendofs: LiveJournalFriend[];
};

export type ExplicitFriendGroups = {
    friendgroups: LiveJournalFriendGroupInfo[];
};

export type LiveJournalGetFriendsResponseWithFriendOfs = Omit<LiveJournalGetFriendsResponse, keyof ExplicitFriendOfs> & ExplicitFriendOfs;
export type LiveJournalGetFriendsResponseWithFriendGroups = Omit<LiveJournalGetFriendsResponse, keyof ExplicitFriendGroups> & ExplicitFriendGroups;
export type LiveJournalGetFriendsResponseWithFriendGroupsAndFriendOfs = Omit<LiveJournalGetFriendsResponse, keyof ExplicitFriendGroups |keyof ExplicitFriendOfs > & ExplicitFriendGroups & ExplicitFriendOfs;
