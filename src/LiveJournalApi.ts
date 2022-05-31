import { XmlRpcClient, XmlRpcFault, XmlRpcStruct } from "@foxglove/xmlrpc";
import { LiveJournalApiAuthOptions } from "./LiveJournalApiAuthOptions";
import { convertLiveJournalDateString, convertLiveJournalEventRaw } from "./LiveJournalEvent";
import { convertToLiveJournalApiBool } from "./LiveJournalApiBool";
import { LiveJournalGetEventResponse } from "./LiveJournalGetEventResponse";
import { LiveJournalGetFriendsResponse, LiveJournalGetFriendsResponseWithFriendGroups, LiveJournalGetFriendsResponseWithFriendGroupsAndFriendOfs, LiveJournalGetFriendsResponseWithFriendOfs } from "./LiveJournalGetFriendsResponse";
import { LiveJournalGetEventsOptions } from "./LiveJournalGetEventsOptions";
import { convertLiveJournalGetFriendsOptions, LiveJournalGetFriendsOptions, LiveJournalGetFriendsOptionsIncludeFriendOf, LiveJournalGetFriendsOptionsIncludeGroups } from "./LiveJournalGetFriendsOptions";
import { convertLiveJournalGetFriendsPageOptions, LiveJournalGetFriendsPageOptions } from "./LiveJournalGetFriendsPageOptions";
import { LiveJournalGetFriendsPageResponse } from "./LiveJournalGetFriendsPageResponse";
import { convertLiveJournalFriendsEvent } from "./LiveJournalFriendsEvent";
import { LiveJournalApiError } from "./LiveJournalApiError";
import { LiveJournalGetUserProfileOptions, LiveJournalUserProfile } from "./LiveJournalUserProfile";
import { LiveJournalGetUserTagsResponse, LiveJournalUserTag } from "./LiveJournalUserTag";
import { LiveJournalGetFriendsOfResponse } from "./LiveJournalFriendOf";
import fetch from "node-fetch";
import { LiveJournalFriend } from "./LiveJournalFriend";
import { LiveJournalSessionGenerateResponse } from "./LiveJournalSessionGenerateResponse";
import { getIconsFromHTML } from "./getIconsFromHTML";
import { LiveJournalIconInfo } from "./LiveJournalIconInfo";

const ljXmlRpc = new XmlRpcClient("https://www.livejournal.com/interface/xmlrpc");

const LIVEJOURNAL_API_METHODS = [
    'checkfriends',
    'consolecommand',
    'editevent',
    'editfriendgroups',
    'editfriends',
    'friendof',
    'getchallenge',
    'getdaycounts',
    'getevents',
    'getfriends',
    'getfriendgroups',
    'getusertags',
    'login',
    'postevent',
    'sessionexpire',
    'sessiongenerate',
    'syncitems',
    'getfriendspage',
    'getcomments',
    'getrecentcomments',
    'addcomment'
] as const;
export type LiveJournalApiMethod = typeof LIVEJOURNAL_API_METHODS[number];

export class LiveJournalApi {
    private authOptions: LiveJournalApiAuthOptions;
    public constructor(user: string, password: string, authMethod: "clear" /*| "challenge" | "cookie" */ = "clear", cookieFile?: string) {
        this.authOptions = {
            username: user,
            password: password,
            auth_method: authMethod
        };
    }


    //public getChallenge();


    // public getInbox();

    private getAuthParams(): LiveJournalApiAuthOptions {
        return this.authOptions;
    }

    /**
     * The function generates a session and returns its ID (cookies).
     * @param params Params
     * @returns Session ID
     */
    public sessionGenerate(expiration: "short" | "long" = "long", bindtoip: boolean = false): Promise<LiveJournalSessionGenerateResponse> {
        return this.methodCall('sessiongenerate', {
            Expiration: expiration,
            bindtoip: convertToLiveJournalApiBool(bindtoip)
        }).then(resp => Object.assign(resp, { expires: addDays(new Date(), expiration == "long" ? 30 : 1) }));
    };

    /**
     * Calls a LiveJournal API method
     * @param method API method name
     * @param params params, excluding version and auth settings
     * @throws Error if API returns an Error
     * @returns API answer
     */
    private methodCall(method: LiveJournalApiMethod, params: XmlRpcStruct): Promise<any> {
        return ljXmlRpc.methodCall(`LJ.XMLRPC.${method}`, [Object.assign({ version: 1 }, this.getAuthParams(), params)]).catch(err => {
            if (err instanceof XmlRpcFault) {
                throw new LiveJournalApiError(err.faultString, err.code);
            }
            throw err;
        });
    };

    /**
     * Get User Profile Info
     * @param params 
     * @returns 
     */
    public getUserProfile(params: LiveJournalGetUserProfileOptions = {}): Promise<LiveJournalUserProfile> {
        return this.methodCall('login', params);
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
     * Get Events
     * @param params 
     * @returns 
     */
    public getEvents(params: LiveJournalGetEventsOptions): Promise<LiveJournalGetEventResponse> {
        // TODO type checks
        return this.methodCall('getevents', params).then(resp => {
            return {
                skip: resp.skip,
                events: resp.events.map((e: any) => convertLiveJournalEventRaw(e)),
                lastsync: convertLiveJournalDateString(resp.lastsync)
            };
        });
    };

    /**
     * Get comments for an item
     * @param itemId Article ID
     * @returns List of comments
     */
    public getComments(itemId: number) {
        return this.methodCall("getcomments", {
            usejournal: "karpour",
            itemid: itemId,
            expand_strategy: "expand_all"
        });
    }


    public getIcons(user: string): Promise<LiveJournalIconInfo[]> {
        // TODO cookie
        const cookie = "";
        return fetch(`https://www.livejournal.com/allpics.bml?user=${user}`, {
            headers: { 'cookie': `ljsession=${cookie}` }
        }).then(res => res.text())
            .then(body => {
                return getIconsFromHTML(body);
            });
    }

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
        return this.methodCall("getfriends", convertLiveJournalGetFriendsOptions(params));
    }
}

function addDays(date: Date, days: number): Date {
    return new Date(date.valueOf() + (days * 86400000));
};