import { convertLiveJournalDateString, LiveJournalDateString, LiveJournalExportEvent } from './types';
import { Parser } from "csv-parse";
import { createReadStream, ReadStream } from 'fs';
import convertLjPostToMarkdown from './markdown/convertLjPostToMarkdown';

type LiveJournalCsvPost = {
    itemid: string;
    eventtime: LiveJournalDateString;
    logtime: LiveJournalDateString;
    subject: string;
    event: string;
    security: string;
    allowmask: string;
    current_music: string;
    current_mood: string;
};

export function convertLiveJournalCsvPost(post: LiveJournalCsvPost): LiveJournalExportEvent {
    const ev: LiveJournalExportEvent = {
        allowmask: parseInt(post.allowmask),
        event: post.event,
        logtime: convertLiveJournalDateString(post.logtime),
        eventtime: convertLiveJournalDateString(post.eventtime),
        security: post.security as any,
        itemid: parseInt(post.itemid),
        subject: post.subject
    };
    if (post.current_mood) ev.current_mood = post.current_mood;
    if (post.current_music) ev.current_music = post.current_music;
    return ev;
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

parsePostExportsCsv(createReadStream('test.csv')).then(
    posts => {
        posts.forEach(post => {
            console.log(convertLjPostToMarkdown(post.event));
        });
    }
);