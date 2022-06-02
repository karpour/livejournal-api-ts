import { LiveJournalPrivateMessage, LiveJournalPrivateMessageExtended } from "./LiveJournalPrivateMessage";

type LiveJournalGetInboxResponseCommon = {
    /** Number of skipped messages. Corresponds to the skip input */
    skip: number; 
    /** Journal type (refer to item 2.5.1) */
    journaltype: string; 
    /** Username */
    login: string; 
}

export type LiveJournalGetInboxResponseRegular = LiveJournalGetInboxResponseCommon & {
    /** Private message items */
    items: LiveJournalPrivateMessage[];
};

export type LiveJournalGetInboxResponseExtended = LiveJournalGetInboxResponseCommon & {
    /** Private message items */
    items: LiveJournalPrivateMessageExtended[];
};

export type LiveJournalGetInboxResponse = LiveJournalGetInboxResponseRegular & LiveJournalGetInboxResponseExtended;