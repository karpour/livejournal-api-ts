
export type LiveJournalSelectType =
    /** Retrieve a particular entry */
    "one" |
    /** Retrieve entries for the indicated year, month, or day. The number of returned entries is limited to 200 */
    "day" |
    /** Retrieve the indicated number of recent entries. The number is specified in the howmany key */
    "lastn" |
    /** Retrieve entries created/changed after the date specified in the lastsync key
     * Note: It is the server that determines the number of entries returned in this entry retrieval mode.
     * So, make sure you use the Syncitems protocol mode to avoid incomplete retrieval. */
    "syncitems" |
    /** Retrieve required entries with ID's specified in the itemids array (see below); the number of retrieved entries is limited to 100 */
    "multiple" |
    /** Retrieve entries created before the date specified in the before key (see below) */
    "before";
