import { XmlRpcClient, XmlRpcFault, XmlRpcStruct } from "@foxglove/xmlrpc";
import { LiveJournalApiAuthOptions } from "./LiveJournalApiAuthOptions";
import { LiveJournalGetEventResponse, LiveJournalEventRaw } from "./LiveJournalEvent";
import { LiveJournalGetEventsOptions, LiveJournalGetEventsOptionsOne } from "./LiveJournalGetEventsOptions";

const ljXmlRpc = new XmlRpcClient("http://www.livejournal.com/interface/xmlrpc");

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
    'essionexpire',
    'sessiongenerate',
    'syncitems',
    'getfriendspage',
    'getcomments',
    'addcomment'
] as const;
export type LiveJournalApiMethod = typeof LIVEJOURNAL_API_METHODS[number];

export class LiveJournalApiError extends Error {
    public constructor(message: string = "Unknown LiveJournal API Error", public readonly code?: number) {
        super(message);
    }
};

export class LiveJournalApi {

    public constructor(private authOptions: LiveJournalApiAuthOptions) {
    }

    private methodCall(method: LiveJournalApiMethod, params: XmlRpcStruct): Promise<any> {
        return ljXmlRpc.methodCall(`LJ.XMLRPC.${method}`, [Object.assign({ version: 1 }, this.authOptions, params)]);
    }

    public getEvents(params: LiveJournalGetEventsOptions): Promise<LiveJournalGetEventResponse> {
        // TODO type checks
        return this.methodCall('getevents', params).catch(err => {
            if (err instanceof XmlRpcFault) {
                throw new LiveJournalApiError(err.faultString, err.code);
            }
        });
    }
}