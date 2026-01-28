import { existsSync, readFileSync } from "fs";
import LiveJournalApi from "..";
import LJDumper from "./LJDumper";
import { LiveJournalApiError } from "../LiveJournalApiError";

const credentials = JSON.parse(readFileSync(process.argv[2] ?? "credentials.json").toString());
const username = credentials.username;
const password = credentials.password;
const skipFriends = credentials.skipFriends ?? [];

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

    console.log(`Skipping friends: ${skipFriends}`);

    let skipImages: string[] = [];
    if (existsSync("412images.txt")) {
        const images412 = readFileSync("412images.txt").toString("utf-8").split("\n");
        skipImages.push(...images412);
        console.log(`Loaded ${images412.length} code 412 images`);
    }
    if (existsSync("403images.txt")) {
        const images403 = readFileSync("403images.txt").toString("utf-8").split("\n");
        skipImages.push(...images403);
        console.log(`Loaded ${images403.length} code 403 images`);
    }
    if (existsSync("404images.txt")) {
        const images404 = readFileSync("404images.txt").toString("utf-8").split("\n");
        skipImages.push(...images404);
        console.log(`Loaded ${images404.length} code 404 images`);
    }

    header(`Archiving friend journals`);
    let cnt = 0;
    for (let friend of friends.reverse()) {
        const friendName = friend.username;
        cnt++;
        if(cnt<176) continue;
        const dumper = new LJDumper(ljApi, `./output/friendjournals/${friendName}/`,skipImages);
        //if (dumper.eventsDone()) {
        //    console.log(`Skipping ${friend.username}`);
        //    continue;
        //}
        header(`Archiving ${friendName} (${cnt}/${friends.length})`);
        if (friend.type == "community") {
            console.log("Skipping community");
            continue;
        }
        if (skipFriends.includes(friendName)) continue;
        try {
            const events = await dumper.getEvents(friendName, true);
            await dumper.getEventImages(events);

            header("Getting polls");
            const RegExp_Poll = /<lj-poll-(\d+)>/g;
            // Extract all pollids from all posts
            const pollIdsSet = new Set<number>();
            for (let event of events) {
                //console.log(event.itemid);
                try {
                    const results = [...event.event.matchAll(RegExp_Poll)];
                    for (let result of results) {
                        pollIdsSet.add(parseInt(result[1]));
                    }
                } catch (err) {
                    console.error(err);
                    console.error(event);
                }
            }
            const pollIds = [...pollIdsSet];
            console.log(pollIds);
            await dumper.getPolls(pollIds);
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
