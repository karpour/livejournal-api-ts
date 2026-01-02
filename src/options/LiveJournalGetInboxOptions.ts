import { LiveJournalPrivateMessageType } from "../types/LiveJournalPrivateMessageType";

export type LiveJournalGetInboxOptionsCommon = {
    /** Number of returned entries (from 0 to 100). The default is set to 100 */
    itemshow?: number;
    /** Order number (from 0 to 100), starting with the first message in Inbox (from 0 to 100). By default, set to 0 */
    skip?: number;
    /** Unix-time after which messages are retrieved (inclusively) */
    lastsync?: string;
    /** Unix-time till which messages are retrieved (inclusively) */
    before?: string;

    /** Allows the retrieving of messages for selected types */
    gettype?: LiveJournalPrivateMessageType;
};

export type LiveJournalGetInboxOptionsRegular = LiveJournalGetInboxOptionsCommon & {
    /** When set to true, extended message information is displayed */
    extended?: false;
};

export type LiveJournalGetInboxOptionsExtended = LiveJournalGetInboxOptionsCommon & {
    /** When set to true, extended message information is displayed */
    extended: true;
};

export type LiveJournalGetInboxOptions = LiveJournalGetInboxOptionsRegular | LiveJournalGetInboxOptionsExtended;