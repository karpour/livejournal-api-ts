import { LiveJournalDateString } from "../types";
import { LiveJournalEvent, LiveJournalEventRaw } from "../types/LiveJournalEvent";


export type LiveJournalGetEventResponseRaw = {
    skip: number;
    events: LiveJournalEventRaw[];
    lastsync: LiveJournalDateString;
};

export type LiveJournalGetEventResponse = {
    skip: number;
    events: LiveJournalEvent[];
    lastsync: Date;
};
