import { Replace } from "../Replace";
import { LiveJournalPrivateMessage, LiveJournalPrivateMessageExtended } from "../types/LiveJournalPrivateMessage";

export type LiveJournalGetInboxResponse = {
    /** Number of skipped messages. Corresponds to the skip input */
    skip: number;
    /** Journal type (refer to item 2.5.1) */
    journaltype: string;
    /** Username */
    login: string;
    /** Private message items */
    items: LiveJournalPrivateMessage[] | LiveJournalPrivateMessageExtended[];
};

export type LiveJournalGetInboxResponseRegular = Replace<LiveJournalGetInboxResponse, {
    /** Private message items */
    items: LiveJournalPrivateMessage[];
}>;

export type LiveJournalGetInboxResponseExtended = Replace<LiveJournalGetInboxResponse, {
    /** Private message items */
    items: LiveJournalPrivateMessageExtended[];
}>;
