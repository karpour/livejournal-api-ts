import { LiveJournalPollMode } from "../types/LiveJournalPollMode";

export type LiveJournalGetPollOptions = {
    mode?:LiveJournalPollMode;
    pollid: number;
}