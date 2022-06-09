import { Replace } from "../Replace";
import { convertToLiveJournalApiBool, LiveJournalApiBool } from "../types";

/**
 * @internal
 */
export type LiveJournalGetUserProfileOptionsRaw = Replace<LiveJournalGetUserProfileOptions, {
    /** when true (1), the server returns a list (tree) of navigations to the web-menu */
    getmenus?: LiveJournalApiBool;
    /** To obtain the list of userpic keywords, set the value to 1  */
    getpickws?: LiveJournalApiBool;
    /** To obtain the list of links to userpics (URL) as well as userpic keywords, set the key value to 1 */
    getpickwurls?: LiveJournalApiBool;
    /** To get all capability classes of the account, set the value to 1 */
    getcaps?: LiveJournalApiBool;
}>;

export type LiveJournalGetUserProfileOptions = {
    /** allows identifying the version of a client that requests data. Allows the LiveJournal server to collect user statistics. The following string formats are supported Platform-ProductName/ClientVersionMajor.Minor.Rev, e.g., Win32-MFC/1.2.7 or GTK2-LogJam: 4.5.3 */
    clientversion?: string;
    /** To obtain the whole mood list, set the value to 0. When the value is different (above 0), 
     * the server returns the list of moods having ID's above the defined value */
    getmoods?: number;
    /** Get list (tree) of navigations to the web-menu */
    getmenus?: boolean;
    /** Get list of userpic keywords */
    getpickws?: boolean;
    /** Get list of links to userpics (URL) as well as userpic keywords */
    getpickwurls?: boolean;
    /** Get all capability classes of the account */
    getcaps?: boolean;
};

export function convertLiveJournalGetUserProfileOptions(options: LiveJournalGetUserProfileOptions): LiveJournalGetUserProfileOptionsRaw {
    return {
        ...options,
        getmoods: options.getmoods ?? 0,
        getmenus: convertToLiveJournalApiBool(options.getmenus),
        getpickws: convertToLiveJournalApiBool(options.getpickws),
        getpickwurls: convertToLiveJournalApiBool(options.getpickwurls),
        getcaps: convertToLiveJournalApiBool(options.getcaps),
    };
}