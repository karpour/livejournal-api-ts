import { XmlRpcClient, XmlRpcFault, XmlRpcStruct } from "@foxglove/xmlrpc";
import fetch from "node-fetch";

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
import { LiveJournalFriend } from "./LiveJournalFriend";
import { LiveJournalSessionGenerateResponse } from "./LiveJournalSessionGenerateResponse";
import { getIconsFromHTML } from "./getIconsFromHTML";
import { LiveJournalIconInfo } from "./LiveJournalIconInfo";
import { LiveJournalGetUserPicsResponse } from "./LiveJournalGetUserPicsResponse";
import { LiveJournalCheckFriendsOptions } from "./LiveJournalCheckFriendsOptions";
import { LiveJournalCheckFriendsResponse } from "./LiveJournalCheckFriendsResponse";
import { LiveJournalGetChallengeResponse } from "./LiveJournalGetChallengeResponse";
import { LiveJournalFriendGroup } from "./LiveJournalFriendGroup";
import { convertGetFriendGroupsResponse, LiveJournalGetFriendGroupsResponse } from "./LiveJournalGetFriendGroupsResponse";
import { LiveJournalUpdateCommentsOptions } from "./LiveJournalUpdateCommentsOptions";
import { LiveJournalUpdateCommentsResponse } from "./LiveJournalUpdateCommentsResponse";

const ljXmlRpc = new XmlRpcClient("https://www.livejournal.com/interface/xmlrpc");

const LIVEJOURNAL_API_METHODS = [
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

export class LiveJournalApi {
    private authOptions: LiveJournalApiAuthOptions;
    public constructor(user: string, password: string, authMethod: "clear" /*| "challenge" | "cookie" */ = "clear", cookieFile?: string) {
        this.authOptions = {
            username: user,
            password: password,
            auth_method: authMethod
        };
    }

    private getAuthParams(): LiveJournalApiAuthOptions {
        return this.authOptions;
    }

    /**
     * Calls a LiveJournal API method
     * @param method API method name
     * @param params params, excluding version and auth settings
     * @throws Error if API returns an Error
     * @returns API answer
     */
    private methodCall(method: LiveJournalApiMethod, params: XmlRpcStruct = {}): Promise<any> {
        return ljXmlRpc.methodCall(`LJ.XMLRPC.${method}`, [Object.assign({ version: 1 }, this.getAuthParams(), params)]).catch(err => {
            if (err instanceof XmlRpcFault) {
                throw new LiveJournalApiError(err.faultString, err.code);
            }
            throw err;
        });
    };


    // API Methods


    // TODO addcomment
    // public addcomment(params: any): Promise<any> { return this.methodCall('addcomment'); }

    /**
     * 
     * @param params 
     * @returns 
     */
    public checkFriends(params: LiveJournalCheckFriendsOptions): Promise<LiveJournalCheckFriendsResponse> {
        return this.methodCall('checkfriends');
    }

    /**
     * 
     * @returns 
     */
    public checksession(): Promise<LiveJournalCheckFriendsResponse> {
        return this.methodCall('checksession');
    }

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
    }

    /**
     * Get comments for an item (undocumented API endpoint)
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

    /**
     * This function returns the number of LJ entries per day
     * @param usejournal Name of the journal for which counts are being requested and retrieved. By default, it returns values for the current user
     * @returns number of LJ entries per day
     */
    public getdaycounts(usejournal?: string): Promise<any> {
        return this.methodCall('getdaycounts', usejournal ? { usejournal: usejournal } : {});
    }

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
     * Get list of user-defined Friends groups
     * @returns 
     */
    public getfriendgroups(): Promise<LiveJournalFriendGroup[]> {
        return this.methodCall('getfriendgroups').then(
            (response: LiveJournalGetFriendGroupsResponse) => {
                return convertGetFriendGroupsResponse(response).friendgroups;
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

    // TODO getinbox
    // public getinbox(params: any): Promise<any> { return this.methodCall('getinbox'); }
    // TODO getpoll
    // public getpoll(params: any): Promise<any> { return this.methodCall('getpoll'); }
    // TODO getpushlist
    // public getpushlist(params: any): Promise<any> { return this.methodCall('getpushlist'); }
    // TODO getrecentcomments
    // public getrecentcomments(params: any): Promise<any> { return this.methodCall('getrecentcomments'); }
    // TODO getrepoststatus
    // public getrepoststatus(params: any): Promise<any> { return this.methodCall('getrepoststatus'); }

    /**
     * 
     * @returns 
     */
    public getUserPics(): Promise<LiveJournalGetUserPicsResponse> {
        return this.methodCall("getuserpics");
    }

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
    public sessionGenerate(expiration: "short" | "long" = "long", bindtoip: boolean = false): Promise<LiveJournalSessionGenerateResponse> {
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
    }

    // TODO votepoll
    // public votepoll(params: LiveJournalUpdateCommentsOptions): Promise<any> { return this.methodCall('votepoll'); }

    /**
     * Get icons for a specific user.
     * This is not an official API method but instead scrapes the icons from the website, as there
     * is no API method with this functionality
     * @param user 
     * @returns 
     */
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

}

function addDays(date: Date, days: number): Date {
    return new Date(date.valueOf() + (days * 86400000));
};

