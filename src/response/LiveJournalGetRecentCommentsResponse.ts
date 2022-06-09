import { LiveJournalRecentCommentRaw } from "../types/LiveJournalComment";

// TODO
export type LiveJournalGetRecentCommentsResponseRaw = {
    /** This displays function performance status.Set to “OK,” as long as the  function is performed successfully; */
    status: string;
    /** Comments */
    comments: LiveJournalRecentCommentRaw[];
};