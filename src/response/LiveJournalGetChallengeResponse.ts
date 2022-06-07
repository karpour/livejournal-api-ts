export type LiveJournalGetChallengeResponse = {
    /** An opaque cookie used to generate a hashed response (challenge) */
    challenge: string;
    /** Unix-time of a challenge value generation at the server */
    server_time: number;
    /** Expiration Unix-time of the challenge value */
    expire_time: number;
    /** Authentication scheme identifier */
    auth_scheme: string;
};