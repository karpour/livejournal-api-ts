import { readFileSync } from "fs";
import LiveJournalApi from "./LiveJournalApi";


const credentials = JSON.parse(readFileSync("credentials.json").toString());
const username = credentials.username;
const password = credentials.password;

const ljApi = new LiveJournalApi({
    authMethod: "cookie",
    username: username,
    password: password,
    cookieFile: 'cookie.json',
    throttle: true,
    verbose: true,
    maxRequestsPerSecond: 1
});

async function main() {
    let userPics = await ljApi.getIcons(process.argv[2]);
    console.log(userPics);
}

main();