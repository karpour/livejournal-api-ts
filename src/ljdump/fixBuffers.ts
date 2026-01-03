import { promises as fs } from "fs";
import * as path from "path";

function bufferReviver(_key: string, value: any): any {
    if (
        value &&
        typeof value === "object" &&
        value.type === "Buffer" &&
        Array.isArray(value.data)
    ) {
        console.log("  Fixed buffer")
        return Buffer.from(value.data).toString("utf8");
    }
    return value;
}


async function processDirectory(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
            await processJsonFile(fullPath);
        }
    }
}


async function processJsonFile(filePath: string): Promise<void> {
    try {
        const raw = await fs.readFile(filePath, "utf8");
        const parsed = JSON.parse(raw, bufferReviver);
        const output = JSON.stringify(parsed, null, 2);

        await fs.writeFile(filePath, output, "utf8");

        console.log(`✔ Processed ${filePath}`);
    } catch (err) {
        console.error(`✖ Failed to process ${filePath}`, err);
    }
}

/**
 * Entry point
 */
async function main() {
    const targetDir = process.argv[2];

    if (!targetDir) {
        console.error("Usage: ts-node convert-buffers.ts <directory>");
        process.exit(1);
    }

    await processDirectory(path.resolve(targetDir));
}

main().catch(console.error);