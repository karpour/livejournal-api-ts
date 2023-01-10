import { mkdirSync, readFileSync } from "fs";
import path from "path";
import LiveJournalApi from "..";
import { LiveJournalFriend, LiveJournalIconInfo } from "../types";
import LJDumper from "./LJDumper";


export type LiveJournalFriendExtended = LiveJournalFriend & {
    user_pics: LiveJournalIconInfo[];
};
// This is very much a WIP

const credentials = JSON.parse(readFileSync("credentials_henrieke.json").toString());
const username = credentials.username;
const password = credentials.password;

const OUT_DIR = `./output/${username}/`;


const ljApi = new LiveJournalApi({
    authMethod: "clear",
    username: username,
    password: password,
    cookieFile: `~/.livejournal.cookie.${username}.json`,
    throttle: true,
    //verbose: true,
    maxRequestsPerSecond: 1
});

async function main() {
    const ljDumper: LJDumper = new LJDumper(ljApi, OUT_DIR);

    const friendOfs = await ljDumper.getFriendOf();
    const friendGroups = await ljDumper.getFriendGroups();
    const userProfile = await ljDumper.getUserProfile();

    //await ljDumper.getExportEvents();


    const events = await ljDumper.getEvents();

    await ljDumper.archiveFriendsPics();

    //const ev = events[0];
    //console.log(ev.event);
    //console.log('===============================');
    //console.log(convertLjPostToMarkdown(ev.event));

    // TODO
    // combine posts with ids
    // get comments for each entry
}



main();
