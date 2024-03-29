import { convertLiveJournalApiBool, LiveJournalApiBool } from "./LiveJournalApiBool";
import { Replace } from "../Replace";

export type LiveJournalUserGroupDescription = {
    /** flag indicating whether a group is public or private */
    public: LiveJournalApiBool;
    /** friends group name */
    name: string;
    /** bit number for this friends group (from 1 to 30) */
    id: number;
    /** number for ordering groups (from 1 to 255) */
    sortorder: number;
};

export type LiveJournalMoodDefinition = {
    /** identifies the "parent" mood(i.e., you want to create a mood tree containing various themes for happiness, for example) */
    parent: number;
    /** mood name; */
    name: string;
    /** mood identifier */
    id: number;
};

export type LiveJournalMenuItemDefinition = {
    /** menu item text or "-" for  separator  */
    text: string;
    /** link(URL) to a menu item.Defined for all menu items except for separators and sub - menus  */
    url: string;
    /** structure array containing sub - menu items. The key is returned when an item is a submenu.The submenu structure has the same format as that of the top - level menu */
    sub?: LiveJournalMenuItemDefinition[];
};

export enum LiveJournalAccountCapabilites {
    /** new user */
    NEW_USER = 0x01,
    /** normal user */
    NORMAL_USER = 0x02,
    /** early adopter (registered before September, 2000) */
    EARLY_ADOPTER = 0x04,
    /** paid user */
    PAID_USER = 0x08,
    /** permanent account */
    PERMANENT_ACCOUNT = 0x10,
    /** many friends class (can add up to 10,000 friends) */
    MANY_FRIENDS = 0x20,
    /** move in progress (user account locked for maintenance, available as read-only) */
    MOVE_IN_PROGRESS = 0x40,
    /** sponsored accounts */
    SPONSORED_ACCOUNT = 0x80,
    /** beta-testing */
    BETA_TESTING = 0x100,
    /** extra userpics */
    EXTRA_USERPICS = 0x200,
    /** Russian-speaking SUP-flagged users who receive some services from SUP */
    RUSSIAN_SPEAKING = 0x400,
    /** SUP opt-out (Russian speakers who asked 6A to opt out from SUP) */
    SUP_OPT_OUT = 0x800,
    /** temporary unlimited phone posts (available in some countries) */
    TEMPORARY_UNLIMITED_PHONE_POSTS = 0x1000,
    /** undergrade class (user age below 14 years) */
    UNDERGRADE_CLASS = 0x2000,
    /** ad supporter (testing); ads added to the user's journal though not visible to them */
    AD_SUPPORTER = 0x4000,
    /** Plus (enhanced account) */
    PLUS = 0x8000,
}

export type LiveJournalUserProfileRaw = {
    /** Username message (string) – message that notifies a user about software updates, problems with their account, etc.  */
    username: string;
    /** Username message (string) – message that notifies a user about software updates, problems with their account, etc.  */
    fullname: string;
    /** Array defining a user group */
    friendgroups: LiveJournalUserGroupDescription[];
    /** Array of journals/communities available to a user for posting */
    usejournals: string[];
    /** Mood array
     * The array is returned when the getmoods structure component is set to 1 */
    moods: LiveJournalMoodDefinition[];
    /** Array containing userpic keywords. The array is returned when getpickws = 1 */
    pickws?: string[];
    /** Array containing links (URL) to userpics */
    pickwurls: string[];
    /** Link (URL) to a default userpic. The value is returned when getpickwurls = 1 */
    defaultpicurl?: string;
    /** When true, a client can enter "Cookie: ljfastserver=1" in HTTP-header for priority request processing */
    fastserver?: LiveJournalApiBool;
    /** User identifier*/
    userid: number;
    /** 
     * Array containing menu items in the order of display in the corresponding web-menu of the LiveJournal user application.
     * The array is returned when the getmenus structure component is set to 1 */
    menus: LiveJournalMenuItemDefinition[];
    /** 
     * User account capability class defined by bit-mapped fields within a 2-byte integer. 
     * The key is returned when the getcaps structure component is set to true
     * See {@link LiveJournalAccountCapabilites}
     */
    caps?: number;
    /**  */
    is_validated?: LiveJournalApiBool;
    /**  */
    identity_display?: string,
    /**  */
    identity_value?: string,
    /**  */
    identity_type?: string,
    /**  */
    identity_url?: string;
};

export type LiveJournalUserProfile = Replace<LiveJournalUserProfileRaw, {
    /** When true, a client can enter "Cookie: ljfastserver=1" in HTTP-header for priority request processing */
    fastserver?: boolean;
    /**  */
    is_validated?: boolean;
}>;

export function convertLiveJournalUserProfile(profile: LiveJournalUserProfileRaw): LiveJournalUserProfile {
    return {
        ...profile,
        fastserver: convertLiveJournalApiBool(profile.fastserver),
        is_validated: convertLiveJournalApiBool(profile.is_validated),
    };
}