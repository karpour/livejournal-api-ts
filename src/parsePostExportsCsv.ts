import { convertLiveJournalExportEvent, LiveJournalExportEvent } from './types';
import { Parser } from "csv-parse";
import { createReadStream } from 'fs';
import convertLjPostToMarkdown from './markdown/convertLjPostToMarkdown';


export async function* createExportEventGenerator(fileStream: NodeJS.ReadableStream): AsyncGenerator<LiveJournalExportEvent> {
    const csvStream = fileStream.pipe(new Parser({
        bom: true,
        columns: true,
    }));
    for await (let post of csvStream) {
        yield convertLiveJournalExportEvent(post);
    }
}

export async function parsePostExportsCsv(fileStream: NodeJS.ReadableStream): Promise<LiveJournalExportEvent[]> {
    const csvStream = fileStream.pipe(new Parser({
        bom: true,
        columns: true,
    }));

    const items: LiveJournalExportEvent[] = [];

    for await (let post of csvStream) {
        //console.log(convertLiveJournalCsvPost(post));
        items.push(post);
    }
    return items;
}

/*parsePostExportsCsv(createReadStream('test.csv')).then(
    posts => {
        posts.forEach(post => {
            console.log(convertLjPostToMarkdown(post.event));
        });
    }
);*/