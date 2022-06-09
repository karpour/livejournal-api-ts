import { XmlRpcClient, XmlRpcFault, XmlRpcStruct, XmlRpcValue } from "@foxglove/xmlrpc";
import { existsSync, readFileSync } from "fs";
import fetch from "node-fetch";

import {
    convertLiveJournalCheckFriendsOptions,
    convertLiveJournalExportOptions,
    convertLiveJournalGetCommentsOptions,
    convertLiveJournalGetFriendsOptions,
    convertLiveJournalGetFriendsPageOptions,
    convertLiveJournalGetUserProfileOptions,
    LiveJournalCheckFriendsOptions,
    LiveJournalExportOptions,
    LiveJournalExportOptionsCsv,
    LiveJournalGetCommentsOptions,
    LiveJournalGetCommentsOptionsList,
    LiveJournalGetCommentsOptionsThread,
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
    LiveJournalGetUserProfileOptions,
    LiveJournalApiAuthMethod,
    LiveJournalApiOptions,
    LiveJournalApiAuthOptionsClear
} from './options';

import {
    convertGetFriendGroupsResponse,
    convertLiveJournalCheckFriendsResponse,
    convertLiveJournalGetCommentsResponse,
    convertLiveJournalGetEventResponse,
    convertLiveJournalGetFriendsPageResponse,
    convertLiveJournalGetFriendsResponse,
    LiveJournalCheckFriendsResponse,
    LiveJournalCheckFriendsResponseRaw,
    LiveJournalCheckSessionResponse,
    LiveJournalDayCountObject,
    LiveJournalGetChallengeResponse,
    LiveJournalGetCommentsResponse,
    LiveJournalGetCommentsResponseBasic,
    LiveJournalGetCommentsResponseExtended,
    LiveJournalGetCommentsResponseRaw,
    LiveJournalGetDayCountsResponseRaw,
    LiveJournalGetEventResponse,
    LiveJournalGetEventResponseRaw,
    LiveJournalGetFriendGroupsResponseRaw,
    LiveJournalGetFriendsOfResponse,
    LiveJournalGetFriendsPageResponse,
    LiveJournalGetFriendsPageResponseRaw,
    LiveJournalGetFriendsResponse,
    LiveJournalGetFriendsResponseRaw,
    LiveJournalGetFriendsResponseWithFriendGroups,
    LiveJournalGetFriendsResponseWithFriendGroupsAndFriendOfs,
    LiveJournalGetFriendsResponseWithFriendOfs,
    LiveJournalGetInboxResponse,
    LiveJournalGetInboxResponseExtended,
    LiveJournalGetInboxResponseRegular,
    LiveJournalGetRecentCommentsResponseRaw,
    LiveJournalGetUserPicsResponse,
    LiveJournalGetUserTagsResponse,
    LiveJournalSessionGenerateResponse,
    LiveJournalSessionGenerateResponseRaw,
} from './response';

import {
    convertLiveJournalPoll,
    convertLiveJournalRecentComment,
    convertLiveJournalUserProfile,
    convertToLiveJournalApiBool,
    LiveJournalComment,
    LiveJournalCookieDuration,
    LiveJournalExportEvent,
    LiveJournalFriend,
    LiveJournalFriendGroup,
    LiveJournalIconInfo,
    LiveJournalPoll,
    LiveJournalPollRaw,
    LiveJournalUserProfile,
    LiveJournalUserProfileRaw,
    LiveJournalUserTag,
} from './types';

import { LiveJournalApiError } from "./LiveJournalApiError";
import { isValidCookie, LiveJournalCookieData } from "./types/LiveJournalCookieData";
import { createExportEventGenerator, parsePostExportsCsv } from "./parsePostExportsCsv";
import { addDays } from "./addDays";
import { createYearMonthGenerator } from "./createYearMonthGenerator";
import { getIconsFromHTML } from "./getIconsFromHTML";

