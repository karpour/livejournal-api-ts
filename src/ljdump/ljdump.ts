import { mkdirSync, readdirSync, readFileSync } from "fs";
import path from "path";
import LiveJournalApi from "..";
import { LiveJournalFriend, LiveJournalIconInfo } from "../types";
import LJDumper, { sleepMs } from "./LJDumper";



// This is very much a WIP

const credentials = JSON.parse(readFileSync("credentials_henrieke.json").toString());
//const credentials = JSON.parse(readFileSync("credentials.json").toString());
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
    const header = (text: string) => console.log(`\n\x1b[32m${text}\x1b[0m`);
    const ljDumper: LJDumper = new LJDumper(ljApi, OUT_DIR);
    header("Getting friends");
    const friends = await ljDumper.getFriends();

    header("Getting friend of");
    const friendOfs = await ljDumper.getFriendOf();

    header("Getting friend groups");
    const friendGroups = await ljDumper.getFriendGroups();

    header("Getting user profile");
    const userProfile = await ljDumper.getUserProfile();

    header("Getting recent events");
    const recentEvents = await ljDumper.getEvents();

    header("Getting export events");
    await ljDumper.getExportEvents();

    header("Getting comments");
    const events = await ljDumper.readExportEvents();

    await ljDumper.getAllComments(events);

    // Get user data of commenters
    const friendUsernames = friends.map(u => u.username);
    const friendOfUsernames = friendOfs.map(u => u.username);
    const existingPeopleUsernames = [...friendUsernames, ...friendOfUsernames];
    // Array of people who commented but are neither friends nor friendofs
    const commenterUsernames = [...new Set((await ljDumper.readExportComments()).map(c => c.postername))]
        .sort()
        .filter(s => s !== "")
        .filter(s => existingPeopleUsernames.find(f => f == s) == undefined);
    const allUsernames = [...new Set([...existingPeopleUsernames, ...commenterUsernames, username])];

    header("Archiving user icons");
    await ljDumper.archivePicsByUsername(commenterUsernames);

    // Get foaf data
    header(`Getting foaf data`);
    await ljDumper.getFoaf(allUsernames);

    header(`Getting profile data`);
    await ljDumper.getProfiles(allUsernames);

    header(`Getting inbox`);
    await ljDumper.getInbox();



    //header(`Archiving friend journals`);
    //for (let friend of friends) {
    //    const friendName = friend.username;
    //    header(`Archiving ${friendName}`);
    //    const dumper = new LJDumper(ljApi, `./output/friendjournals/${friendName}/`);
    //    await dumper.getEvents(friendName);
    //}


    //const ev = events[0];
    //console.log(ev.event);
    //console.log('===============================');
    //console.log(convertLjPostToMarkdown(ev.event));
}

main();
