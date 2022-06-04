import { convertLiveJournalApiBool, LiveJournalApiBool } from "./LiveJournalApiBool";
import { LiveJournalDateString } from "./LiveJournalDateString";

export type LiveJournalEventRaw = {
    /** Entry internal identifier */
    itemid: number,
    /** Entry subject */
    subject: string,
    /** Entry body */
    event: string | Buffer,
    /**  */
    ditemid: number,
    /** Entry publication time (in “yyyy-mm-dd hh:mm:ss” format) */
    eventtime: LiveJournalDateString,
    /** Entry properties */
    props: LiveJournalEventPropsRaw,
    /**  */
    can_comment: LiveJournalApiBool,
    /** Actual Unix-time of the last entry change on the server (server time) */
    logtime: LiveJournalDateString,
    /** A random number from 0 to 255 generated at entry creation used as the lower byte in the entry external identifier */
    anum: number,
    /** Link (URL) to an entry */
    url: string,
    /** User-defined entry in Unix-time */
    event_timestamp: number,
    /** Number of replies to an entry */
    reply_count: number;
    /** Access type ("public" – public entry visible to all, "private" – private entry, visible to the journal owner only) */
    security?: "public" | "private" | "usemask";
    /** Bit mask defining user groups that will have access to a 
     * posted entry. A 32-bit unsigned integer that defines the post visibility to user 
     * friends and groups. 0 bit stands for all user friends, bits ranging from 1 to 30 
     * stand for user groups, the 31st bit is reserved. This structure member is used 
     * when security = "usemask" */
    allowmask: number;
};

export type LiveJournalEventExtra = {
    /** User-defined entry */
    eventtime: Date,
    /** Props */
    props: LiveJournalEventProps,
    /**  */
    can_comment: boolean,
    /** Actual time of the last entry change on the server (server time) */
    logtime: Date,
    /** Entry body */
    event: string,
};

export type LiveJournalEvent = Omit<LiveJournalEventRaw, keyof LiveJournalEventExtra> & LiveJournalEventExtra;

export type LiveJournalEventPropsRaw = {
    /** Admin Content Flag Internal flag describing entry properties. Set by an administrator */
    admin_content_flag?: string;
    /** Adult Content Flag Adult content flag (no adult content, not recommended for users under the age of 14, explicit adult content) */
    adult_content?: string;
    /** Comments altered Unix-time of last update to replies to the current entry */
    commentalter?: string;
    /** Current Coordinates Author geographic coordinates (in '45.2935N 123.3452W' format) */
    current_coords?: string;
    /** Current Location Current location of an entry when the entry is posted (free text) */
    current_location?: string;
    /** Current Mood Current user mood defined at posting */
    current_mood?: string;
    /** Current Mood ID# Current mood identifier integer */
    current_moodid?: number;
    /** Current Music Music the user is listening to when an entry is posted */
    current_music?: string;
    /** Has screened replies Set to true, when an entry has screened replies */
    hasscreened?: LiveJournalApiBool;
    /** Update interface Interface used for last update */
    interface?: string;
    /** Back-dated Set to true when an entry cannot be displayed in the Friends page */
    opt_backdated?: LiveJournalApiBool;
    /**  Don't Allow Comments Set to true, when readers cannot comment on the entry; */
    opt_nocomments?: LiveJournalApiBool;
    /** Don't email comments Set to true, when an entry author does not want to receive replies to their entry by email */
    opt_noemail?: LiveJournalApiBool;
    /** Don't Auto-Format Set to true when an entry contains HTML tags and is not subject to auto-format; */
    opt_preformatted?: LiveJournalApiBool;
    /** Custom Screening Level Defines screening level for new replies to a current entry.
     * By default, the general level set for the whole journal. 
     * Available options are:
     *   N = screen no replies
     *   R = screen replies from anonymous users
     *   F = show only friends' replies
     *   L = screen replies from usersoutside the friends list, if contain links
     *   A = screen all replies
     */
    opt_screening?: 'N' | 'R' | 'F' | 'L' | 'A';
    /** Personifi language Automatic language definition by Personifi system */
    personifi_lang?: string;
    /** Personifi tags Personifi categories / tags of an entry */
    personifi_tags?: string;
    /** Personifi word count Entry length defined by Personifi integer picture_keyword  Picture Keyword Keyword of a picture chosen by user as an entry avatar */
    personifi_word_count?: string;
    /** Writer's block ID Identifier of the Question of the Day (answered by the retrieved entry) */
    qotdid?: number;
    /** Revision number (Number of entry revisions) */
    revnu?: number;
    /** Revision time Unix - time of the last revision */
    revtime?: string;
    /** SMS Message ID Identifier of an SMS message that was converted into a journal entry */
    sms_msgid?: number;
    /** Visibility Status of an Entry 'V' or 'undef' for visible entries, 'S' for invisible */
    statusvis?: 'V' | 'undef' | 'S';
    /** Syndicated item id Unique identifier of a syndicated item */
    syn_id?: string;
    /** Syndication item link URL Original link to a syndication item */
    syn_link?: string;
    /** Tag List List of tags separated by comma */
    taglist?: string;
    /** Unknown 8 - bit text True, when the text contains8 - bit data not encoded in UTF-8 */
    unknown8bit?: LiveJournalApiBool;
    /** Support Request ID for Unsuspension Request Identifier of a request to the support service / abuse team for entry unsuspension. Set to "Undef" or "0" when no such request is pending at the moment */
    unsuspend_supportid?: number;
    /** Composed in RTE True, when an entry was composed in the rich text editor */
    used_rte?: LiveJournalApiBool;
    /** User Agent Client type (web / mobile / sip / etc) used to create an entry */
    useragent?: string;
    /** Verticals List List of verticals(topics) to which an entry belongs, separated by comma */
    verticals_list?: string;

    replycount?: number;
    give_features?: number;
    og_image?: string;
    guess_who_back?: LiveJournalApiBool;
};

