import { LiveJournalApiBool } from ".";
import { LiveJournalPollMode } from "./LiveJournalPollMode";

export type LiveJournalPoll = {
    pollid: number;
    ditemid: number;
    name: string;
    whovote: 'all' | 'friends' | 'none';
    whoview: 'all' | 'friends' | 'none';
    posterid: number;
    journalid: number;
    journal: string;
    poster: string;
    status: 'close' | 'open';
    can_vote: LiveJournalApiBool;
    can_view: LiveJournalApiBool;
    is_owner: LiveJournalApiBool;
    mode: LiveJournalPollMode;
};