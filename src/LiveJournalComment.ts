import { LiveJournalDateString } from "./LiveJournalDateString";

export type LiveJournalCommentRaw = {
    /** Internal identifier of a parent reply */
    parentdtalkid: number,
    /** Thread count */
    thread_count: number,
    /** Reply author ID */
    posterid: number,
    /** 
     * Reply status. Available options are:
     *   F for frozen
     *   S for secure
     *   A for active (not frozen, secure or deleted)
     *   D for deleted 
     */
    state: 'F' | 'S' | 'A' | 'D',
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
}