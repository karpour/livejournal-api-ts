import liveJournalMarkdownTranslator from './liveJournalMarkdownTranslator';

export default function convertLjPostToMarkdown(rawText: string): string {
    // Fix lj-poll items and replace new-lines
    const text = rawText
        .replace(/<lj-poll-(\d+)>(.*)<\/lj-poll-\1>/g, '<lj-poll pollid="$1">$2</lj-poll>')
        //.replace(/\r?\n/g, '<br>\n');
    return liveJournalMarkdownTranslator.translate(text);
}