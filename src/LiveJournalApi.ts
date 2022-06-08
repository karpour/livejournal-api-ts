import { XmlRpcClient, XmlRpcFault, XmlRpcStruct, XmlRpcValue } from "@foxglove/xmlrpc";
import fetch from "node-fetch";
import { LiveJournalApiAuthMethod, LiveJournalApiOptions, LiveJournalApiAuthOptionsClear } from "./options/LiveJournalApiOptions";
import { getIconsFromHTML } from "./getIconsFromHTML";

import {
    convertLiveJournalExportOptions,
    convertLiveJournalGetCommentsOptions,
    convertLiveJournalGetFriendsOptions,
    convertLiveJournalGetFriendsPageOptions,
    LiveJournalApiError,
    LiveJournalCheckFriendsOptions,
    LiveJournalExportOptions,
    LiveJournalExportOptionsCsv,
    LiveJournalGetCommentsOptions,
    LiveJournalGetEventsOptions,
    LiveJournalGetFriendsOptions,
    LiveJournalGetFriendsOptionsIncludeFriendOf,
    LiveJournalGetFriendsOptionsIncludeGroups,
    LiveJournalGetFriendsPageOptions,
    LiveJournalGetInboxOptions,
    LiveJournalGetInboxOptionsExtended,
    LiveJournalGetInboxOptionsRegular,
    LiveJournalGetPollOptions,
    LiveJournalGetRecentCommentsOptionsRaw,
    LiveJournalUpdateCommentsOptions
} from './options';

import {
    convertGetFriendGroupsResponse,
    convertLiveJournalGetCommentsResponse,
    LiveJournalCheckFriendsResponse,
    LiveJournalCheckSessionResponse,
    LiveJournalGetChallengeResponse,
    LiveJournalGetCommentsResponseBasic,
    LiveJournalGetEventResponse,
    LiveJournalGetEventResponseRaw,
    LiveJournalGetFriendGroupsResponseRaw,
    LiveJournalGetFriendsOfResponse,
    LiveJournalGetFriendsPageResponse,
    LiveJournalGetFriendsResponse,
    LiveJournalGetFriendsResponseWithFriendGroups,
    LiveJournalGetFriendsResponseWithFriendGroupsAndFriendOfs,
    LiveJournalGetFriendsResponseWithFriendOfs,
    LiveJournalGetInboxResponse,
    LiveJournalGetInboxResponseExtended,
    LiveJournalGetInboxResponseRegular,
    LiveJournalGetRecentCommentsResponse,
    LiveJournalGetUserPicsResponse,
    LiveJournalSessionGenerateResponse,
    LiveJournalUpdateCommentsResponse,
} from './response';

import {
    convertLiveJournalDateString,
    convertLiveJournalEventRaw,
    convertLiveJournalFriendsEvent,
    convertLiveJournalRecentComment,
    convertToLiveJournalApiBool,
    LiveJournalComment,
    LiveJournalCookieDuration,
    LiveJournalExportEvent,
    LiveJournalFriend,
    LiveJournalFriendGroup,
    LiveJournalGetUserProfileOptions,
    LiveJournalGetUserTagsResponse,
    LiveJournalIconInfo,
    LiveJournalPoll,
    LiveJournalUserProfile,
    LiveJournalUserTag,
} from './types';

import { LiveJournalCookieData } from "./types/LiveJournalCookieData";
import { parsePostExportsCsv } from "./parsePostExportsCsv";
import { addDays } from "./addDays";
import { existsSync, readFileSync, ReadStream } from "fs";

export const LIVEJOURNAL_URL = 'https://www.livejournal.com';
export const LIVEJOURNAL_EXPORT_POSTS_URL = `${LIVEJOURNAL_URL}/export_do.bml`;
export const LIVEJOURNAL_EXPORT_COMMENTS_URL = `${LIVEJOURNAL_URL}/export_comments.bml`;
export const LIVEJOURNAL_XMLRPC_URL = `${LIVEJOURNAL_URL}/interface/xmlrpc`;

export const LIVEJOURNAL_API_METHODS = [
    'addcomment',
    'checkfriends',
    'checksession',
    'consolecommand',
    'createpoll',
    'createrepost',
    'deletecomments',
    'deleterepost',
    'editcomment',
    'editevent',
    'editfriendgroups',
    'editfriends',
    'editpoll',
    'friendof',
    'getchallenge',
    'getcomments',
    'getdaycounts',
    'getevents',
    'getfriendgroups',
    'getfriends',
    'getfriendspage',
    'getinbox',
    'getpoll',
    'getpushlist',
    'getrecentcomments',
    'getrepoststatus',
    'getuserpics',
    'getusertags',
    'login',
    'postevent',
    'pushsubscriptions',
    'registerpush',
    'resetpushcounter',
    'sendmessage',
    'sessionexpire',
    'sessiongenerate',
    'setmessageread',
    'syncitems',
    'unregisterpush',
    'updatecomments',
    'votepoll',
] as const;
export type LiveJournalApiMethod = typeof LIVEJOURNAL_API_METHODS[number];


