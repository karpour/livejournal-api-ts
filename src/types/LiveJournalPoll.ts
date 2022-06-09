import { LiveJournalApiBool, LiveJournalPollMode } from ".";
import { Replace } from "../Replace";
import { convertLiveJournalApiBool } from "./LiveJournalApiBool";

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
    can_vote: boolean;
    can_view: boolean;
    is_owner: boolean;
    mode: LiveJournalPollMode;
};

/** @internal */
export type LiveJournalPollRaw = Replace<LiveJournalPoll, {
    can_vote: LiveJournalApiBool;
    can_view: LiveJournalApiBool;
    is_owner: LiveJournalApiBool;
}>;

/** @internal */
export function convertLiveJournalPoll(poll: LiveJournalPollRaw): LiveJournalPoll {
    return {
        ...poll,
        can_vote: convertLiveJournalApiBool(poll.can_vote),
        can_view: convertLiveJournalApiBool(poll.can_view),
        is_owner: convertLiveJournalApiBool(poll.is_owner),
    };
}