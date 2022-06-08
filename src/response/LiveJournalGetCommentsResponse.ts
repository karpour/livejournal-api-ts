import { convertLiveJournalComment, LiveJournalComment, LiveJournalCommentRaw } from "../types";

export type LiveJournalGetCommentsResponseBasicRaw = {
    comments: LiveJournalCommentRaw[];
    topitems: number;
    topitem_first: number;
    topitem_last: number;
    page_size: number;
    pages: number;
    page: number;
    ditemid: number;
};

export type LiveJournalGetCommentsResponseExtendedRaw = LiveJournalGetCommentsResponseBasicRaw & LiveJournalGetCommentsResponseExtendedExtra;
export type LiveJournalGetCommentsResponseRaw = LiveJournalGetCommentsResponseBasicRaw | LiveJournalGetCommentsResponseExtendedRaw;

export type LiveJournalGetCommentsResponseExtendedExtra = {
    items: number;
    skip: number;
    itemshow: number;
};

export type LiveJournalGetCommentsResponseExtra = {
    comments: LiveJournalComment[];
};

export type LiveJournalGetCommentsResponseBasic = Omit<LiveJournalGetCommentsResponseBasicRaw, keyof LiveJournalGetCommentsResponseExtra> & LiveJournalGetCommentsResponseExtra;
export type LiveJournalGetCommentsResponseExtended = LiveJournalGetCommentsResponseBasic & LiveJournalGetCommentsResponseExtendedExtra;
export type LiveJournalGetCommentsResponse = LiveJournalGetCommentsResponseBasic | LiveJournalGetCommentsResponseExtended;

export function convertLiveJournalGetCommentsResponse(resp: LiveJournalGetCommentsResponseRaw): LiveJournalGetCommentsResponse {
    return Object.assign(resp, {
        comments: resp.comments.map(convertLiveJournalComment)
    });
}