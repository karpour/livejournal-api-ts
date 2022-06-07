export const LiveJournalApiAuthMethods = ['clear', 'challenge', 'cookie'] as const;

export type LiveJournalApiAuthMethod = typeof LiveJournalApiAuthMethods[number];

type LiveJournalApiAuthOptionsClear = {
    /** Clear password authentication method (not recommended) */
    auth_method: "clear";
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
type LiveJournalApiAuthOptionsChallenge = {
    authMethod: 'challenge';
};

type LiveJournalApiAuthOptionsCookie = {
    authMethod: 'cookie';
    cookie?: LiveJournalCookie;
    cookieFile?: string;
};
*/

export type LiveJournalApiAuthOptions = LiveJournalApiAuthOptionsClear /*| LiveJournalApiAuthOptionsChallenge | LiveJournalApiAuthOptionsCookie*/;