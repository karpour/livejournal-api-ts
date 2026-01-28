
export type LiveJournalCookieData = {
    ljsession: string;
    //ljloggedin: string;
    expires: Date;
};

export function isValidCookie(cookie: Partial<LiveJournalCookieData>): cookie is LiveJournalCookieData {
    return cookie.expires !== undefined
        && cookie.ljsession !== undefined
        && cookie.expires > new Date();
}