export const LIVEJOURNAL_URL = 'https://www.livejournal.com';
export const LIVEJOURNAL_EXPORT_POSTS_URL = `${LIVEJOURNAL_URL}/export_do.bml`;
export const LIVEJOURNAL_EXPORT_COMMENTS_URL = `${LIVEJOURNAL_URL}/export_comments.bml`;
export const LIVEJOURNAL_XMLRPC_URL = `${LIVEJOURNAL_URL}/interface/xmlrpc`;

/** Earliest data to check for posts */
export const LIVEJOURNAL_START_DATE = new Date("1999-04-01");

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
    protected userAgent: string;

    protected maxRequestsPerSecond: number;
    public throttle: boolean;
    protected _throttleDelay: number;
    /** Timestamp of last method call */
    public lastWebRequest = 0;

    protected verbose: (message: any) => void = () => { };
    protected getAuthParams: () => LiveJournalApiAuthParams;

    /**
     * 
     * @param options 
     */
    public constructor(options: LiveJournalApiOptions) {
        if (options.verbose) this.verbose = console.error;
        this.verbose(`Created LiveJournalApi instance`);

        this.throttle = options.throttle ?? false;
        this.maxRequestsPerSecond = options.maxRequestsPerSecond ?? 5;
        this._throttleDelay = Math.round(1000 / this.maxRequestsPerSecond);

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
            this.cookie.ljsession = credentials.ljsession;
            this.cookie.expires = (credentials.expires && credentials.ljsession) ? new Date(credentials.expires) : undefined;
            this.verbose(`Loaded cookie file "${options.cookieFile}"`);
            this.verbose(this.cookie);
        }

        this.cookieRefresh = options.cookieRefresh ?? "long";

        this.userAgent = 'XML-RPC/0.9';
    }

    /**
     * Get cookie header for HTTP requests, refreshes cookie if needed
     * @returns Header object
     */
    protected async getCookieHeader(): Promise<{ [key: string]: string; }> {
        return {
            'cookie': `ljsession=${(await this.getLjSession())}`,
            'X-LJ-Auth': 'cookie',
            'User-Agent': this.userAgent
        };
    }

    /**
     * Set max requests per second, applicable if {@link LiveJournalApi.throttle} is set to true
     * @param maxRequests Maximum number of requests the API client will do per second
     */
    public setMaxRequestsPerSecond(maxRequests: number): void {
        this.maxRequestsPerSecond = maxRequests;
        this._throttleDelay = Math.round(1000 / this.maxRequestsPerSecond);
    }

    /**
     * Get delay between two successive requests in ms, applicable if {@link LiveJournalApi.throttle} is set to true
     */
    public get throttleDelay(): number {
        return this._throttleDelay;
    }

    /**
     * Initializes XMLRPC client
     * @returns XmlRpcClient instance
     */
    private async initXmlRpc(): Promise<XmlRpcClient> {
        if (this.authMethod === "cookie") {
            this.ljXmlRpc = new XmlRpcClient(LIVEJOURNAL_XMLRPC_URL, { headers: (await this.getCookieHeader()) });
        } else {
            this.ljXmlRpc = new XmlRpcClient(LIVEJOURNAL_XMLRPC_URL);
        }
        return this.ljXmlRpc;
    }

    protected async refreshCookie(force: boolean = false): Promise<LiveJournalCookieData> {
        if (isValidCookie(this.cookie) && !force) {
            return this.cookie;
        } else {
            this.verbose(`Creating new cookie session`);
            const newSession = await this.sessionGenerate(this.cookieRefresh);
            const newCookie: LiveJournalCookieData = {
                ljsession: newSession.ljsession,
                expires: newSession.expires,
            };
            this.verbose(newCookie);
            this.cookie = newCookie;
            return newCookie;
        }
    }

    public async getLjSession(): Promise<string> {
        return (await this.refreshCookie()).ljsession;
    }

    // Request methods

    /**
     * Calls a LiveJournal API method
     * @param method API method name
     * @param params params, excluding version and auth settings
     * @throws Error if API returns an Error
     * @returns Parsed API response as object
     */
    @throttled()
    private async methodCall<TReturn extends XmlRpcValue = any>(method: LiveJournalApiMethod, params: XmlRpcStruct = {}): Promise<TReturn> {
        if (this.ljXmlRpc === undefined) this.ljXmlRpc = await this.initXmlRpc();
        return this.ljXmlRpc.methodCall(`LJ.XMLRPC.${method}`, [Object.assign({ version: 1 }, this.getAuthParams(), params)]).catch(err => {
            if (err instanceof XmlRpcFault) {
                throw new LiveJournalApiError(err.faultString, err.code);
            }
            throw err;
        }) as Promise<TReturn>;
    };

    @throttled()
    public async ljWebFormPostRequest(url: string, params: { [key: string]: string | number | undefined; }): Promise<NodeJS.ReadableStream> {
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

    @throttled()
    public async ljWebGetRequest(url: string, params: { [key: string]: string | number | undefined; }): Promise<NodeJS.ReadableStream> {
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

    /**
     * Get icons for a specific user.
     * This is not an official API method but instead scrapes the icons from the website, as there
     * is no API method with this functionality
     * @param user 
     * @returns 
     */
    @throttled()
    public async getIcons(user: string): Promise<LiveJournalIconInfo[]> {
        return fetch(`${LIVEJOURNAL_URL}/allpics.bml?user=${user}`, {
            headers: await this.getCookieHeader()
        }).then(res => res.text())
            .then(body => {
                return getIconsFromHTML(body);
            });
    }

    // API Methods

    // TODO addcomment
    // public addcomment(params: any): Promise<any> { return this.methodCall('addcomment'); }

    /**
     * 
     * @param params 
     * @returns 
     */
    public checkFriends(params: LiveJournalCheckFriendsOptions): Promise<LiveJournalCheckFriendsResponse> {
        return this.methodCall<LiveJournalCheckFriendsResponseRaw>('checkfriends', convertLiveJournalCheckFriendsOptions(params))
            .then(convertLiveJournalCheckFriendsResponse);
    };

    /**
     * Get session information
     * @returns Session information object
     */
    public checksession(): Promise<LiveJournalCheckSessionResponse> {
        return this.methodCall<LiveJournalCheckSessionResponse>('checksession');
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
        return this.methodCall<LiveJournalGetFriendsOfResponse>('friendof', { friendoflimit: friendoflimit })
            .then(response => response.friendofs);
    };

    /**
     * Get auth challenge
     * Note: The validity of a generated challenge value is limited to 60 seconds!
     * @returns 
     */
    public getChallenge(): Promise<LiveJournalGetChallengeResponse> {
        return this.methodCall<LiveJournalGetChallengeResponse>('getchallenge');
    };

    /**
     * Get comments for an item (undocumented API endpoint)
     * @param itemId Article ID
     * @returns List of comments
     */
    public getComments(params: LiveJournalGetCommentsOptionsThread): Promise<LiveJournalGetCommentsResponseBasic>;
    public getComments(params: LiveJournalGetCommentsOptionsList): Promise<LiveJournalGetCommentsResponseExtended>;
    public getComments(params: LiveJournalGetCommentsOptions): Promise<LiveJournalGetCommentsResponse>;
    public getComments(params: LiveJournalGetCommentsOptions): Promise<LiveJournalGetCommentsResponse> {
        return this.methodCall<LiveJournalGetCommentsResponseRaw>("getcomments", convertLiveJournalGetCommentsOptions(params))
            .then(convertLiveJournalGetCommentsResponse);
    }

    /**
     * This function returns the number of LJ entries per day
     * @param usejournal Name of the journal for which counts are being requested and retrieved. By default, it returns values for the current user
     * @returns number of LJ entries per day
     */
    public getDayCounts(usejournal?: string): Promise<LiveJournalDayCountObject[]> {
        return this.methodCall<LiveJournalGetDayCountsResponseRaw>('getdaycounts', usejournal ? { usejournal: usejournal } : {})
            .then(resp => resp.daycounts);
    };

    /**
     * Get Events
     * @param params getevents params
     * @returns Events response
     */
    public getEvents(params: LiveJournalGetEventsOptions): Promise<LiveJournalGetEventResponse> {
        return this.methodCall<LiveJournalGetEventResponseRaw>('getevents', params).then(convertLiveJournalGetEventResponse);
    };

    /**
     * Get list of user-defined Friends groups
     * @returns 
     */
    public getFriendGroups(): Promise<LiveJournalFriendGroup[]> {
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
        return this.methodCall<LiveJournalGetFriendsResponseRaw>("getfriends", convertLiveJournalGetFriendsOptions(params))
            .then(convertLiveJournalGetFriendsResponse);
    };

    /**
     * Get Friends page
     * @param params Params
     * @returns Friends page response
     */
    public getFriendsPage(params: LiveJournalGetFriendsPageOptions = {}): Promise<LiveJournalGetFriendsPageResponse> {
        return this.methodCall<LiveJournalGetFriendsPageResponseRaw>('getfriendspage', convertLiveJournalGetFriendsPageOptions(params))
            .then(convertLiveJournalGetFriendsPageResponse);
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
     * @param {LiveJournalPollMode} [params.mode='all'] Poll mode, default='all'
     * @returns 
     */
    public getPoll(params: LiveJournalGetPollOptions): Promise<LiveJournalPoll> {
        return this.methodCall<LiveJournalPollRaw>('getpoll', params)
            .then(convertLiveJournalPoll);
    };

    // TODO getpushlist
    // public getpushlist(params: any): Promise<any> { return this.methodCall('getpushlist'); }

    /**
     * Get recent comments
     * @param params 
     * @returns 
     */
    public getRecentComments(params: LiveJournalGetRecentCommentsOptionsRaw = {}): Promise<LiveJournalComment[]> {
        return this.methodCall<LiveJournalGetRecentCommentsResponseRaw>('getrecentcomments')
            .then(response => response.comments.map(convertLiveJournalRecentComment));
    };

    // TODO getrepoststatus
    // public getrepoststatus(params: any): Promise<any> { return this.methodCall('getrepoststatus'); }

    /**
     * 
     * @returns 
     */
    public getUserPics(): Promise<LiveJournalGetUserPicsResponse> {
        return this.methodCall<LiveJournalGetUserPicsResponse>("getuserpics");
    };

    /**
     * Get User Tags
     * @param usejournal Journal name to get tags for
     * @returns List of User tags
     */
    public getUserTags(usejournal: string): Promise<LiveJournalUserTag[]> {
        return this.methodCall<LiveJournalGetUserTagsResponse>('getusertags', { usejournal: usejournal })
            .then(response => response.tags);
    };

    /**
     * Get User Profile Info
     * @param params 
     * @returns 
     */
    public getUserProfile(params: LiveJournalGetUserProfileOptions = {}): Promise<LiveJournalUserProfile> {
        return this.methodCall<LiveJournalUserProfileRaw>('login', convertLiveJournalGetUserProfileOptions(params))
            .then(convertLiveJournalUserProfile);
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
        return this.methodCall<LiveJournalSessionGenerateResponseRaw>('sessiongenerate', {
            Expiration: expiration,
            bindtoip: convertToLiveJournalApiBool(bindtoip)
        }).then(resp => ({ ...resp, expires: addDays(new Date(), expiration == "long" ? 30 : 1) }));
    };

    // TODO setmessageread
    // public setmessageread(params: any): Promise<any> { return this.methodCall('setmessageread'); }
    // TODO syncitems
    // public syncitems(params: any): Promise<any> { return this.methodCall('syncitems'); }
    // TODO unregisterpush
    // public unregisterpush(params: any): Promise<any> { return this.methodCall('unregisterpush'); }

    // TODO test updateComments
    ///**
    // * 
    // * @param params 
    // * @returns 
    // */
    //public updateComments(params: LiveJournalUpdateCommentsOptions): Promise<LiveJournalUpdateCommentsResponse> {
    //    return this.methodCall<LiveJournalUpdateCommentsResponse>('updatecomments', params);
    //};

    // TODO votepoll
    // public votepoll(params: any): Promise<any> { return this.methodCall('votepoll'); }


    // Export methods, not part of the XMLRPC API

    // TODO
    //public getRawCommentsExport(params: any): Promise<NodeJS.ReadableStream> {
    //    return this.ljWebFormPostRequest(`${LIVEJOURNAL_EXPORT_COMMENTS_URL}?authas=${this.staticAuthParams.username}`, convertLiveJournalExportOptions(params));
    //}


    public getRawPostsExport(params: LiveJournalExportOptions): Promise<NodeJS.ReadableStream> {
        this.verbose(`Retrieving posts export for ${params.year}-${params.month} in ${params.format} format`);
        return this.ljWebFormPostRequest(`${LIVEJOURNAL_EXPORT_POSTS_URL}?authas=${this.staticAuthParams.username}`, convertLiveJournalExportOptions(params));
    }

    public getRawPostsExportCsv(params: LiveJournalExportOptionsCsv): Promise<NodeJS.ReadableStream> {
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
        });
    };

    public getSingleMonthPostsExport(params: LiveJournalExportOptionsCsv): Promise<LiveJournalExportEvent[]> {
        return this.getRawPostsExportCsv(params).then(parsePostExportsCsv);
    }

    public async *createPostsExportGenerator(startDate: Date = LIVEJOURNAL_START_DATE, endDate?: Date): AsyncGenerator<LiveJournalExportEvent> {
        const yearMonthGenerator = createYearMonthGenerator(startDate, endDate ?? new Date());
        for (const yearMonth of yearMonthGenerator) {
            const monthlyGenerator = createExportEventGenerator(await this.getRawPostsExportCsv({
                year: yearMonth.year,
                month: yearMonth.month
            }));
            for await (let exportEvent of monthlyGenerator) {
                yield exportEvent;
            }
        }
    }
}