export type LiveJournalApiAuthParams = {
    /** Password authentication method */
    auth_method: LiveJournalApiAuthMethod;
    /** User name */
    username: string;
    /** MD5 hash of the user password. The password field is left empty if this one is filled */
    hpassword?: string;
    /** User password exported in plain text. Note that the hpassword field is not used for configuration of this setting */
    password?: string;
    /** Challenge value returned by the server */
    auth_challenge?: string;
    /** Client response value */
    auth_response?: string;
};


export class LiveJournalApi {
    protected readonly staticAuthParams: LiveJournalApiAuthParams;
    protected readonly authMethod: LiveJournalApiAuthMethod;
    protected cookie: Partial<LiveJournalCookieData> | LiveJournalCookieData;
    protected cookieRefresh: LiveJournalCookieDuration;
    protected ljXmlRpc: XmlRpcClient | undefined;
    protected verbose: (message: any) => void = () => { };
    protected userAgent: string;
    protected throttle: boolean;
    protected trottleRequestsPerSecond: number;

    private getAuthParams: () => LiveJournalApiAuthParams;

    private async getCookieHeader(): Promise<{ [key: string]: string; }> {
        return {
            'cookie': `ljsession=${(await this.getLjSession())}`,
            'X-LJ-Auth': 'cookie',
            'User-Agent': this.userAgent
        };
    }

    /**
     * 
     * @param options 
     */
    public constructor(options: LiveJournalApiOptions) {
        if (options.verbose) this.verbose = console.error;
        this.verbose(`Created LiveJournalApi instance`);

        this.throttle = options.throttle ?? false;
        this.trottleRequestsPerSecond = options.trottleRequestsPerSecond ?? 5;

        this.authMethod = options.authMethod;
        this.staticAuthParams = {
            auth_method: options.authMethod,
            username: options.username
        };

        if (options.authMethod == "clear") {
            const passwords: LiveJournalApiAuthOptionsClear & { hpassword?: string, password?: string; } = options;
            if (passwords.password) this.staticAuthParams.password = passwords.password;
            if (passwords.hpassword) this.staticAuthParams.hpassword = passwords.hpassword;
        }


        this.getAuthParams = () => this.staticAuthParams;

        this.cookie = { ...options.cookie };
        if (options.cookieFile) {
            if (!existsSync(options.cookieFile)) throw new Error(`Cookie file "${options.cookieFile}" does not exist`);
            const credentials = JSON.parse(readFileSync(options.cookieFile).toString()) as Partial<LiveJournalCookieData>;
            this.cookie.ljSession = credentials.ljSession;
            this.cookie.expires = (credentials.expires && credentials.ljSession) ? new Date(credentials.expires) : undefined;
            this.verbose(`Loaded cookie file "${options.cookieFile}"`);
            this.verbose(this.cookie);
        }

        this.cookieRefresh = options.cookieRefresh ?? "long";

        this.userAgent = 'XML-RPC/0.9';
    }


    private async initXmlRpc(): Promise<XmlRpcClient> {
        if (this.authMethod === "cookie") {
            this.ljXmlRpc = new XmlRpcClient(LIVEJOURNAL_XMLRPC_URL, { headers: (await this.getCookieHeader()) });
        } else {
            this.ljXmlRpc = new XmlRpcClient(LIVEJOURNAL_XMLRPC_URL);
        }
        return this.ljXmlRpc;
    }

    /**
     * Calls a LiveJournal API method
     * @param method API method name
     * @param params params, excluding version and auth settings
     * @throws Error if API returns an Error
     * @returns API answer
     */
    private async methodCall<TReturn extends XmlRpcValue = any>(method: LiveJournalApiMethod, params: XmlRpcStruct = {}): Promise<TReturn> {
        if (this.ljXmlRpc === undefined) this.ljXmlRpc = await this.initXmlRpc();
        return this.ljXmlRpc.methodCall(`LJ.XMLRPC.${method}`, [Object.assign({ version: 1 }, this.getAuthParams(), params)]).catch(err => {
            if (err instanceof XmlRpcFault) {
                throw new LiveJournalApiError(err.faultString, err.code);
            }
            throw err;
        }) as Promise<TReturn>;
    };


