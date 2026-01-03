import { readFileSync } from "fs";
import LiveJournalApi from "..";
import LJDumper from "./LJDumper";
import { parse } from "path";

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
    const header = (text: string) => console.log(`\n\x1b[32m${text}\x1b[0m`);
    const ljDumper: LJDumper = new LJDumper(ljApi, OUT_DIR);

    header("Getting comments");
    const comments = await ljDumper.getAllComments([]);

    console.log(Object.keys(comments));

    for (const [itemid, c] of Object.entries(comments)) {
        ljDumper.writeComment(parseInt(itemid), c);
    }
}
main();