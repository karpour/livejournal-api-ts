import { convertLiveJournalFriendsEvent, LiveJournalFriendsEvent, LiveJournalFriendsEventRaw } from "../types";

export type LiveJournalGetFriendsPageResponseRaw = {
    skip: number;
    entries: LiveJournalFriendsEventRaw[];
};

export type LiveJournalGetFriendsPageResponse = {
    skip: number;
    entries: LiveJournalFriendsEvent[];
};

export function convertLiveJournalGetFriendsPageResponse(resp: LiveJournalGetFriendsPageResponseRaw): LiveJournalGetFriendsPageResponse {
    return {
        skip: resp.skip,
        entries: resp.entries.map((e: any) => convertLiveJournalFriendsEvent(e)),
    };
}
