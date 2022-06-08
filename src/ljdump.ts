import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import LiveJournalApi from "./LiveJournalApi";
import https from "https";
import {
    LiveJournalEvent,
    LiveJournalFriend,
    LiveJournalFriendGroupInfo,
    LiveJournalUserProfile
} from "./types";
import convertLjPostToMarkdown from "./markdown/convertLjPostToMarkdown";

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

const ljApi = new LiveJournalApi({
    authMethod: "clear",
    username: username,
    password: password
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

    //const friends = await getFriends();
    //const friendOfs = await getFriendOf();
    //const friendGroups = await getFriendGroups();
    //const userProfile = await getUserProfile();
    const events = await getEvents();

    const ev = events[0];
    console.log(ev.event);
    console.log('===============================');
    console.log(convertLjPostToMarkdown(ev.event));


    const usericonDir = path.join(OUT_DIR, "usericons");
    mkdirSync(usericonDir, { recursive: true });

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

async function getFile(target: string, url: string, force: boolean = false): Promise<string> {
    if (existsSync(target)) {
        console.log(`Skipping ${url}`);
        return target;
    }
    return new Promise<string>((resolve, reject) => {
        const file = createWriteStream(target);
        const request = https.get(url, function (response) {
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                resolve(target);
            });

            file.on("error", (err) => reject(err));
        });
    });
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

async function getFriendGroups(): Promise<LiveJournalFriendGroupInfo[]> {
    if (existsSync(FRIENDGROUPS_FILE)) {
        console.log(`Reading friend groups from ${FRIENDGROUPS_FILE} `);
        return JSON.parse(readFileSync(FRIENDGROUPS_FILE).toString()) as LiveJournalFriendGroupInfo[];
    } else {
        console.log("Importing friend groups");
        const friendgroups: LiveJournalFriendGroupInfo[] = (await ljApi.getFriends({ includegroups: true })).friendgroups;
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
            getcaps: 1,
            getmenus: 1,
            getmoods: 1,
            getpickws: 1,
            getpickwurls: 1
        });
        writeFileSync(USERPROFILE_FILE, JSON.stringify(userprofile, null, 4));
        return userprofile;
    }
}

main();
