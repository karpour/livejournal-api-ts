import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import path from "path";
import LiveJournalApi from "..";
import { LiveJournalFriend, LiveJournalIconInfo } from "../types";
import LJDumper, { sleepMs } from "./LJDumper";

//const credentials = JSON.parse(readFileSync("credentials.json").toString());
const credentials = JSON.parse(readFileSync("credentials.json").toString());
const username = credentials.username;
const password = credentials.password;

const OUT_DIR = `./output/friendjournals/${username}/`;


const ljApi = new LiveJournalApi({
    authMethod: "clear",
    username: username,
    password: password,
    cookieFile: `~/.livejournal.cookie.${username}.json`,
    throttle: true,
    //verbose: true,
    maxRequestsPerSecond: 1
});

function shuffleArray(array: any[]) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export async function dumpOneJournal(journal: string) {
    const header = (text: string) => console.log(`\n\x1b[32m${text}\x1b[0m`);

    console.log(`Archiving ${journal}\n`);
    const outDir = `./output/friendjournals/${journal}/`;
    const ljDumper = new LJDumper(ljApi, outDir);

    //header(`Archiving ${journal} photos`);
    //const albumIds = await ljDumper.getAlbumIds();
    //console.log(albumIds);

    header(`Archiving ${journal} events`);
    const events = await ljDumper.getEvents(journal);

    header(`Archiving ${journal} comments`);
    const missingCommentEvents = events.filter(event => !existsSync(path.join(outDir, "export_comments", `${event.itemid}.json`)));
    shuffleArray(missingCommentEvents);


    const reqsPerHour = 500;
    const start = new Date();
    let processed = 0;
    await keypress();
    for (let event of missingCommentEvents) {
        processed++;
        console.log(`Comment ${processed}/${missingCommentEvents.length}`);
        try {
            await ljDumper.getComments(event.itemid, journal);
        } catch (err: any) {
            // Push event back on list
            missingCommentEvents.push(event);
            console.error("Stopped on error");
            console.error(err.message);
            await keypress();
        }

        //await sleepMs(3600000 / reqsPerHour);
        if (processed % 500 == 0) await keypress();
    }
    const end = new Date();
    const minutes = minutesDiff(start, end);
    const hours = minutes / 60;
    console.log(`Did ${processed} requests in ${Math.round(minutes)} minutes (${processed / hours} req/hr)`);

    header("Getting images");
    await ljDumper.getEventImages(events);
}

function minutesDiff(date1: Date, date2: Date) {
    return Math.abs(date1.getTime() - date2.getTime()) / 60000;
}

function keypress() {
    process.stdout.write('\u0007');
    console.log("Press any key to continue");
    process.stdin.setRawMode(true);
    return new Promise<void>(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        resolve();
    }));
}

dumpOneJournal(process.argv[2]);
