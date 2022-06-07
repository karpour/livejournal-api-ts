import {
    LiveJournalDateString,
    LiveJournalSelectType
} from "../types";

export type LiveJournalGetEventsOptionsCommon = {
    /** Defines the length of return values. Return values are truncated to the specified number of characters after decryption. (Integer) */
    truncate?: number;
    /** When set to true, the event key returns an entry subject instead of its text, and the subject key remains empty */
    prefersubject?: boolean;
    /** When set to true, entry properties are not returned */
    noprops?: boolean;
    /** When set to true, entry tags are not returned */
    notags?: boolean;
    /** Allows choosing the entry retrieval mode for the selected journal */
    selecttype: LiveJournalSelectType;
    /** Number of skipped entries (you can define a value in the range from 0 to 500) */
    skip?: number;
    /** Symbols used to separate lines within an entry. */
    lineendings?: 'unix' |
    'pc' |
    'mac' |
    'space' |
    'dots'; // dots used as a line break

    /** Name of an available journal from which entries need to be retrieved */
    usejournal: string;
    /** Number of characters by which each entry is reduced. Reduction unit is a word (including tags and pics) */
    trim_widgets?: number;
    /** Number of characters an image within in an entry equals. The default is set to 50, i.e. an entry containing no text and two images is
     * considered to contain 100 characters. The system then reduces the entry length to one link to one image. Used when trim_widgets parameter specified. */
    widgets_img_length?: number;
    /** Converts LJ-tags to plain HTML. By default set to false. When et to true(1), the system converts LJ - tags to plain HTML */
    parseljtags?: boolean;
};


export type LiveJournalGetEventsOptions = LiveJournalGetEventsOptionsMultiple | LiveJournalGetEventsOptionsLastSync | LiveJournalGetEventsOptionsOne |
    LiveJournalGetEventsOptionsBefore | LiveJournalGetEventsOptionsDay | LiveJournalGetEventsOptionsLastN;


export type LiveJournalGetEventsOptionsMultiple = LiveJournalGetEventsOptionsCommon & {
    selecttype: "multiple";
    /** Internal identifiers of entries splitted by commas that must be retrieved. Used when selecttype="multiple" */
    itemids: string;
};

export type LiveJournalGetEventsOptionsLastSync = LiveJournalGetEventsOptionsCommon & {
    selecttype: "lastsync";
    /** Entries created after the specified time (in "YYYY-MM-DD hh:mm:ss" format, livejournal.com server event creation time, GMT). Used when selecttype="syncitems" */
    lastsync: LiveJournalDateString;
};

export type LiveJournalGetEventsOptionsOne = LiveJournalGetEventsOptionsCommon & {
    selecttype: "one";
    /** Internal entry identifier; -1 value used to retrieve the last post in the journal. Used when selecttype="one" */
    itemid: number | -1;
} | {
    selecttype: "one";
    /** External entry identifier */
    ditemid: number;
};

export type LiveJournalGetEventsOptionsBefore = LiveJournalGetEventsOptionsCommon & {
    selecttype: "before";
    /** Date specified in "YYYY-MM-DD hh:mm:ss" format. Entries created before the specified date (livejournal.com server event creation time, GMT) are retrieved.
     *  It must explicit specify howmany parameter value. The key is used when selecttype="before" */
    before: LiveJournalDateString;
    /** Number of returned entries (from 0 to 50). */
    howmany: number;
};

export type LiveJournalGetEventsOptionsDay = LiveJournalGetEventsOptionsCommon & {
    selecttype: "day";
    /** Year, used when selecttype="day" */
    year: number;
    /** Month (from 1 to 12), used when selecttype="day" */
    month: number;
    /** Day (from 1 to 31), used when selecttype="day" */
    day: number;
};

export type LiveJournalGetEventsOptionsLastN = LiveJournalGetEventsOptionsCommon & {
    selecttype: "lastn";
    /** Date specified in "YYYY-MM-DD hh:mm:ss" format. Indicates the last date of a period for which LJ entries are retrieved. Used when selecttype="lastn" */
    beforedate?: LiveJournalDateString;
    /** Number of returned entries (from 0 to 50). The default is set to 20. The key is used when selecttype="lastn" */
    howmany?: number;
};