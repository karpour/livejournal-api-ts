import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import LiveJournalApi, { LiveJournalUserPicFileFormats } from "..";
import {
    LiveJournalEvent,
    LiveJournalExportEvent,
    LiveJournalFriend,
    LiveJournalFriendGroup,
    LiveJournalIconInfo,
    LiveJournalUserProfile
} from "../types";
import { createYearMonthGenerator } from "../createYearMonthGenerator";
import { createExportEventGenerator } from "../parsePostExportsCsv";

import { pipeline } from "stream/promises";


export type LiveJournalFriendExtended = LiveJournalFriend & {
    user_pics: LiveJournalIconInfo[];
};
// This is very much a WIP

const credentials = JSON.parse(readFileSync("credentials.json").toString());
const username = credentials.username;
const password = credentials.password;

const OUT_DIR = "./output/";

const FRIENDS_FILE = path.join(OUT_DIR, 'friends.json');
const FRIENDOF_FILE = path.join(OUT_DIR, 'friendof.json');
const FRIENDGROUPS_FILE = path.join(OUT_DIR, 'friendgroups.json');
const USERPROFILE_FILE = path.join(OUT_DIR, 'userprofile.json');
const EVENT_FILE = path.join(OUT_DIR, 'events.json');
const EXPORT_EVENTS_DIR = path.join(OUT_DIR, 'export_events');
const EXPORT_EVENTS_CSV_DIR = path.join(OUT_DIR, 'export_events_csv');
const USERPICS_DIR = path.join(OUT_DIR, 'user_pics');

const ljApi = new LiveJournalApi({
    authMethod: "clear",
    username: username,
    password: password,
    cookieFile: 'cookie.json',
    throttle: true,
    //verbose: true,
    maxRequestsPerSecond: 1
});

function parseDefaultIconUrl(url: string, username: string): string {
    const RegExp_Icon_Url = /^https?:\/\/l-userpic.livejournal.com\/\d+\/(\d+)$/;
    const regExpResult = RegExp_Icon_Url.exec(url);
    if (regExpResult) {
        return `${regExpResult[1]}_${username}.png`;
    }
    throw new Error(`Invalid URL: ${url}`);
}

async function main() {

    mkdirSync(OUT_DIR, { recursive: true });

    const friends = await getFriends();
    mkdirSync(USERPICS_DIR, { recursive: true });

    for (let friend of friends) {
        console.log(friend.username);
        let userPics = await ljApi.getIcons(friend.username);
        for (let icon of userPics) {
            console.log(`  ${icon.url} (${icon.description})`);
            const iconPath = path.join(USERPICS_DIR, `${icon.user_id}_${icon.icon_id}`);
            console.log(`    => ${iconPath}`);
            const userPicResult = await getUserPic(iconPath, icon.url);
            console.log(`Downloaded Pic ${userPicResult}`);
        }
    }
    //const friendOfs = await getFriendOf();
    //const friendGroups = await getFriendGroups();
    //const userProfile = await getUserProfile();

    //await getExportEvents();


    //const events = await getEvents();

    //const ev = events[0];
    //console.log(ev.event);
    //console.log('===============================');
    //console.log(convertLjPostToMarkdown(ev.event));


    //const usericonDir = path.join(OUT_DIR, "usericons");
    //mkdirSync(usericonDir, { recursive: true });

    /*for (let friend of friends) {
        if (friend.defaultpicurl) {
            try {
                let file = await getFile(path.join(usericonDir, parseDefaultIconUrl(friend.defaultpicurl, friend.user)), friend.defaultpicurl);
                console.log(`Downloaded ${friend.defaultpicurl} to ${file}`);
            } catch (err: any) {
                console.log(err.message);
            }
        }
    }*/

    //
}


async function getExportEvents() {
    const yearMonthGenerator = createYearMonthGenerator(new Date("2006-10-01"), new Date());
    mkdirSync(EXPORT_EVENTS_CSV_DIR, { recursive: true });
    console.log(`Getting post exports`);

    for (let yearMonth of yearMonthGenerator) {
        const fileName = `${yearMonth.year}-${String(yearMonth.month).padStart(2, '0')}.csv`;
        const filePath = path.join(EXPORT_EVENTS_CSV_DIR, fileName);

        if (existsSync(filePath)) {
            console.log(`Already exists: ${filePath}`);
        } else {
            console.log(`Writing ${filePath}`);

            const file = createWriteStream(filePath);
            const responseFileStream = await ljApi.getRawPostsExportCsv({ year: yearMonth.year, month: yearMonth.month });
            responseFileStream.pipe(file);
            await new Promise(resolve => {
                responseFileStream.on("end", resolve);
            });
        }

        const exportGenerator = createExportEventGenerator(createReadStream(filePath));
        for await (let item of exportGenerator) {
            writeExportEvent(item);
        }
    }
}

