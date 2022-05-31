import { LiveJournalEvent } from "./LiveJournalEvent";


export type LiveJournalGetEventResponse = {
    skip: number;
    events: LiveJournalEvent[];
    lastsync: Date;
};
