import {
    convertToLiveJournalApiBool,
    LiveJournalApiBool
} from "../types";

export type LiveJournalGetFriendsOptions = {
    /** When set to true, returns information on users who friended the current user */
    includefriendof?: boolean;
    /** When set to true, returns information on friends groups */
    includegroups?: boolean;
    /** When set to true, returns birthday of each user */
    includebdays?: boolean;
    /** Number of friend descriptions required */
    friendlimit?: number;
    /** Number of friend descriptions to be retrieved; used when the includefriendof parameter is set to true */
    friendoflimit?: number;
};

export type LiveJournalGetFriendsOptionsIncludeGroups = LiveJournalGetFriendsOptions & {
    /** When set to true, returns information on friends groups */
    includegroups: true;
};

export type LiveJournalGetFriendsOptionsIncludeFriendOf = LiveJournalGetFriendsOptions & {
    /** When set to true, returns information on friends groups */
    includefriendof: true;
};

export type LiveJournalGetFriendsOptionsExtra = {
    /** When set to true, returns information on users who friended the current user */
    includefriendof?: LiveJournalApiBool;
    /** When set to true, returns information on friends groups */
    includegroups?: LiveJournalApiBool;
    /** When set to true, returns birthday of each user */
    includebdays?: LiveJournalApiBool;
};

export function convertLiveJournalGetFriendsOptions(params: LiveJournalGetFriendsOptions): LiveJournalGetFriendsOptionsRaw {
    return Object.assign<LiveJournalGetFriendsOptions, LiveJournalGetFriendsOptionsExtra>(
        params, {
        includefriendof: convertToLiveJournalApiBool(params.includefriendof),
        includegroups: convertToLiveJournalApiBool(params.includegroups),
        includebdays: convertToLiveJournalApiBool(params.includebdays)
    });
}

export type LiveJournalGetFriendsOptionsRaw = Omit<LiveJournalGetFriendsOptions, keyof LiveJournalGetFriendsOptionsExtra> & LiveJournalGetFriendsOptionsExtra;