    // API Methods


    // TODO addcomment
    // public addcomment(params: any): Promise<any> { return this.methodCall('addcomment'); }

    // TODO convert
    /**
     * 
     * @param params 
     * @returns 
     */
    public checkFriends(params: LiveJournalCheckFriendsOptions): Promise<LiveJournalCheckFriendsResponse> {
        return this.methodCall('checkfriends', params);
    };

    /**
     * 
     * @returns 
     */
    public checksession(): Promise<LiveJournalCheckSessionResponse> {
        return this.methodCall('checksession');
    };

    // TODO consolecommand
    // public consolecommand(params: any): Promise<any> { return this.methodCall('consolecommand'); }
    // TODO createpoll
    // public createpoll(params: any): Promise<any> { return this.methodCall('createpoll'); }
    // TODO createrepost
    // public createrepost(params: any): Promise<any> { return this.methodCall('createrepost'); }
    // TODO deletecomments
    // public deletecomments(params: any): Promise<any> { return this.methodCall('deletecomments'); }
    // TODO deleterepost
    // public deleterepost(params: any): Promise<any> { return this.methodCall('deleterepost'); }
    // TODO editcomment
    // public editcomment(params: any): Promise<any> { return this.methodCall('editcomment'); }
    // TODO editevent
    // public editevent(params: any): Promise<any> { return this.methodCall('editevent'); }
    // TODO editfriendgroups
    // public editfriendgroups(params: any): Promise<any> { return this.methodCall('editfriendgroups'); }
    // TODO editfriends
    // public editfriends(params: any): Promise<any> { return this.methodCall('editfriends'); }
    // TODO editpoll
    // public editpoll(params: any): Promise<any> { return this.methodCall('editpoll'); }

    /**
     * Get a list of users who friended the current user
     * @param friendoflimit If the value is above 0, the number of users returned cannot be above the defined value
     * @returns List of friends
     */
    public getFriendOf(friendoflimit: number = 0): Promise<LiveJournalFriend[]> {
        return this.methodCall('friendof', { friendoflimit: friendoflimit }).then(
            (response: LiveJournalGetFriendsOfResponse) => response.friendofs
        );
    };

    /**
     * Note: The validity of a generated challenge value is limited to 60 seconds!
     * @returns 
     */
    public getChallenge(): Promise<LiveJournalGetChallengeResponse> {
        return this.methodCall('getchallenge');
    };

    /**
     * Get comments for an item (undocumented API endpoint)
     * @param itemId Article ID
     * @returns List of comments
     */
    public getComments(params: LiveJournalGetCommentsOptions): Promise<LiveJournalGetCommentsResponseBasic> {
        return this.methodCall("getcomments", convertLiveJournalGetCommentsOptions(params))
            .then(convertLiveJournalGetCommentsResponse);
    }

    /**
     * This function returns the number of LJ entries per day
     * @param usejournal Name of the journal for which counts are being requested and retrieved. By default, it returns values for the current user
     * @returns number of LJ entries per day
     */
    public getdaycounts(usejournal?: string): Promise<any> {
        return this.methodCall('getdaycounts', usejournal ? { usejournal: usejournal } : {});
    };

    /**
     * Get Events
     * @param params 
     * @returns 
     */
    public getEvents(params: LiveJournalGetEventsOptions): Promise<LiveJournalGetEventResponse> {
        return this.methodCall<LiveJournalGetEventResponseRaw>('getevents', params).then(resp => {
            return {
                skip: resp.skip,
                events: resp.events.map((e: any) => convertLiveJournalEventRaw(e)),
                lastsync: convertLiveJournalDateString(resp.lastsync)
            };
        });
    };

    /**
     * Get list of user-defined Friends groups
     * @returns 
     */
    public getfriendgroups(): Promise<LiveJournalFriendGroup[]> {
        return this.methodCall<LiveJournalGetFriendGroupsResponseRaw>('getfriendgroups')
            .then(response => convertGetFriendGroupsResponse(response).friendgroups);
    };

