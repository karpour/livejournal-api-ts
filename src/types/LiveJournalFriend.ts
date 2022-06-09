import { LiveJournalDateString } from "./LiveJournalDateString";


// TODO create Raw version
export type LiveJournalFriend = {
    /** Username */
    user: string,
    /** Full username displayed on the user's Profile page or in search results */
    fullname: string,
    /** Username */
    username: string;
    /** link to a user default userpic (URL). The key is available when a user has selected a default userpic */
    defaultpicurl: string,
    /** Background color used for this user on the Friends page (HTML color codes format,  #RRGGBB), default value #ffffff */
    bgcolor: string,
    /** Font color used for this user on the Friends page (HTML color codes format, #RRGGBB), default value #000000 */
    fgcolor: string,
    /** Status */
    status?: 'purged',
    /** User birth date in "yyyy-mm-dd hh:mm:ss" format if specified */
    birthday?: LiveJournalDateString,
    /** User group mask (32-bit integer) */
    groupmask?: number,
} & ({
    /** User type */
    type?: string;
} | {
    /** User type */
    type: "identity";
    /** Alternative identification type; used when type = "identity" */
    identity_type: string;
    /** URL identifier; used when type = "identity" */
    identity_value: string;
    /** Displayed username; used when type = "identity"  */
    identity_display: string;
});