export type LiveJournalEventExtraProps = {
    /** Tag List List of tags separated by comma */
    taglist: string[];
    /** Personifi tags Personifi categories / tags of an entry */
    personifi_tags: string[];
    /** Has screened replies Set to true, when an entry has screened replies */
    hasscreened: boolean;
    /** Back-dated Set to true when an entry cannot be displayed in the Friends page */
    opt_backdated: boolean;
    /**  Don't Allow Comments Set to true, when readers cannot comment on the entry; */
    opt_nocomments: boolean;
    /** Don't email comments Set to true, when an entry author does not want to receive replies to their entry by email */
    opt_noemail: boolean;
    /** Don't Auto-Format Set to true when an entry contains HTML tags and is not subject to auto-format; */
    opt_preformatted: boolean;
    /** Unknown 8 - bit text True, when the text contains8 - bit data not encoded in UTF-8 */
    unknown8bit: boolean;
    /** Composed in RTE True, when an entry was composed in the rich text editor */
    used_rte: boolean;
};

export type LiveJournalEventProps = Omit<LiveJournalEventPropsRaw, keyof LiveJournalEventExtraProps> & LiveJournalEventExtraProps;





export function convertLiveJournalDateString(ljDateString: LiveJournalDateString): Date {
    return new Date(ljDateString);
}

export function convertLiveJournalTagsList(list: string | undefined): string[] {
    if (!list) return [];
    return list.split(/,\s*/).map(item => item.trim());
}

export function convertLiveJournalEventProps(ljProps: LiveJournalEventPropsRaw): LiveJournalEventProps {
    return Object.assign<LiveJournalEventPropsRaw, LiveJournalEventExtraProps>(ljProps, {
        taglist: convertLiveJournalTagsList(ljProps.taglist),
        personifi_tags: convertLiveJournalTagsList(ljProps.personifi_tags),
        hasscreened: convertLiveJournalApiBool(ljProps.hasscreened),
        opt_backdated: convertLiveJournalApiBool(ljProps.opt_backdated),
        opt_nocomments: convertLiveJournalApiBool(ljProps.opt_nocomments),
        opt_noemail: convertLiveJournalApiBool(ljProps.opt_noemail),
        opt_preformatted: convertLiveJournalApiBool(ljProps.opt_preformatted),
        unknown8bit: convertLiveJournalApiBool(ljProps.unknown8bit),
        used_rte: convertLiveJournalApiBool(ljProps.used_rte),
    });
}

export function convertLiveJournalEventRaw(event: LiveJournalEventRaw): LiveJournalEvent {
    return Object.assign(event, {
        can_comment: convertLiveJournalApiBool(event.can_comment),
        eventime: convertLiveJournalDateString(event.eventtime),
        props: convertLiveJournalEventProps(event.props),
        logtime: convertLiveJournalDateString(event.logtime),
        event: event.event instanceof Buffer ? event.event.toString() : event.event
    });
}
