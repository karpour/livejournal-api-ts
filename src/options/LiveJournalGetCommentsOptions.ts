import { LiveJournalApiBool } from "../types";

export type LiveJournalGetCommentsOptions = ({
    journal: string;
} | {
    journalid: number;
}) & ({
    itemid: number;
} | {
    ditemid: number;
}) & {
    dtalkid: number;
    page_size?: number;
    expand_strategy?: 'mobile' | 'mobile_thread' | 'expand_all' | 'by_level' | 'detailed' | 'default';
    format?: 'thread' | 'list';
    expand_child?: number;
    expand_level?: number;
    get_users_info?: LiveJournalApiBool;
    asxml?: LiveJournalApiBool;
    extra?: LiveJournalApiBool;
    calculate_count?: LiveJournalApiBool;
    only_loaded?: LiveJournalApiBool;
};