function writeExportEvent(event: LiveJournalExportEvent) {
    mkdirSync(EXPORT_EVENTS_DIR, { recursive: true });
    const filePath = path.join(EXPORT_EVENTS_DIR, `${event.itemid}.json`);
    if (existsSync(filePath)) {
        console.log(`Already exists: ${filePath}`);
    } else {
        console.log(`Writing ${filePath}: ${event.subject}`);
        writeFileSync(filePath, JSON.stringify(event, null, 4));
    }
}

async function getEvents(): Promise<LiveJournalEvent[]> {
    if (existsSync(EVENT_FILE)) {
        console.log(`Reading events from ${EVENT_FILE} `);
        return JSON.parse(readFileSync(EVENT_FILE).toString()) as LiveJournalEvent[];
    } else {
        console.log("Importing friends");
        const events = (await ljApi.getEvents({
            selecttype: "lastn",
            usejournal: "karpour",
            lineendings: "unix",
            parseljtags: false,
        })).events;
        writeFileSync(EVENT_FILE, JSON.stringify(events, null, 4));
        return events;
    }
}


function userPicExists(userPicPathWithoutExtension: string): boolean {
    const paths = LiveJournalUserPicFileFormats.map(format => `${userPicPathWithoutExtension}.${format}`);
    for (let path of paths) {
        //console.log(`  Checking ${path}`);
        if (existsSync(path)) {
            console.log(`    File Exists: ${path}`);
            return true;
        }
    }
    return false;
}

async function getUserPic(target: string, url: string, force: boolean = false): Promise<string> {
    if (userPicExists(target)) {
        console.log(`Skipping ${url}`);
        return target;
    }
    const response = await ljApi.downloadUserPic(url);
    //console.log(response);
    const targetFilePath = `${target}.${response.file_type}`;
    const targetFile = createWriteStream(targetFilePath);
    await pipeline(response.file, targetFile);
    return targetFilePath;
}


async function getFriends(): Promise<LiveJournalFriend[]> {
    if (existsSync(FRIENDS_FILE)) {
        console.log(`Reading friends from ${FRIENDS_FILE} `);
        return JSON.parse(readFileSync(FRIENDS_FILE).toString()) as LiveJournalFriend[];
    } else {
        console.log("Importing friends");
        const friends = (await ljApi.getFriends()).friends;
        writeFileSync(FRIENDS_FILE, JSON.stringify(friends, null, 4));
        return friends;
    }
}

async function getFriendOf(): Promise<LiveJournalFriend[]> {
    if (existsSync(FRIENDOF_FILE)) {
        console.log(`Reading friendof from ${FRIENDOF_FILE} `);
        return JSON.parse(readFileSync(FRIENDOF_FILE).toString()) as LiveJournalFriend[];
    } else {
        console.log("Importing friendof");
        const friendofs: LiveJournalFriend[] = (await ljApi.getFriends({ includefriendof: true })).friendofs;
        writeFileSync(FRIENDOF_FILE, JSON.stringify(friendofs, null, 4));
        return friendofs;
    }
}

async function getFriendGroups(): Promise<LiveJournalFriendGroup[]> {
    if (existsSync(FRIENDGROUPS_FILE)) {
        console.log(`Reading friend groups from ${FRIENDGROUPS_FILE} `);
        return JSON.parse(readFileSync(FRIENDGROUPS_FILE).toString()) as LiveJournalFriendGroup[];
    } else {
        console.log("Importing friend groups");
        const friendgroups: LiveJournalFriendGroup[] = (await ljApi.getFriends({ includegroups: true })).friendgroups;
        writeFileSync(FRIENDGROUPS_FILE, JSON.stringify(friendgroups, null, 4));
        return friendgroups;
    }
}

async function getUserProfile(): Promise<LiveJournalUserProfile> {
    if (existsSync(USERPROFILE_FILE)) {
        console.log(`Reading user profile from ${USERPROFILE_FILE} `);
        return JSON.parse(readFileSync(USERPROFILE_FILE).toString()) as LiveJournalUserProfile;
    } else {
        console.log("Importing user profile");
        const userprofile: LiveJournalUserProfile = await ljApi.getUserProfile({
            getcaps: true,
            getmenus: true,
            getpickws: true,
            getpickwurls: true
        });
        writeFileSync(USERPROFILE_FILE, JSON.stringify(userprofile, null, 4));
        return userprofile;
    }
}

main();
