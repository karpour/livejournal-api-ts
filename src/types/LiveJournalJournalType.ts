export enum LiveJournalJournalType {
    /** User journal (P) – a journal of a separate user ("personal"). Only the journal owner can post in it */
    USER = 'P',
    /** Community (C). Unlike a user journal, a community journal ("community") allows multiple 
    community members to post in it. Apart from the community creator, a community has 
    moderators forming a particular user group that monitors the journal content. Moderators 
    can edit and remove posts from other users and can modify member rights */
    COMMUNITY = 'C',
    /** News wire (N – "news") — a news journal. There is a single instance of this type and it is 
    designed to mail news to users */
    NEWS = 'N',
    /** Shared journal (S – "shared") — original version of communities. An outdated type, currently not used */
    SHARED = 'S',
    /** Syndicated journals (RSS) (Y – "syndicated") — journal for collecting RSS-feeds. This type does not allow commenting or user-generated posts */
    SYNDICATED = 'Y',
    /** Renamed journal (R) — journal of a user who changed their login. Login is not a unique 
    user account identifier in LiveJournal, so the user can change it while keeping their account groups and settings */
    RENAMED = 'R',
    /** OpenID journal (I – "identity") — users having an account at a different OpenID server, FaceBook or Twitter and using it to access the system */
    OPENID = 'I',
}