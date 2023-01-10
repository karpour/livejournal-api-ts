import { createReadStream, createWriteStream, existsSync, fstat, mkdirSync, readFileSync, writeFileSync } from "fs";
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

export default class LJDumper {
    private readonly FRIENDS_FILE: string;
    private readonly FRIENDOF_FILE: string;
    private readonly FRIENDGROUPS_FILE: string;
    private readonly USERPROFILE_FILE: string;
    private readonly EVENT_FILE: string;
    private readonly EXPORT_EVENTS_DIR: string;
    private readonly EXPORT_EVENTS_CSV_DIR: string;
    private readonly USERPICS_DIR: string;


    public constructor(protected ljApi: LiveJournalApi, outDir: string) {
        this.FRIENDS_FILE = path.join(outDir, 'friends.json');
        this.FRIENDOF_FILE = path.join(outDir, 'friendof.json');
        this.FRIENDGROUPS_FILE = path.join(outDir, 'friendgroups.json');
        this.USERPROFILE_FILE = path.join(outDir, 'userprofile.json');
        this.EVENT_FILE = path.join(outDir, 'events.json');
        this.EXPORT_EVENTS_DIR = path.join(outDir, 'export_events');
        this.EXPORT_EVENTS_CSV_DIR = path.join(outDir, 'export_events_csv');
        this.USERPICS_DIR = path.join(outDir, 'user_pics');

        if (!existsSync(outDir)) {
            mkdirSync(outDir, { recursive: true });
        }
    }

    public async getExportEvents() {
        const yearMonthGenerator = createYearMonthGenerator(new Date("2006-10-01"), new Date());
        mkdirSync(this.EXPORT_EVENTS_CSV_DIR, { recursive: true });
        console.log(`Getting post exports`);

        for (let yearMonth of yearMonthGenerator) {
            const fileName = `${yearMonth.year}-${String(yearMonth.month).padStart(2, '0')}.csv`;
            const filePath = path.join(this.EXPORT_EVENTS_CSV_DIR, fileName);

            if (existsSync(filePath)) {
                console.log(`Already exists: ${filePath}`);
            } else {
                console.log(`Writing ${filePath}`);

                const file = createWriteStream(filePath);
                const responseFileStream = await this.ljApi.getRawPostsExportCsv({ year: yearMonth.year, month: yearMonth.month });
                responseFileStream.pipe(file);
                await new Promise(resolve => {
                    responseFileStream.on("end", resolve);
                });
            }

            const exportGenerator = createExportEventGenerator(createReadStream(filePath));
            for await (let item of exportGenerator) {
                this.writeExportEvent(item);
            }
        }
    }

    public writeExportEvent(event: LiveJournalExportEvent) {
        mkdirSync(this.EXPORT_EVENTS_DIR, { recursive: true });
        const filePath = path.join(this.EXPORT_EVENTS_DIR, `${event.itemid}.json`);
        if (existsSync(filePath)) {
            console.log(`Already exists: ${filePath}`);
        } else {
            console.log(`Writing ${filePath}: ${event.subject}`);
            writeFileSync(filePath, JSON.stringify(event, null, 4));
        }
    }

    public async getEvents(journal?: string): Promise<LiveJournalEvent[]> {
        if (existsSync(this.EVENT_FILE)) {
            console.log(`Reading events from ${this.EVENT_FILE} `);
            return JSON.parse(readFileSync(this.EVENT_FILE).toString()) as LiveJournalEvent[];
        } else {
            console.log("Importing friends");
            const events = (await this.ljApi.getEvents({
                selecttype: "lastn",
                usejournal: journal ?? this.ljApi.userName,
                lineendings: "unix",
                parseljtags: false,
            })).events;
            writeFileSync(this.EVENT_FILE, JSON.stringify(events, null, 4));
            return events;
        }
    }


    public userPicExists(userPicPathWithoutExtension: string): boolean {
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

    public async getUserPic(target: string, url: string, force: boolean = false): Promise<string> {
        if (this.userPicExists(target)) {
            console.log(`Skipping ${url}`);
            return target;
        }
        const response = await this.ljApi.downloadUserPic(url);
        //console.log(response);
        const targetFilePath = `${target}.${response.file_type}`;
        const targetFile = createWriteStream(targetFilePath);
        await pipeline(response.file, targetFile);
        return targetFilePath;
    }


    public async getFriends(): Promise<LiveJournalFriend[]> {
        if (existsSync(this.FRIENDS_FILE)) {
            console.log(`Reading friends from ${this.FRIENDS_FILE} `);
            return JSON.parse(readFileSync(this.FRIENDS_FILE).toString()) as LiveJournalFriend[];
        } else {
            console.log("Importing friends");
            const friends = (await this.ljApi.getFriends()).friends;
            writeFileSync(this.FRIENDS_FILE, JSON.stringify(friends, null, 4));
            return friends;
        }
    }

    public async getFriendOf(): Promise<LiveJournalFriend[]> {
        if (existsSync(this.FRIENDOF_FILE)) {
            console.log(`Reading friendof from ${this.FRIENDOF_FILE} `);
            return JSON.parse(readFileSync(this.FRIENDOF_FILE).toString()) as LiveJournalFriend[];
        } else {
            console.log("Importing friendof");
            const friendofs: LiveJournalFriend[] = (await this.ljApi.getFriends({ includefriendof: true })).friendofs;
            writeFileSync(this.FRIENDOF_FILE, JSON.stringify(friendofs, null, 4));
            return friendofs;
        }
    }

    public async getFriendGroups(): Promise<LiveJournalFriendGroup[]> {
        if (existsSync(this.FRIENDGROUPS_FILE)) {
            console.log(`Reading friend groups from ${this.FRIENDGROUPS_FILE} `);
            return JSON.parse(readFileSync(this.FRIENDGROUPS_FILE).toString()) as LiveJournalFriendGroup[];
        } else {
            console.log("Importing friend groups");
            const friendgroups: LiveJournalFriendGroup[] = (await this.ljApi.getFriends({ includegroups: true })).friendgroups;
            writeFileSync(this.FRIENDGROUPS_FILE, JSON.stringify(friendgroups, null, 4));
            return friendgroups;
        }
    }

    public async archiveFriendsPics() {
        const friends = await this.getFriends();
        mkdirSync(this.USERPICS_DIR, { recursive: true });

        for (let friend of friends) {
            console.log(friend.username);
            let userPics = await this.ljApi.getIcons(friend.username);
            for (let icon of userPics) {
                console.log(`  ${icon.url} (${icon.description})`);
                const iconPath = path.join(this.USERPICS_DIR, `${icon.user_id}_${icon.icon_id}`);
                console.log(`    => ${iconPath}`);
                const userPicResult = await this.getUserPic(iconPath, icon.url);
                console.log(`Downloaded Pic ${userPicResult}`);
            }
        }
    }

    public async getUserProfile(): Promise<LiveJournalUserProfile> {
        if (existsSync(this.USERPROFILE_FILE)) {
            console.log(`Reading user profile from ${this.USERPROFILE_FILE} `);
            return JSON.parse(readFileSync(this.USERPROFILE_FILE).toString()) as LiveJournalUserProfile;
        } else {
            console.log("Importing user profile");
            const userprofile: LiveJournalUserProfile = await this.ljApi.getUserProfile({
                getcaps: true,
                getmenus: true,
                getpickws: true,
                getpickwurls: true
            });
            writeFileSync(this.USERPROFILE_FILE, JSON.stringify(userprofile, null, 4));
            return userprofile;
        }
    }
}