    /**
     * Get list of friends
     * @param params Params
     * @returns List of friends, optionally friendsof and friend groups
     */
    public getFriends(params: LiveJournalGetFriendsOptionsIncludeFriendOf & LiveJournalGetFriendsOptionsIncludeGroups): Promise<LiveJournalGetFriendsResponseWithFriendGroupsAndFriendOfs>;
    public getFriends(params: LiveJournalGetFriendsOptionsIncludeFriendOf): Promise<LiveJournalGetFriendsResponseWithFriendOfs>;
    public getFriends(params: LiveJournalGetFriendsOptionsIncludeGroups): Promise<LiveJournalGetFriendsResponseWithFriendGroups>;
    public getFriends(params: LiveJournalGetFriendsOptions): Promise<LiveJournalGetFriendsResponse>;
    public getFriends(): Promise<LiveJournalGetFriendsResponse>;
    public getFriends(params: LiveJournalGetFriendsOptions = {}): Promise<LiveJournalGetFriendsResponse> {
        return this.methodCall<LiveJournalGetFriendsResponse>("getfriends", convertLiveJournalGetFriendsOptions(params));
    };

    /**
     * Get Friends page
     * @param params Params
     * @returns Friends page response
     */
    public getFriendsPage(params: LiveJournalGetFriendsPageOptions = {}): Promise<LiveJournalGetFriendsPageResponse> {
        return this.methodCall('getfriendspage', convertLiveJournalGetFriendsPageOptions(params)).then(resp => {
            return {
                skip: resp.skip,
                entries: resp.entries.map((e: any) => convertLiveJournalFriendsEvent(e)),
            };
        });
    };

    /**
     * Get incoming private messages
     * @param params 
     * @returns 
     */
    public getInbox(params: LiveJournalGetInboxOptionsExtended): Promise<LiveJournalGetInboxResponseExtended>;
    public getInbox(params: LiveJournalGetInboxOptionsRegular): Promise<LiveJournalGetInboxResponseRegular>;
    public getInbox(params: LiveJournalGetInboxOptions): Promise<LiveJournalGetInboxResponse> {
        return this.methodCall<LiveJournalGetInboxResponse>('getinbox', params);
    };

    /**
     * Get Poll
     * @param params Get poll options
     * @param {LiveJournalPollMode} [params.pollid='all'] Poll mode, default='all'
     * @returns 
     */
    public getPoll(params: LiveJournalGetPollOptions): Promise<LiveJournalPoll> {
        return this.methodCall('getpoll', params);
    };

    // TODO getpushlist
    // public getpushlist(params: any): Promise<any> { return this.methodCall('getpushlist'); }

    /**
     * 
     * @param params 
     * @returns 
     */
    public getRecentComments(params: LiveJournalGetRecentCommentsOptionsRaw = {}): Promise<LiveJournalComment[]> {
        return this.methodCall('getrecentcomments').then(
            (response: LiveJournalGetRecentCommentsResponse) => response.comments.map(convertLiveJournalRecentComment)
        );
    };

    // TODO getrepoststatus
    // public getrepoststatus(params: any): Promise<any> { return this.methodCall('getrepoststatus'); }

    /**
     * 
     * @returns 
     */
    public getUserPics(): Promise<LiveJournalGetUserPicsResponse> {
        return this.methodCall("getuserpics");
    };

    /**
     * Get User Tags
     * @param usejournal Journal name to get tags for
     * @returns List of User tags
     */
    public getUserTags(usejournal: string): Promise<LiveJournalUserTag[]> {
        return this.methodCall('getusertags', { usejournal: usejournal }).then(
            (response: LiveJournalGetUserTagsResponse) => response.tags
        );
    };

    /**
     * Get User Profile Info
     * @param params 
     * @returns 
     */
    public getUserProfile(params: LiveJournalGetUserProfileOptions = {}): Promise<LiveJournalUserProfile> {
        return this.methodCall('login', params);
    };

    // TODO postevent
    // public postevent(params: any): Promise<any> { return this.methodCall('postevent'); }
    // TODO pushsubscriptions
    // public pushsubscriptions(params: any): Promise<any> { return this.methodCall('pushsubscriptions'); }
    // TODO registerpush
    // public registerpush(params: any): Promise<any> { return this.methodCall('registerpush'); }
    // TODO resetpushcounter
    // public resetpushcounter(params: any): Promise<any> { return this.methodCall('resetpushcounter'); }
    // TODO sendmessage
    // public sendmessage(params: any): Promise<any> { return this.methodCall('sendmessage'); }
    // TODO sessionexpire
    // public sessionexpire(params: any): Promise<any> { return this.methodCall('sessionexpire'); }

    /**
     * The function generates a session and returns its ID (cookies).
     * @param params Params
     * @returns Session ID
     */
    public sessionGenerate(expiration: LiveJournalCookieDuration = "long", bindtoip: boolean = false): Promise<LiveJournalSessionGenerateResponse> {
        return this.methodCall('sessiongenerate', {
            Expiration: expiration,
            bindtoip: convertToLiveJournalApiBool(bindtoip)
        }).then(resp => Object.assign(resp, { expires: addDays(new Date(), expiration == "long" ? 30 : 1) }));
    };

