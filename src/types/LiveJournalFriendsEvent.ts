import { convertLiveJournalEventProps, LiveJournalEventProps, LiveJournalEventPropsRaw } from "./LiveJournalEvent";
import { convertLiveJournalApiBool, LiveJournalApiBool } from "./LiveJournalApiBool";
import { LiveJournalJournalType } from "./LiveJournalJournalType";
import { Replace } from "../Replace";
import { LiveJournalSecurity } from "./LiveJournalSecurity";

export type LiveJournalFriendsEvent = {
    /** Userpic description */
    userpic: '' | {
        /** Picture identifier */
        picid: number;
        /** User identifier */
        userid: number;
    };
    /** Journal type */
    journaltype: LiveJournalJournalType;
    /** Journal ID */
    journalid: number;
    /** Poster ID */
    posterid: number;
    /** Journal name */
    journalname: string;
    /** Entry external identifier */
    ditemid: number;
    /** Link (URL) to the journal of an entry author */
    posterurl: string;
    /** Entry subject */
    subject_raw: string;
    /** Link (URL) to the userpic */
    poster_userpic_url: string;
    /** Name of a user who created an entry */
    postername: string;
    /** Link (URL) to the journal */
    journalurl: string;
    /** Time of the last entry change on the server (server time) */
    logtime: Date;
    /** Number of replies to an entry */
    reply_count: number;
    /** Whether Captchа must be entered to make a reply */
    do_captcha: boolean;
    /** Type of user/journal that created an entry */
    postertype: LiveJournalJournalType;
    /** Entry properties */
    props: LiveJournalEventProps;
    /** Access type ("public" – public entry visible to all, "private" – private entry, visible to the journal owner only) */
    security?: LiveJournalSecurity;
    /** Event text */
    event_raw: string;
};

export type LiveJournalFriendsEventRaw = Replace<LiveJournalFriendsEvent, {
    /** Actual Unix-time of the last entry change on the server (server time) */
    logtime: number;
    /** Whether Captchа must be entered to make a reply ("1" – yes, "0" - no) */
    do_captcha?: LiveJournalApiBool;
    /** Entry properties */
    props: LiveJournalEventPropsRaw;
}>;

export function convertLiveJournalFriendsEvent(event: LiveJournalFriendsEventRaw): LiveJournalFriendsEvent {
    return Object.assign(event, {
        do_captcha: convertLiveJournalApiBool(event.do_captcha),
        props: convertLiveJournalEventProps(event.props),
        logtime: new Date(event.logtime * 1000),
    });
}