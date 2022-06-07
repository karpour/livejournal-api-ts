import { LiveJournalEvent } from "../types/LiveJournalEvent";


export type LiveJournalGetEventResponse = {
    skip: number;
    events: LiveJournalEvent[];
    lastsync: Date;
};
