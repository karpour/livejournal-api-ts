import { createReadStream, createWriteStream, existsSync, fstat, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import LiveJournalApi, { LiveJournalGetCommentsResponseExtended, LiveJournalUserPicFileFormats, replaceBuffers, throttled } from "..";
import {
    LiveJournalComment,
    LiveJournalEvent,
    LiveJournalExportEvent,
    LiveJournalFriend,
    LiveJournalFriendGroup,
    LiveJournalIconInfo,
    LiveJournalPoll,
    LiveJournalPrivateMessageExtended,
    LiveJournalPrivateMessageType,
    LiveJournalUserProfile
} from "../types";
import { createYearMonthGenerator } from "../createYearMonthGenerator";
import { createExportEventGenerator } from "../parsePostExportsCsv";

import { pipeline } from "stream/promises";

export function sleepMs(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default class LJDumper {
    private readonly FRIENDS_FILE: string;
    private readonly FRIENDOF_FILE: string;
    private readonly FRIENDGROUPS_FILE: string;
    private readonly USERPROFILE_FILE: string;
    private readonly POLLS_FILE: string;
    private readonly COMMENT_FILE: string;
    private readonly EXPORT_COMMENTS_DIR: string;
    private readonly EVENTS_DIR: string;
    private readonly EXPORT_EVENTS_DIR: string;
    private readonly EXPORT_EVENTS_CSV_DIR: string;
    private readonly USERPICS_DIR: string;
    private readonly FOAF_DIR: string;
    private readonly PROFILE_DIR: string;


    public constructor(protected ljApi: LiveJournalApi, protected outDir: string) {
        this.FRIENDS_FILE = path.join(outDir, 'friends.json');
        this.FRIENDOF_FILE = path.join(outDir, 'friendof.json');
        this.FRIENDGROUPS_FILE = path.join(outDir, 'friendgroups.json');
        this.USERPROFILE_FILE = path.join(outDir, 'userprofile.json');
        this.POLLS_FILE = path.join(outDir, 'polls.json');
        this.COMMENT_FILE = path.join(outDir, 'events.json');
        this.EXPORT_COMMENTS_DIR = path.join(outDir, 'export_comments');
        this.EVENTS_DIR = path.join(outDir, 'events');
        this.EXPORT_EVENTS_DIR = path.join(outDir, 'export_events');
        this.EXPORT_EVENTS_CSV_DIR = path.join(outDir, 'export_events_csv');
        this.USERPICS_DIR = path.join(outDir, 'user_pics');
        this.PROFILE_DIR = path.join(outDir, 'profiles');
        this.FOAF_DIR = path.join(outDir, 'foaf');

        if (!existsSync(outDir)) {
            mkdirSync(outDir, { recursive: true });
        }
    }

    public async getExportEvents(): Promise<LiveJournalExportEvent[]> {
        const yearMonthGenerator = createYearMonthGenerator(new Date("2006-10-01"), new Date());
        mkdirSync(this.EXPORT_EVENTS_CSV_DIR, { recursive: true });
        if (existsSync(path.join(this.EXPORT_EVENTS_CSV_DIR, ".done"))) return this.readExportEvents();

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

        writeFileSync(path.join(this.EXPORT_EVENTS_CSV_DIR, ".done"), "");

        return events;
    }

    public async readExportEvents(): Promise<LiveJournalExportEvent[]> {
        const dir = readdirSync(this.EXPORT_EVENTS_DIR);
        console.log(`Reading Export Events from ${this.EXPORT_EVENTS_DIR}`);
        const events = dir
            .filter(f => f.endsWith(".json"))
            .map(e => JSON.parse(readFileSync(path.join(this.EXPORT_EVENTS_DIR, e)).toString()) as LiveJournalExportEvent);
        //console.log(events);
        return events;
    }

    public async readEvents(): Promise<LiveJournalEvent[]> {
        const dir = readdirSync(this.EVENTS_DIR);
        console.log(`Reading Events from ${this.EVENTS_DIR}`);
        const events = dir
            .filter(f => f.endsWith(".json"))
            .map(e => {
                return JSON.parse(readFileSync(path.join(this.EVENTS_DIR, e)).toString()) as LiveJournalEvent;
            });
        //console.log(events);
        return events;
    }


    public async readExportComments(): Promise<Record<number, LiveJournalComment[]>> {
        const dir = readdirSync(this.EXPORT_COMMENTS_DIR);
        console.log(`Reading Export Comments from ${this.EXPORT_COMMENTS_DIR}`);
        const comments: Record<number, LiveJournalComment[]> = {};
        const commentFiles = dir.filter(f => f.endsWith(".json"));
        for (let commentFile of commentFiles) {
            comments[parseInt(commentFile)] = JSON.parse(readFileSync(path.join(this.EXPORT_COMMENTS_DIR, commentFile)).toString()) as LiveJournalComment[];
        }
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
        if (existsSync(path.join(this.EVENTS_DIR, ".done"))) return this.readEvents();
        let lowestItem = 1000000;
        let skipInitialStep = false;
        if (existsSync(path.join(this.EVENTS_DIR, ".low"))) {
            lowestItem = parseInt(readFileSync(path.join(this.EVENTS_DIR, ".low")).toString());
            console.log(`Continuing from itemid ${lowestItem}`);
            skipInitialStep = true;
        }

        const e: LiveJournalEvent[] = [];
        if (journal) console.log(`Importing events for ${journal}`);
        let skip = 0;
        const howmany = 32;

        let prevLowestItem;

        if (!skipInitialStep) {
            while (true) {

                const events = (await this.ljApi.getEvents({
                    selecttype: "lastn",
                    usejournal: journal ?? this.ljApi.userName,
                    lineendings: "unix",
                    parseljtags: false,
                    howmany,
                    skip
                })).events;



                console.log(`Getting events ${skip}-${skip + events.length}`);
                if (events.length == 0) {
                    break;
                }
                skip += howmany;
                prevLowestItem = lowestItem;

                for (let event of events) {
                    lowestItem = Math.min(lowestItem, event.itemid);
                    e.push(event);
                    console.log(`Writing event ${event.itemid}`);
                    const eventFileName = path.join(this.EVENTS_DIR, `${event.itemid}.json`);
                    if (!existsSync(eventFileName)) {
                        writeFileSync(eventFileName, JSON.stringify(event, null, 4));
                    }
                }
                if (lowestItem == prevLowestItem) {
                    console.log(`Previous lowest item = current lowest item, fetching stalled: ${lowestItem}`);
                    break;
                }
            }
        }

        const step = 32;
        for (let i = lowestItem; i > 0; i -= step) {
            let range: number[] = [];
            const min = Math.max(0, i - step);
            for (let j = i; j > min; j--) {
                range.push(j);
            }
            const rangeString = range.join(",");
            console.log(`Fetching itemids ${i}-${min}`);
            const events = (await this.ljApi.getEvents({
                selecttype: "multiple",
                usejournal: journal ?? this.ljApi.userName,
                lineendings: "unix",
                parseljtags: false,
                itemids: rangeString
            })).events;

            writeFileSync(path.join(this.EVENTS_DIR, ".low"), `${min}`);

            for (let event of events) {
                lowestItem = Math.min(lowestItem, event.itemid);
                e.push(event);
                //console.log(`Writing event ${event.itemid}`);
                const eventFileName = path.join(this.EVENTS_DIR, `${event.itemid}.json`);
                //if (!existsSync(eventFileName)) {
                    writeFileSync(eventFileName, JSON.stringify(event, null, 4));
                //}
            }
        }

        writeFileSync(path.join(this.EVENTS_DIR, ".done"), "");
        if (existsSync(path.join(this.EVENTS_DIR, ".low"))) unlinkSync(path.join(this.EVENTS_DIR, ".low"));
        return e;

    }

    public async getAllComments(events: { itemid: number; }[]): Promise<Record<number, LiveJournalComment[]>> {
        mkdirSync(this.EXPORT_COMMENTS_DIR, { recursive: true });
        if (existsSync(path.join(this.EXPORT_COMMENTS_DIR, ".done"))) return this.readExportComments();
        const numEvents = events.length;
        let cnt = 0;
        const comments: Record<number, LiveJournalComment[]> = {};
        for (const event of events) {
            try {
                console.log(`Getting comments for ${event.itemid} (${++cnt}/${numEvents})`);
                const c = await this.getComments(event.itemid);
                comments[event.itemid] = c;
            } catch (e) {
                console.log(e);
                console.error("Failed");
            }
        }
        writeFileSync(path.join(this.EXPORT_COMMENTS_DIR, ".done"), "");
        return comments;
    }

    public async getComments(itemid: number, journal?: string): Promise<LiveJournalComment[]> {
        mkdirSync(this.EXPORT_COMMENTS_DIR, { recursive: true });

        const fileName = path.join(this.EXPORT_COMMENTS_DIR, `${itemid}.json`);

        if (existsSync(fileName)) {
            console.log(`Reading comments from ${fileName}`);
            return JSON.parse(readFileSync(fileName).toString()) as LiveJournalComment[];
        } else {
            const comments: any = [];

            for (let page = 0; ; page++) {
                let response: LiveJournalGetCommentsResponseExtended;

                response = (await this.ljApi.getComments({
                    itemid: itemid,
                    journal: journal ?? this.ljApi.userName,
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

    public async writeComment(itemid: number, comments: LiveJournalComment[]) {
        mkdirSync(this.EXPORT_COMMENTS_DIR, { recursive: true });
        console.log(`Writing comment file ${itemid}`)
        const fileName = path.join(this.EXPORT_COMMENTS_DIR, `${itemid}.json`);
        writeFileSync(fileName, JSON.stringify(replaceBuffers(comments), null, 4));
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

    public async getInbox(): Promise<LiveJournalPrivateMessageExtended[]> {
        const inboxFilename = path.join(this.outDir, `inbox.json`);

        if (existsSync(inboxFilename)) {
            console.log(`Reading inbox from ${inboxFilename}`);
            return JSON.parse(readFileSync(this.FRIENDS_FILE).toString()) as LiveJournalPrivateMessageExtended[];
        } else {
            console.log(`Importing inbox`);
            const messages: LiveJournalPrivateMessageExtended[] = [];
            const response = (await this.ljApi.getInbox({
                itemshow: 99,
                extended: true
            }));
            console.log(`Fetched items 0-99`);

            messages.push(...response.items);

            // Skip has a max value of 99
            const response2 = (await this.ljApi.getInbox({
                itemshow: 100,
                skip: 99,
                extended: true
            }));
            console.log(`Fetched items 100-199`);

            messages.push(...response2.items);

            writeFileSync(inboxFilename, JSON.stringify(messages, null, 4));

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
        if (existsSync(path.join(this.USERPICS_DIR, ".done"))) {
            console.log("Already done archiveFriendsPics, skipping");
            return;
        }


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
        writeFileSync(path.join(this.USERPICS_DIR, ".done"), "");

    }

    public async archivePicsByUsername(usernames: string[]) {
        mkdirSync(this.USERPICS_DIR, { recursive: true });
        if (existsSync(path.join(this.USERPICS_DIR, ".done"))) {
            console.log("Already done archivePicsByUsername, skipping");
            return;
        }
        for (let username of usernames) {
            console.log(username);
            let userPics = (await this.ljApi.getIcons(username));
            for (let icon of userPics) {
                console.log(`  ${icon.url} (${icon.description})`);
                const iconPath = path.join(this.USERPICS_DIR, `${icon.user_id}_${icon.icon_id}`);
                //console.log(`    => ${iconPath}`);
                while (true) {
                    try {
                        const userPicResult = await this.getUserPic(iconPath, icon.url);
                    } catch {
                        console.log("Retrying after 5s");
                        await sleepMs(5000);
                        continue;
                    }
                    break;
                }

                //console.log(`Downloaded Pic ${userPicResult}`);
            }
        }
        writeFileSync(path.join(this.USERPICS_DIR, ".done2"), "");

    }

    public async getFoaf(usernames: string[]) {
        mkdirSync(this.FOAF_DIR, { recursive: true });
        if (existsSync(path.join(this.FOAF_DIR, ".done"))) {
            console.log("Already done getFoaf, skipping");
            return;
        }

        for (const username of usernames) {
            const url = `https://${username}.livejournal.com/data/foaf`;
            const outputPath = path.join(this.FOAF_DIR, `${username}.xml`);
            if (existsSync(outputPath)) {
                console.log(`Skipping ${username}: exists`);
                continue;
            }

            try {
                await sleepMs(500);
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0',
                    },
                });

                if (!res.ok) {
                    console.warn(`Skipping ${username}: HTTP ${res.status}`);
                    continue;
                }


                const xml = await res.text();
                writeFileSync(outputPath, xml, 'utf8');

                console.log(`Saved FOAF: ${outputPath}`);
            } catch (err: any) {
                console.error(`Error fetching ${username}:`, err.message);
            }
        }
        writeFileSync(path.join(this.FOAF_DIR, ".done"), "");

    }

    public async getProfiles(usernames: string[]) {
        mkdirSync(this.PROFILE_DIR, { recursive: true });
        if (existsSync(path.join(this.PROFILE_DIR, ".done"))) {
            console.log("Already done getProfiles, skipping");
            return;
        }

        for (const username of usernames) {
            const url = `https://${username}.livejournal.com/profile`;
            const outputPath = path.join(this.PROFILE_DIR, `${username}.html`);
            if (existsSync(outputPath)) {
                console.log(`Skipping ${username}: exists`);
                continue;
            }

            try {
                await sleepMs(500);
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0',
                    },
                });

                if (!res.ok) {
                    console.warn(`Skipping ${username}: HTTP ${res.status}`);
                    continue;
                }


                const html = await res.text();
                writeFileSync(outputPath, html, 'utf8');

                console.log(`Saved Profile: ${outputPath}`);
            } catch (err: any) {
                console.error(`Error fetching ${username}:`, err.message);
            }
        }
        writeFileSync(path.join(this.FOAF_DIR, ".done"), "");
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

    public async getPolls(pollids: number[]) {
        if (existsSync(this.POLLS_FILE)) {
        } else {
            const polls: LiveJournalPoll[] = [];
            for (let pollid of pollids) {
                console.log(`  Poll ${pollid}`);

                //polls.push(await this.ljApi.getPoll({ pollid, mode: "all" }));
                polls.push(replaceBuffers(await this.ljApi.getPoll({ pollid, mode: "all" })));
            }
            writeFileSync(this.POLLS_FILE, JSON.stringify(polls, null, 4));
        }
    }
}