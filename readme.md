# LiveJournal XML-RPC API client

This is a pure Typescript LiveJournal XMLRPC API client, primarily meant for backing up LiveJournal user data into JSON for archiving and self-hosting.

The API is based on the [LiveJournal XML-RPC Specification](https://wh.lj.ru/s2/developers/f/LiveJournal_XML-RPC_Specification_(EN).pdf) as well as the [LiveJournal source code](https://github.com/apparentlymart/livejournal/blob/master/cgi-bin/ljprotocol.pl)

Apart from XML-RPC methods, the client also implements the livejournal post/comment export functions as well as web-scraping functions to make up for functionalities the api lacks.

For not getting yourself banned, read up on the [LiveJournal Bot Policy](https://web.archive.org/web/20160402163136/http://www.livejournal.com/bots/)

Archived information on exporting comments can be found here: [Exporting comments](https://web.archive.org/web/20160403023001/www.livejournal.com/developer/exporting.bml)

## Example usage

```typescript
import LiveJournalApi from "./LiveJournalApi";

const ljApi = new LiveJournalApi({
    authMethod: "clear",
    username: "your_username",
    password: "your_password",
});

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
- [x] `cookie` 

## Implemented methods

Currently no create, update or delete methods are implemented, only methods that read from the journal.

- [ ] `addcomment`
- [x] `checkfriends`
- [x] `checksession`
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
- [x] `getchallenge`
- [x] `getcomments`
- [x] `getdaycounts`
- [x] `getevents`
- [x] `getfriendgroups`
- [x] `getfriends`
- [x] `getfriendspage`
- [x] `getinbox`
- [x] `getpoll`
- [ ] `getpushlist`
- [x] `getrecentcomments`
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
- [x] `updatecomments`
- [ ] `votepoll`

### Web-scraping functions

- [x] `getUserIcons`

### Export functions

- [x] `exportPosts`[^expj]
- [ ] `exportComments`

## To Do

- Handle lj user elements
- Handle lj polls
- Handle line breaks properly when converting to markdown
- Add throttle function

[^expj]: [Export Journal](https://www.livejournal.com/export.bml)