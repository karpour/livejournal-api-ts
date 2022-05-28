import { LiveJournalDateString } from "./LiveJournalDateString";

export type LiveJournalEventRaw = {
    itemid: number,
    subject: string,
    event: string | Buffer,
    ditemid: number,
    eventtime: LiveJournalDateString,
    props: LiveJournalEventPropsRaw,
    can_comment: 1 | 0,
    logtime: LiveJournalDateString,
    anum: number,
    url: string,
    event_timestamp: number,
    reply_count: number;
};

export type LiveJournalEventPropsRaw = {
    /** Admin Content Flag Internal flag describing entry  properties. Set by an administrator */
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
    hasscreened?: boolean;
    /** Update interface Interface used for last update */
    interface?: string;
    /** Back-dated Set to true when an entry cannot be displayed in the Friends page */
    opt_backdated?: boolean;
    /**  Don't Allow Comments Set to true, when readers cannot comment on the entry; */
    opt_nocomments?: boolean;
    /** Don't email comments Set to true, when an entry author does not want to receive replies to their entry by email */
    opt_noemail?: boolean;
    /** Don't Auto-Format Set to true when an entry contains HTML tags and is not subject to auto-format; */
    opt_preformatted?: boolean;
    /** Custom Screening Level Defines screening level for new replies to a current entry.
     * By default, the general level set for the whole journal. 
     * Available options are:
     *   N = screen no replies
     *   R = screen replies from anonymous users
     *   F = show only friends’ replies
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
    unknown8bit?: boolean;
    /** Support Request ID for Unsuspension Request Identifier of a request to the support service / abuse team for entry unsuspension. Set to “Undef” or “0” when no such request is pending at the moment */
    unsuspend_supportid?: number;
    /** Composed in RTE True, when an entry was composed in the rich text editor */
    used_rte?: boolean;
    /** User Agent Client type(web / mobile / sip / etc) used to create an entry */
    useragent?: string;
    /** Verticals List List of verticals(topics) to which an entry belongs, separated by comma; */
    verticals_list?:string;
}

export type LiveJournalEvent = {
    itemid: number,
    subject: string,
    event: string | Buffer,
    ditemid: number,
    eventtime: LiveJournalDateString,
    props: LiveJournalEventPropsRaw,
    can_comment: boolean,
    logtime: LiveJournalDateString,
    anum: number,
    url: string,
    event_timestamp: number,
    reply_count: number;
};

export type LiveJournalGetEventResponse = {
    skip: number,
    events: LiveJournalEventRaw[],
    lastsync: LiveJournalDateString;
};