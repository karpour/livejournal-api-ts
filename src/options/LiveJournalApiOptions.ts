import { LiveJournalCookieData, LiveJournalCookieDuration } from "../types";

export const LiveJournalApiAuthMethods = ['clear', 'challenge', 'cookie'] as const;

export type LiveJournalApiAuthMethod = typeof LiveJournalApiAuthMethods[number];

export type LiveJournalApiOptionsCommon = {
    /** Cookie Data */
    cookie?: LiveJournalCookieData;
    /** File to load cookie data from, needs to be of type {@link LiveJournalCookieData} */
    cookieFile?: string;
    /** 
     * Cookie refresh interval
     * @default "long"
     */
    cookieRefresh?: LiveJournalCookieDuration;
    /** Auth method */
    authMethod: LiveJournalApiAuthMethod;
    /** 
     * Print verbose messages to console
     * @default false
     */
    verbose?: boolean;
    /**
     * Throttle API requests to LiveJournal API
     * If true, the API client will send a maximum of {@link LiveJournalApiOptionsCommon.trottleRequestsPerSecond} requests per second
     * @default false
     */
    throttle?: boolean;
    /**
     * Maximum requests per seconds, applicable if {@link LiveJournalApiOptionsCommon.throttle} is true
     * @default 5
     */
    trottleRequestsPerSecond?: number;
};

export type LiveJournalApiAuthOptionsClear = {
    /** Clear password authentication method (not recommended) */
    authMethod: "clear";
    /** User name */
    username: string;
} & ({
    /** MD5 hash of the user password. The password field is left empty if this one is filled */
    hpassword: string;
} | {
    /** User password exported in plain text. Note that the hpassword field is not used for configuration of this setting */
    password: string;
});

/*
export type LiveJournalApiAuthOptionsChallenge = {
    authMethod: 'challenge';
};
*/

export type LiveJournalApiAuthOptionsCookie = {
    authMethod: 'cookie';
    username: string;
} & ({
    cookie: LiveJournalCookieData;
    cookieFile?: string;
    password?: string;
} | {
    cookie?: LiveJournalCookieData;
    cookieFile: string;
    password?: string;
} | {
    password: string;
    cookie?: LiveJournalCookieData;
    cookieFile?: string;
});


export type LiveJournalApiOptions = LiveJournalApiOptionsCommon & (LiveJournalApiAuthOptionsClear /*| LiveJournalApiAuthOptionsChallenge */ | LiveJournalApiAuthOptionsCookie);