import { LiveJournalPrivateMessageType } from "./LiveJournalPrivateMessageType";

export type LiveJournalPrivateMessage =
    LiveJournalPrivateMessageBasic |
    LiveJournalPrivateMessageReceived |
    LiveJournalPrivateMessageSent |
    LiveJournalPrivateMessageNewComment;

export type LiveJournalPrivateMessageExtended =
    LiveJournalPrivateMessageBasic |
    LiveJournalPrivateMessageReceived |
    LiveJournalPrivateMessageSent |
    LiveJournalPrivateMessageNewCommentExtended;

export type LiveJournalPrivateMessageBasic = {
    /** Message identifier */
    qid: number;
    /** Message Unix-time */
    when: string;
    /** Message status. Available options: 'N' for not read 'R' for read */
    state: string;
} & ({
    /** Message type */
    type: number;
} | {
    /** Message type */
    type: 0;
    /** Message type as a string (when type = '0'); */
    typename: LiveJournalPrivateMessageType;
});

export type LiveJournalPrivateMessageNewComment = ({
    /** Message type */
    type: 0;
    /** Message type as a string (when type = '0'); */
    typename: 'JournalNewComment';
} | {
    type: 9;
}) & {
    /** Name of the journal owner */
    journal: string;
    /** Actions applied to the reply; options: 'deleted', 'comment_deleted', 'edited', 'new' */
    action: 'deleted' | 'comment_deleted' | 'edited' | 'new';
    /** Link (URL) to the commented entry */
    entry: string;
    /** Link to a reply (URL) */
    comment: string;
    /** Reply author’s username */
    poster: string;
    /** Reply subject */
    subject: string;
};

export type LiveJournalPrivateMessageNewCommentExtended = LiveJournalPrivateMessageNewComment & {
    /** Reply subject */
    subject_raw: string;
    /** Reply text */
    body: string;
    /** Reply external ID */
    dtalkid: number;
};

export type LiveJournalPrivateMessageReceived = ({
    /** Message type */
    type: 0;
    /** Message type as a string (when type = '0'); */
    typename: 'UserMessageRecvd';
} | {
    type: 18;
}) & {
    /** name of the user who sent a message */
    from: string;
    /** link to a userpic (URL) */
    picture: string;
    /** message subject */
    subject: string;
    /** message text */
    body: string;
    /** message identifier */
    msgid: number;
    /** identifier of a parent message, if any */
    parent: number;
};


export type LiveJournalPrivateMessageSent = ({
    /** Message type */
    type: 0;
    /** Message type as a string (when type = '0'); */
    typename: 'UserMessageSent';
} | {
    type: 19;
}) & {
    /** Name of a user the message is sent to */
    to: string;
    /** Link to a userpic (URL) */
    picture: string;
    /** Message subject */
    subject: string;
    /** Message text */
    body: string;
};

