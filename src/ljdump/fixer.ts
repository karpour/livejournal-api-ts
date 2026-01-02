import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

async function main() {
    const dir = "./output/henriekeg/export_comments_2";
    const dirOut = "./output/henriekeg/export_comments";
    const evFiles = readdirSync(dir);
    for (let file of evFiles) {
        const p = path.join(dir, file);
        //const c = JSON.parse(readFileSync(p).toString());
        const itemid = parseInt(file) >> 8;
        console.log(itemid);
        const p_out = path.join(dirOut, `${itemid}.json`);
        writeFileSync(p_out, readFileSync(p));
    }
}

main();