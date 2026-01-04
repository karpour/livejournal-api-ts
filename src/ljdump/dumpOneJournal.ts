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

async function main() {
    const header = (text: string) => console.log(`\n\x1b[32m${text}\x1b[0m`);

    const journal = process.argv[2];
    console.log(`Archiving ${journal}\n`);
    const outDir = `./output/friendjournals/${journal}/`;
    const dumper = new LJDumper(ljApi, outDir);

    header(`Archiving ${journal} photos`);
    const albumIds = await dumper.getAlbumIds();
    console.log(albumIds);

    return
    header(`Archiving ${journal} events`);
    const events = await dumper.getEvents(journal);

    header(`Archiving ${journal} comments`);
    const missingCommentEvents = events.filter(event => !existsSync(path.join(outDir, "export_comments", `${event.itemid}.json`)));
    shuffleArray(missingCommentEvents);

    let cnt = 0;
    let processed = 0;
    for (let event of missingCommentEvents) {
        cnt++;
        if (existsSync(path.join(outDir, "export_comments", `${event.itemid}.json`))) continue;
        console.log(`Comment ${cnt}/${missingCommentEvents.length}`);
        await dumper.getComments(event.itemid, journal);
        processed++;

        await sleepMs(1000 + Math.round(Math.random() * 1000));
        if (processed % 50 == 0) {
            console.log(`1 minute pause`);
            await sleepMs(60000);
        }
    }
}

main();
