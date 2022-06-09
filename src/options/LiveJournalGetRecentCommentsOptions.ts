import { LiveJournalApiBool } from "../types/LiveJournalApiBool";

export type LiveJournalGetRecentCommentsOptionsRaw = {
    /** Number of retrieved replies. 
     * @default 10 */
    itemshow?: number;
    /** Number of skipped replies. The parameter is used to define the number of replies displayed 
     * on each page. For example, when skip = 10, 10 most recent replies are displayed on the first page,
     * replies 11-20 are displayed on the second page, etc. 
     * @default 0 */
    skip?: number;
    /** Number of symbols by which a reply is compressed (taking into account tag compression and images).
     * @default 50 */
    trim_widgets?: number;
    /** Number of symbols an image utilizes in a reply. 
     * If trim_widgets parameter specified. 
     * @default 50 */
    widgets_img_length?: number;
    /** Converts embedded LJ-tags into simple HTML. 
     * The default is set to false (0); when set to true (1), the system converts LJ-tags to plain HTML
     * @default 0 */
    parseljtags?: LiveJournalApiBool;
};

