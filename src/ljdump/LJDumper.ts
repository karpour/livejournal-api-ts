import { createReadStream, createWriteStream, existsSync, fstat, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import LiveJournalApi, { LiveJournalGetCommentsResponseExtended, LiveJournalUserPicFileFormats, throttled } from "..";
import {
    LiveJournalComment,
    LiveJournalEvent,
    LiveJournalExportEvent,
    LiveJournalFriend,
    LiveJournalFriendGroup,
    LiveJournalIconInfo,
    LiveJournalPrivateMessageExtended,
    LiveJournalPrivateMessageType,
    LiveJournalUserProfile
} from "../types";
import { createYearMonthGenerator } from "../createYearMonthGenerator";
import { createExportEventGenerator } from "../parsePostExportsCsv";

import { pipeline } from "stream/promises";

function sleepMs(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default class LJDumper {
    private readonly FRIENDS_FILE: string;
    private readonly FRIENDOF_FILE: string;
    private readonly FRIENDGROUPS_FILE: string;
    private readonly USERPROFILE_FILE: string;
    private readonly EVENT_FILE: string;
    private readonly COMMENT_FILE: string;
    private readonly EXPORT_COMMENTS_DIR: string;
    private readonly EVENTS_DIR: string;
    private readonly EXPORT_EVENTS_DIR: string;
    private readonly EXPORT_EVENTS_CSV_DIR: string;
    private readonly USERPICS_DIR: string;


    public constructor(protected ljApi: LiveJournalApi, outDir: string) {
        this.FRIENDS_FILE = path.join(outDir, 'friends.json');
        this.FRIENDOF_FILE = path.join(outDir, 'friendof.json');
        this.FRIENDGROUPS_FILE = path.join(outDir, 'friendgroups.json');
        this.USERPROFILE_FILE = path.join(outDir, 'userprofile.json');
        this.EVENT_FILE = path.join(outDir, 'events.json');
        this.COMMENT_FILE = path.join(outDir, 'events.json');
        this.EXPORT_COMMENTS_DIR = path.join(outDir, 'export_comments');
        this.EVENTS_DIR = path.join(outDir, 'events');
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
        const events: LiveJournalExportEvent[] = [];

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
                events.push(item);
            }
        }
        return events;
    }

    public async readExportEvents(): Promise<LiveJournalExportEvent[]> {
        const dir = readdirSync(this.EXPORT_EVENTS_DIR);
        const events = dir.map(e => JSON.parse(readFileSync(path.join(this.EXPORT_EVENTS_DIR, e)).toString()) as LiveJournalExportEvent);
        //console.log(events);
        return events;
    }


    public async readExportComments(): Promise<LiveJournalComment[]> {
        const dir = readdirSync(this.EXPORT_COMMENTS_DIR);
        const comments = dir.map(e => JSON.parse(readFileSync(path.join(this.EXPORT_COMMENTS_DIR, e)).toString()) as LiveJournalComment[]).flat();
        return comments;
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
        mkdirSync(this.EVENTS_DIR, { recursive: true });

        const e: LiveJournalEvent[] = [];
        if (journal) console.log(`Importing events for ${journal}`);
        let skip = 0;
        const howmany = 32;

        while (true) {
            const events = (await this.ljApi.getEvents({
                selecttype: "lastn",
                usejournal: journal ?? this.ljApi.userName,
                lineendings: "unix",
                parseljtags: false,
                howmany,
                skip
            })).events;
            if (events.length == 0) break;
            skip += howmany;
            for (let event of events) {
                e.push(event);
                console.log(`Writing event ${event.itemid}`);
                writeFileSync(path.join(this.EVENTS_DIR, `${event.itemid}.json`), JSON.stringify(event, null, 4));
            }
        }
        return e;

    }

    public async getComments(itemid: number): Promise<LiveJournalComment[]> {
        mkdirSync(this.EXPORT_COMMENTS_DIR, { recursive: true });

        const fileName = path.join(this.EXPORT_COMMENTS_DIR, `${itemid}.json`);

        if (existsSync(fileName)) {
            console.log(`Reading events from ${fileName}`);
            return JSON.parse(readFileSync(fileName).toString()) as LiveJournalComment[];
        } else {
            const comments: any = [];

            for (let page = 0; ; page++) {
                let response: LiveJournalGetCommentsResponseExtended;

                response = (await this.ljApi.getComments({
                    itemid: itemid,
                    journal: this.ljApi.userName,
                    page_size: 100,
                    page,
                    format: "list"
                }));

                comments.push(...response.comments);
                if (response.comments.length < 100) break;
            }

            console.log("Writing comments");
            writeFileSync(fileName, JSON.stringify(comments, null, 4));
            return comments;
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
        await sleepMs(500);
        const response = await this.ljApi.downloadUserPic(url);
        //console.log(response);
        const targetFilePath = `${target}.${response.file_type}`;
        const targetFile = createWriteStream(targetFilePath);
        await pipeline(response.file, targetFile);
        return targetFilePath;
    }

    public async getInbox(type: LiveJournalPrivateMessageType): Promise<LiveJournalPrivateMessageExtended[]> {
        const inboxFilename = `inbox_${type}.json`;

        if (existsSync(inboxFilename)) {
            console.log(`Reading inbox from ${inboxFilename}`);
            return JSON.parse(readFileSync(this.FRIENDS_FILE).toString()) as LiveJournalPrivateMessageExtended[];
        } else {
            console.log(`Importing inbox ${type}`);
            const messages: LiveJournalPrivateMessageExtended[] = [];
            for (let page = 0; ; page++) {
                const response = (await this.ljApi.getInbox({
                    itemshow: 100,
                    skip: page * 100,
                    gettype: [type],
                    extended: true
                }));
                console.log(`Fetched items ${page * 100}-${page * 100 + response.items.length}`);

                messages.push(...response.items);
                if (response.items.length < 100) break;
            }
            return messages;
        }
    }


    public async getFriends(): Promise<LiveJournalFriend[]> {
        if (existsSync(this.FRIENDS_FILE)) {
            console.log(`Reading friends from ${this.FRIENDS_FILE} `);
            return JSON.parse(readFileSync(this.FRIENDS_FILE).toString()) as LiveJournalFriend[];
        } else {
            console.log("Importing friends");
            const friends = (await this.ljApi.getFriends()).friends;
            for (let friend of friends) {
                console.log(`Getting user icons for ${friend.username}`);
                let userPics = await this.ljApi.getIcons(friend.username);
                friend.user_pics = userPics;
            }

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
            for (let friend of friendofs) {
                console.log(`Getting user icons for ${friend.username}`);
                let userPics = await this.ljApi.getIcons(friend.username);
                friend.user_pics = userPics;
            }
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
        const friendOf = await this.getFriendOf();
        mkdirSync(this.USERPICS_DIR, { recursive: true });

        for (let friend of friends) {
            console.log(friend.username);
            let userPics = friend.user_pics ?? (await this.ljApi.getIcons(friend.username));
            for (let icon of userPics) {
                console.log(`  ${icon.url} (${icon.description})`);
                const iconPath = path.join(this.USERPICS_DIR, `${icon.user_id}_${icon.icon_id}`);
                //console.log(`    => ${iconPath}`);
                const userPicResult = await this.getUserPic(iconPath, icon.url);
                //console.log(`Downloaded Pic ${userPicResult}`);
            }
        }

        for (let friend of friendOf) {
            console.log(friend.username);
            let userPics = friend.user_pics ?? (await this.ljApi.getIcons(friend.username));
            for (let icon of userPics) {
                console.log(`  ${icon.url} (${icon.description})`);
                const iconPath = path.join(this.USERPICS_DIR, `${icon.user_id}_${icon.icon_id}`);
                //console.log(`    => ${iconPath}`);
                const userPicResult = await this.getUserPic(iconPath, icon.url);
                //console.log(`Downloaded Pic ${userPicResult}`);
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