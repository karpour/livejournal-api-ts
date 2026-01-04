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

    let processed = 0;
    for (let event of missingCommentEvents) {
        processed++;
        console.log(`Comment ${processed}/${missingCommentEvents.length}`);
        await ljDumper.getComments(event.itemid, journal);

        await sleepMs(2000 + Math.round(Math.random() * 1000));
        if (processed % 50 == 0) {
            console.log(`1 minute pause`);
            await sleepMs(60000);
        }
    }

    header("Getting images");
    await ljDumper.getImages(events);
}

dumpOneJournal(process.argv[2]);
