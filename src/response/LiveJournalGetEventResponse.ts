import { replaceBuffers } from "../LiveJournalApi";
import {
    convertLiveJournalEventRaw,
    LiveJournalEvent,
    LiveJournalEventRaw,
    LiveJournalDateString,
    convertLiveJournalDateString
} from "../types";


export type LiveJournalGetEventResponseRaw = {
    /** Number of skipped entries. Corresponds to the value in the skip input */
    skip: number;
    events: LiveJournalEventRaw[];
    lastsync: LiveJournalDateString;
};

export type LiveJournalGetEventResponseExtra = {
    events: LiveJournalEvent[];
    lastsync: Date;
};

export type LiveJournalGetEventResponse = Omit<LiveJournalGetEventResponseRaw, keyof LiveJournalGetEventResponseExtra> & LiveJournalGetEventResponseExtra;

export function convertLiveJournalGetEventResponse(resp: LiveJournalGetEventResponseRaw): LiveJournalGetEventResponse {
    return replaceBuffers({
        skip: resp.skip,
        events: resp.events.map((e: any) => convertLiveJournalEventRaw(e)),
        lastsync: convertLiveJournalDateString(resp.lastsync)
    });
}