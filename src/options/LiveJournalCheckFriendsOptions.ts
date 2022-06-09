import { Replace } from "../Replace";
import { convertToLiveJournalDateString, LiveJournalDateString } from "../types/LiveJournalDateString";

/**
 * @internal
 */
export type LiveJournalCheckFriendsOptionsRaw = Replace<LiveJournalCheckFriendsOptions, {
    lastupdate?: LiveJournalDateString;
}>;

export type LiveJournalCheckFriendsOptions = {
    lastupdate?: Date;
    mask?: number;
};

/**
 * @internal
 */
export function convertLiveJournalCheckFriendsOptions(options: LiveJournalCheckFriendsOptions): LiveJournalCheckFriendsOptionsRaw {
    if (options.lastupdate) {
        return { ...options, lastupdate: convertToLiveJournalDateString(options.lastupdate) };
    }
    return options as any;
}