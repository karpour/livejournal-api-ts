# LiveJournal XML-RPC API client

This is a pure Typescript LiveJournal XMLRPC API client, primarily meant for backing up LiveJournal user data into JSON for archiving and self-hosting.

The API is based on the [LiveJournal XML-RPC Specification](https://wh.lj.ru/s2/developers/f/LiveJournal_XML-RPC_Specification_(EN).pdf) as well as the [LiveJournal source code](https://github.com/apparentlymart/livejournal/blob/master/cgi-bin/ljprotocol.pl)

## Example usage

```typescript
import { LiveJournalApi } from "./LiveJournalApi";

const ljApi = new LiveJournalApi("your_username", "your_password", "clear");

ljApi.getUserProfile({
    getcaps: 1,
    getmenus: 1,
    getmoods: 1,
    getpickws: 1,
    getpickwurls: 1
}).then(resp => console.log(resp));
```

## Implemented auth methods

- [x] `clear` 
- [ ] `challenge` 
- [ ] `cookie` 

## Implemented methods

- [ ] `addcomment`
- [ ] `checkfriends`
- [ ] `checksession`
- [ ] `consolecommand`
- [ ] `createpoll`
- [ ] `createrepost`
- [ ] `deletecomments`
- [ ] `deleterepost`
- [ ] `editcomment`
- [ ] `editevent`
- [ ] `editfriendgroups`
- [ ] `editfriends`
- [ ] `editpoll`
- [x] `friendof`
- [ ] `getchallenge`
- [x] `getcomments`
- [ ] `getdaycounts`
- [x] `getevents`
- [ ] `getfriendgroups`
- [x] `getfriends`
- [x] `getfriendspage`
- [ ] `getinbox`
- [ ] `getpoll`
- [ ] `getpushlist`
- [ ] `getrecentcomments`
- [ ] `getrepoststatus`
- [x] `getuserpics`
- [x] `getusertags`
- [x] `login`
- [ ] `postevent`
- [ ] `pushsubscriptions`
- [ ] `registerpush`
- [ ] `resetpushcounter`
- [ ] `sendmessage`
- [ ] `sessionexpire`
- [x] `sessiongenerate`
- [ ] `setmessageread`
- [ ] `syncitems`
- [ ] `unregisterpush`
- [ ] `updatecomments`
- [ ] `votepoll`