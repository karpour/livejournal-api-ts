import { convertLiveJournalDateString, LiveJournalDateString, LiveJournalSecurity } from ".";
import { Replace } from "../Replace";

/**
 * @internal
 */
type LiveJournalExportEventRaw = Replace<LiveJournalExportEvent, {
    itemid: string;
    eventtime: LiveJournalDateString;
    logtime: LiveJournalDateString;
    allowmask: string;
    current_music: string;
    current_mood: string;
}>;

export type LiveJournalExportEvent = {
    itemid: number;
    eventtime: Date;
    logtime: Date;
    subject: string;
    event: string;
    security: LiveJournalSecurity;
    allowmask: number;
    current_music?: string;
    current_mood?: string;
};

/**
 * @internal
 */
export function convertLiveJournalExportEvent(post: LiveJournalExportEventRaw): LiveJournalExportEvent {
    const ev: LiveJournalExportEvent = {
        allowmask: parseInt(post.allowmask),
        event: post.event,
        logtime: convertLiveJournalDateString(post.logtime),
        eventtime: convertLiveJournalDateString(post.eventtime),
        security: post.security,
        itemid: parseInt(post.itemid),
        subject: post.subject
    };
    if (post.current_mood) ev.current_mood = post.current_mood;
    if (post.current_music) ev.current_music = post.current_music;
    return ev;
}
