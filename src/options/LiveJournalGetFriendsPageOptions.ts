import {
    convertToLiveJournalApiBool,
    convertToLiveJournalDateString,
    LiveJournalApiBool,
    LiveJournalJournalType
} from "../types";


export type LiveJournalGetFriendsPageOptions = {
    /** Maximum number of returned entries (from 0 to 100). By default set to 100 */
    itemshow?: number;
    /** Number of an entry (in the current order, from 0 to 100) that starts the Friends page. By default set to 0 */
    skip?: number;
    /** Unix-time when an entry was created on the server. When defined, the function returns only entries created before the specified time */
    before?: Date;
    /** Number of characters by which an entry must be reduced (taking into account tag compressing and images) */
    trim_widgets?: number;
    /** Unix-time when an entry was created on the server. When defined, this function return entries created after the specified time */
    lastsync?: string;
    /** Converts embedded LJ-tags into plain HTML. By default set to false (0); when set to true (1), the system converts LJ-tags to plain HTML */
    parseljtags?: boolean;
    /** Number of characters an image within in an entry equals. The default is set to 50, i.e., an entry containing no text and two images is considered to contain 100 characters; the system then reduces the entry length to one link to one image; used when trim_widgets parameter specified. */
    widgets_img_length?: number;
    /** String with capital letters corresponded to journal types to filter entries from specified journal types (refer to item 2.5.1), ex. "CP" for personal journals and communities */
    journaltype?: LiveJournalJournalType[];
    /** Group mask to return entries from specified groups only */
    groupmask?: number;
};

export function convertLiveJournalGetFriendsPageOptions(params: LiveJournalGetFriendsPageOptions): LiveJournalGetFriendsPageOptionsRaw {
    return Object.assign(params, {
        parseljtags: convertToLiveJournalApiBool(params.parseljtags),
        journaltype: params.journaltype ? params.journaltype.join() : undefined,
        before: params.before ? convertToLiveJournalDateString(params.before) : undefined
    });
}

export type LiveJournalGetFriendsPageOptionsRaw = {
    /** Maximum number of returned entries (from 0 to 100). By default set to 100 */
    itemshow?: number;
    /** Number of an entry (in the current order, from 0 to 100) that starts the Friends page. By default set to 0 */
    skip?: number;
    /** Unix-time when an entry was created on the server. When defined, the function returns only entries created before the specified time */
    before?: string;
    /** Number of characters by which an entry must be reduced (taking into account tag compressing and images) */
    trim_widgets?: number;
    /** Unix-time when an entry was created on the server. When defined, this function return entries created after the specified time */
    lastsync?: string;
    /** Converts embedded LJ-tags into plain HTML. By default set to false (0); when set to true (1), the system converts LJ-tags to plain HTML */
    parseljtags?: LiveJournalApiBool;
    /** Number of characters an image within in an entry equals. The default is set to 50, i.e., an entry containing no text and two images is considered to contain 100 characters; the system then reduces the entry length to one link to one image; used when trim_widgets parameter specified. */
    widgets_img_length?: number;
    /** String with capital letters corresponded to journal types to filter entries from specified journal types (refer to item 2.5.1), ex. "CP" for personal journals and communities */
    journaltype?: LiveJournalJournalType;
    /** Group mask to return entries from specified groups only */
    groupmask?: number;
};