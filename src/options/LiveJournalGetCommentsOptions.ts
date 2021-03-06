import { convertToLiveJournalApiBool, LiveJournalApiBool } from "../types";

/**
 * @internal
 */
export type LiveJournalGetCommentsOptionsRaw =
    LiveJournalGetCommentsOptionsBasicRaw
    & LiveJournalGetCommentsOptionsJournalId
    & LiveJournalGetCommentsOptionsItemId;


// TODO check if it's usejournal or journal for the journal name param
export type LiveJournalGetCommentsOptionsJournalId = {
    usejournal: string;
} | {
    journalid: number;
};

export type LiveJournalGetCommentsOptionsItemId = {
    itemid: number;
} | {
    ditemid: number;
};

export type LiveJournalGetCommentsOptionsBasicRaw = {
    dtalkid: number;
    page_size?: number;
    expand_strategy?: 'mobile' | 'mobile_thread' | 'expand_all' | 'by_level' | 'detailed' | 'default';
    //format?: 'thread' | 'list';
    expand_child?: number;
    expand_level?: number;
    get_users_info?: LiveJournalApiBool;
    asxml?: LiveJournalApiBool;
    extra?: LiveJournalApiBool;
    calculate_count?: LiveJournalApiBool;
    only_loaded?: LiveJournalApiBool;
};

export type LiveJournalGetCommentsOptionsFormatThread = {
    format?: 'thread';
};

export type LiveJournalGetCommentsOptionsFormatList = {
    format: 'list';
};

export type LiveJournalGetCommentsOptionsExtra = {
    get_users_info?: boolean;
    asxml?: boolean;
    extra?: boolean;
    calculate_count?: boolean;
    only_loaded?: boolean;
};

export type LiveJournalGetCommentsOptionsBasic = Omit<LiveJournalGetCommentsOptionsBasicRaw, keyof LiveJournalGetCommentsOptionsExtra>
    & LiveJournalGetCommentsOptionsExtra
    & LiveJournalGetCommentsOptionsJournalId
    & LiveJournalGetCommentsOptionsItemId;

export type LiveJournalGetCommentsOptionsThread = LiveJournalGetCommentsOptionsBasic & LiveJournalGetCommentsOptionsFormatThread;
export type LiveJournalGetCommentsOptionsList = LiveJournalGetCommentsOptionsBasic & LiveJournalGetCommentsOptionsFormatList;

export type LiveJournalGetCommentsOptions = LiveJournalGetCommentsOptionsThread | LiveJournalGetCommentsOptionsList;

/**
 * @internal
 */
export function convertLiveJournalGetCommentsOptions(options: LiveJournalGetCommentsOptions): LiveJournalGetCommentsOptionsRaw {
    return {
        ...options,
        get_users_info: convertToLiveJournalApiBool(options.get_users_info),
        asxml: convertToLiveJournalApiBool(options.asxml),
        extra: convertToLiveJournalApiBool(options.extra),
        calculate_count: convertToLiveJournalApiBool(options.calculate_count),
        only_loaded: convertToLiveJournalApiBool(options.only_loaded),
    };
}