    // TODO setmessageread
    // public setmessageread(params: any): Promise<any> { return this.methodCall('setmessageread'); }
    // TODO syncitems
    // public syncitems(params: any): Promise<any> { return this.methodCall('syncitems'); }
    // TODO unregisterpush
    // public unregisterpush(params: any): Promise<any> { return this.methodCall('unregisterpush'); }

    // TODO test updateComments
    /**
     * 
     * @param params 
     * @returns 
     */
    public updateComments(params: LiveJournalUpdateCommentsOptions): Promise<LiveJournalUpdateCommentsResponse> {
        return this.methodCall('updatecomments', params);
    };

    // TODO votepoll
    // public votepoll(params: LiveJournalUpdateCommentsOptions): Promise<any> { return this.methodCall('votepoll'); }

    protected async refreshCookie(force: boolean = false): Promise<LiveJournalCookieData> {
        if (isValidCookie(this.cookie) && !force) {
            return this.cookie;
        } else {
            this.verbose(`Creating new cookie session`);
            const newSession = await this.sessionGenerate(this.cookieRefresh);
            const newCookie: LiveJournalCookieData = {
                ljSession: newSession.ljsession,
                expires: newSession.expires,
            };
            this.verbose(newCookie);
            this.cookie = newCookie;
            return newCookie;
        }
    }

    public async getLjSession(): Promise<string> {
        return (await this.refreshCookie()).ljSession;
    }

    protected async ljWebFormPostRequest(url: string, params: { [key: string]: string | number | undefined; }): Promise<NodeJS.ReadableStream> {
        this.verbose(`ljWebFormPostRequest to ${url}`);
        const formItems = [];
        for (let paramName in params) {
            formItems.push(`${paramName}=${params[paramName]}`);
        }
        const formData = formItems.join('&');
        this.verbose(formData);

        return fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'accept': '*/*',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                ...(await this.getCookieHeader())
            }
        }).then(res => res.body);
    }

    protected async ljWebGetRequest(url: string, params: { [key: string]: string | number | undefined; }): Promise<NodeJS.ReadableStream> {
        this.verbose(`ljWebFormPostRequest to ${url}`);
        const formItems = [];
        for (let paramName in params) {
            formItems.push(`${paramName}=${params[paramName]}`);
        }
        const formData = formItems.join('&');
        this.verbose(formData);

        return fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'accept': '*/*',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                ...(await this.getCookieHeader())
            }
        }).then(res => res.body);
    }

    // Export methods, not part of the XMLRPC API

    public getRawCommentsExport(params: any): Promise<NodeJS.ReadableStream> {
        return this.ljWebFormPostRequest(`${LIVEJOURNAL_EXPORT_COMMENTS_URL}?authas=${this.staticAuthParams.username}`, convertLiveJournalExportOptions(params));
    }


    public getRawPostsExport(params: LiveJournalExportOptions): Promise<NodeJS.ReadableStream> {
        return this.ljWebFormPostRequest(`${LIVEJOURNAL_EXPORT_POSTS_URL}?authas=${this.staticAuthParams.username}`, convertLiveJournalExportOptions(params));
    }

    public getPostsExport(params: LiveJournalExportOptionsCsv): Promise<LiveJournalExportEvent[]> {
        return this.getRawPostsExport({
            ...params,
            format: 'csv',
            field_itemid: true,
            field_eventtime: true,
            field_logtime: true,
            field_subject: true,
            field_event: true,
            field_security: true,
            field_allowmask: true,
            field_currents: true
        }).then(parsePostExportsCsv);
    };

    // Non-API methods

    /**
     * Get icons for a specific user.
     * This is not an official API method but instead scrapes the icons from the website, as there
     * is no API method with this functionality
     * @param user 
     * @returns 
     */
    public async getIcons(user: string): Promise<LiveJournalIconInfo[]> {
        return fetch(`${LIVEJOURNAL_URL}/allpics.bml?user=${user}`, {
            headers: await this.getCookieHeader()
        }).then(res => res.text())
            .then(body => {
                return getIconsFromHTML(body);
            });
    }
}

export function isValidCookie(cookie: Partial<LiveJournalCookieData>): cookie is LiveJournalCookieData {
    return cookie.expires !== undefined
        && cookie.ljSession !== undefined
        && cookie.expires > new Date();
}

export default LiveJournalApi;