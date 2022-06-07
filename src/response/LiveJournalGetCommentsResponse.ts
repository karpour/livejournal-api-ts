import { LiveJournalComment, LiveJournalCommentRaw } from "../types";

export type LiveJournalGetCommentsResponseRaw = {
    comments: LiveJournalCommentRaw[];
    topitems: number;
    topitem_first: number;
    topitem_last: number;
    page_size: number;
    pages: number;
    page: number;
    ditemid: number;
};

export type LiveJournalGetCommentsResponse = {
    comments: LiveJournalComment[];
    topitems: number;
    topitem_first: number;
    topitem_last: number;
    page_size: number;
    pages: number;
    page: number;
    ditemid: number;
};

/*
$extra{items} = LJ::Talk::get_replycount($journal, $jitem->{jitemid});
$itemshow = $extra{items} unless ($itemshow && $itemshow <= $extra{items});
@comments = splice(@comments, $skip, $itemshow);
$extra{skip} = $skip;
$extra{itemshow} = $itemshow;
*/