export type Method<D, A extends Array<any> = any[]> = (...args: A) => D;

export function throttled() {
    return (target: LiveJournalApi, propertyName: string, descriptor: TypedPropertyDescriptor<Method<Promise<any>>>): TypedPropertyDescriptor<Method<Promise<any>>> => {
        if (descriptor.value) {
            /** Original method we're replacing */
            const originalMethod: Method<Promise<any>> = descriptor.value;

            /** Replacement function */
            descriptor.value = function Timeout(...args): Promise<any> {
                if (this instanceof LiveJournalApi) {
                    if (this.throttle) {
                        const timeDiff = this.lastWebRequest + this.throttleDelay - Date.now();
                        console.log(`timeDiff = ${timeDiff}ms`);
                        if (timeDiff > 0) {
                            this.lastWebRequest = Date.now() + timeDiff;
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve(originalMethod.apply(this, args));
                                }, timeDiff);
                            });
                        } else {
                            //console.log(`Running method ${propertyName} immediately`);
                            this.lastWebRequest = Date.now();
                            return originalMethod.apply(this, args);
                        }
                        //console.log(`lastWebRequest = ${new Date(this.lastWebRequest)}`);
                    } else {
                        //console.log(`No throttle enabled, running method ${propertyName} immediately`);
                        return originalMethod.apply(this, args);
                    }
                } else {
                    throw new Error('@throttled is applicable only on methods of class LiveJournalApi.');
                }
            };
            return descriptor;
        }
        throw new Error('@throttled is applicable only on a methods.');
    };
}


export default LiveJournalApi;