import { readFileSync } from "fs";
import LiveJournalApi from "..";
import LJDumper from "./LJDumper";
import { LiveJournalApiError } from "../LiveJournalApiError";

const credentials = JSON.parse(readFileSync(process.argv[2] ?? "credentials.json").toString());
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
    const friends = await ljDumper.getFriends();

    header(`Archiving friend journals`);
    let cnt = 0;
    for (let friend of friends) {
        const friendName = friend.username;
        cnt++;
        const dumper = new LJDumper(ljApi, `./output/friendjournals/${friendName}/`);
        if (dumper.eventsDone()) {
            console.log(`Skipping ${friend.username}`);
            continue;
        }
        header(`Archiving ${friendName} (${cnt}/${friends.length})`);
        try {
            const events = await dumper.getEvents(friendName, true);
           // await dumper.getMissingEvents(events, 100000000, friendName);
        } catch (err: any) {
            if (err instanceof LiveJournalApiError && err.code == 307) {
                console.log(err.message);
                continue;
            }
            throw err;
        }
    }
}

main();
