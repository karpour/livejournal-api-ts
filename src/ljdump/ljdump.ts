import { mkdirSync, readdirSync, readFileSync } from "fs";
import path from "path";
import LiveJournalApi from "..";
import { LiveJournalFriend, LiveJournalIconInfo } from "../types";
import LJDumper from "./LJDumper";



// This is very much a WIP

const credentials = JSON.parse(readFileSync("credentials.json").toString());
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
    /*
        console.log("Getting friends");
        await ljDumper.getFriends();
        console.log("Getting friend of");
        const friendOfs = await ljDumper.getFriendOf();
        console.log("Getting friend groups");
        const friendGroups = await ljDumper.getFriendGroups();
        console.log("Getting user profile");
        const userProfile = await ljDumper.getUserProfile();
    
        console.log("Getting recent events");
        //const recentEvents = await ljDumper.getEvents();
    
        console.log("Getting export events");
        //await ljDumper.getExportEvents();
    
        console.log("Getting comments");
        const events = await ljDumper.readExportEvents();
    
        const numEvents = events.length;
        let cnt = 0;
        for (const event of events) {
            try {
                console.log(`Getting comments for ${event.itemid} (${++cnt}/${numEvents})`);
                await ljDumper.getComments(event.itemid);
            } catch (e) {
                console.log(e);
                console.error("Failed");
            }
        }
    */
    while (true) {
        try {
            console.log("Archiving user icons");
            await ljDumper.archiveFriendsPics();
        } catch {
            console.log("Retrying");
            continue;
        }
        break;
    }

    //const ev = events[0];
    //console.log(ev.event);
    //console.log('===============================');
    //console.log(convertLjPostToMarkdown(ev.event));
}

main();
