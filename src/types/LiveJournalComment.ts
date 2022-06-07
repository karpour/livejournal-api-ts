import { LiveJournalDateString } from "./LiveJournalDateString";

/** 
 * Reply status. Available options are:
 * 
 *   F for frozen
 *   S for secure
 *   A for active (not frozen, secure or deleted)
 *   D for deleted 
 */
export type LiveJournalCommentState = 'F' | 'S' | 'A' | 'D';

export type LiveJournalCommentRaw = {
    /** Internal identifier of a parent reply */
    parentdtalkid: number,
    /** Thread count */
    thread_count: number,
    /** Reply author ID */
    posterid: number,
    /** 
     * Reply status. Available options are:
     * 
     *   F for frozen 
     *   S for secure
     *   A for active (not frozen, secure or deleted)
     *   D for deleted 
     */
    state: LiveJournalCommentState,
    /** Reply text */
    body: string,
    /**  */
    level: number,
    /** Comment ID */
    dtalkid: number,
    /**  */
    is_show: number,
    /** Name of a reply author */
    postername: string,
    /**  */
    real_level: number | '',
    /**  */
    datepost: LiveJournalDateString,
    /**  */
    is_loaded: number,
    /** Unix-time of reply posting */
    datepostunix: number,
};


export type LiveJournalRecentCommentRaw = {
    /** Reply subject  */
    subject: string;
    /** Reply author ID  */
    posterid: number;
    /** Reply status. Available options are: 
     * F for frozen
     * S for secure
     * A for active (not frozen, secure or deleted)
     * D for deleted 
     */
    state: LiveJournalCommentState;
    /** Reply internal identifier */
    jtalkid: number;
    /** Internal identifier of a parent reply */
    parenttalkid: number;
    /** Name of a reply author */
    postername: string;
    /** Reply text */
    text: string;
    /** Reserved for future use, currently set to "L" */
    nodetype: 'L';
    /**  */
    nodeid: number;
    /** Unix-time of reply posting */
    datepostunix: number;
    /** Unix-time of reply posting */
    datepost_unix: number;
    /** Userpic url of poster */
    poster_userpic_url: string;
    /** Date that this comment was posted on */
    datepost: LiveJournalDateString;
};

export type LiveJournalComment = {
    /** Reply subject  */
    subject?: string;
    /** Internal identifier of a parent reply */
    parentdtalkid: number,
    /** Thread count */
    thread_count?: number,
    /** Reply author ID */
    posterid: number,
    /** 
     * Reply status. Available options are:
     *   F for frozen
     *   S for secure
     *   A for active (not frozen, secure or deleted)
     *   D for deleted 
     */
    state: LiveJournalCommentState,
    /** Reply text */
    text: string,
    /**  */
    level?: number,
    /** Comment ID */
    dtalkid?: number,
    /**  */
    is_show?: number,
    /** Name of a reply author */
    postername: string,
    /**  */
    real_level?: number,
    /** Date that the comment was posted on */
    datepost: Date,
    /**  */
    is_loaded?: number,
    /** Unix-time of reply posting */
    datepostunix: number,
    /** Userpic url of poster */
    poster_userpic_url?: string;
    /** Reply internal identifier */
    jtalkid?: number;
};



export function convertLiveJournalComment(comment: LiveJournalCommentRaw): LiveJournalComment {
    return {
        parentdtalkid: comment.parentdtalkid,
        thread_count: comment.thread_count,
        posterid: comment.posterid,
        state: comment.state,
        text: comment.body,
        level: comment.level,
        dtalkid: comment.dtalkid,
        is_show: comment.is_show,
        postername: comment.postername,
        real_level: comment.real_level == '' ? undefined : comment.real_level,
        datepost: new Date(comment.datepost),
        is_loaded: comment.is_loaded,
        datepostunix: comment.datepostunix,
    };
}

export function convertLiveJournalRecentComment(comment: LiveJournalRecentCommentRaw): LiveJournalComment {
    return {
        parentdtalkid: comment.parenttalkid,
        posterid: comment.posterid,
        state: comment.state,
        text: comment.text,
        jtalkid: comment.jtalkid,
        postername: comment.postername,
        datepost: new Date(comment.datepost),
        datepostunix: comment.datepostunix,
        poster_userpic_url: comment.poster_userpic_url
    };
}