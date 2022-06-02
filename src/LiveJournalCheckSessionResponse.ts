import { LiveJournalSessionDescriptor } from "./LiveJournalSessionDescriptor";

export type LiveJournalCheckSessionResponse = {
    username: string;
    session: LiveJournalSessionDescriptor,
    caps: any;
    usejournals: string[];
    xc3: {
        u: any;
    };
};