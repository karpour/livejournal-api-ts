import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { LiveJournalComment, LiveJournalEvent } from "../types";
import path from "path";
import convertLjPostToMarkdown from "../markdown/convertLjPostToMarkdown";
import YAML from 'yaml';

export class LJArchive {
    public readonly path: string;
    private readonly FRIENDS_FILE: string;
    private readonly FRIENDOF_FILE: string;
    private readonly FRIENDGROUPS_FILE: string;
    private readonly USERPROFILE_FILE: string;
    private readonly POLLS_FILE: string;
    private readonly EXPORT_COMMENTS_DIR: string;
    private readonly EVENTS_DIR: string;
    private readonly EXPORT_EVENTS_DIR: string;
    private readonly EXPORT_EVENTS_CSV_DIR: string;
    private readonly USERPICS_DIR: string;
    private readonly IMAGES_DIR: string;
    private readonly FOAF_DIR: string;
    private readonly PROFILE_DIR: string;

    public constructor(dir: string) {
        if (!existsSync(dir)) console.error(`Path does not exist: ${dir}`);
        this.path = dir;
        if (!statSync(dir).isDirectory()) console.error(`Not a directory: ${dir}`);
        this.FRIENDS_FILE = path.join(dir, 'friends.json');
        this.FRIENDOF_FILE = path.join(dir, 'friendof.json');
        this.FRIENDGROUPS_FILE = path.join(dir, 'friendgroups.json');
        this.USERPROFILE_FILE = path.join(dir, 'userprofile.json');
        this.POLLS_FILE = path.join(dir, 'polls.json');
        this.EXPORT_COMMENTS_DIR = path.join(dir, 'export_comments');
        this.EVENTS_DIR = path.join(dir, 'events');
        this.EXPORT_EVENTS_DIR = path.join(dir, 'export_events');
        this.EXPORT_EVENTS_CSV_DIR = path.join(dir, 'export_events_csv');
        this.USERPICS_DIR = path.join(dir, 'user_pics');
        this.IMAGES_DIR = path.join(dir, 'images');
        this.PROFILE_DIR = path.join(dir, 'profiles');
        this.FOAF_DIR = path.join(dir, 'foaf');
    }

    public *getEvents(): Generator<LiveJournalEvent> {
        if (existsSync(this.EVENTS_DIR)) {
            const eventFiles = readdirSync(this.EVENTS_DIR)
                .filter(f => /\d+\.json/.test(f))
                .map(f => path.join(this.EVENTS_DIR, f));
            for (const eventFile of eventFiles) {
                yield JSON.parse(readFileSync(eventFile).toString("utf-8")) as LiveJournalEvent;
            }
        }
    }

    public getComments(event: LiveJournalEvent): LiveJournalComment[] {
        const commentFilePath = path.join(this.EXPORT_COMMENTS_DIR, `${event.itemid}.json`);
        if (!existsSync(commentFilePath)) return [];
        return JSON.parse(readFileSync(commentFilePath).toString("utf-8")) as LiveJournalComment[];
    }

    public getImage(imageUrl: string): string {
        if (isUserIcon(imageUrl)) {
            return `user_pics/`;
        }
        return imageUrl;
    }

    public writeObsidianMdAllEvents(dir: string) {
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        for (const event of this.getEvents()) {
            this.writeObsidianMd(dir, event);
        }
    }

    public writeObsidianMd(dir: string, event: LiveJournalEvent) {

        const frontMatter = LJArchive.makeEventFrontMatter(event);
        const eventMd = convertLjPostToMarkdown(event.event);
        const comments = threadComments(this.getComments(event));
        const commentsMd = this.makeCommentsMd(comments);

        let mdText = `---\n` + frontMatter + `---\n` + eventMd;

        if (commentsMd !== "") mdText += `\n\n---\n\n${commentsMd}`;
        const outFilePath = path.join(dir, `${event.itemid}.md`);
        console.log(`Writing ${outFilePath}`);
        writeFileSync(outFilePath, mdText);
    }

    public static makeEventFrontMatter(event: LiveJournalEvent): string {
        return YAML.stringify({
            title: event.subject,
            url: event.url,
            mood: event.props.current_mood,
            ditemid: event.ditemid,
            itemid: event.itemid,
            date: dateToString(LJArchive.parseEventDate(event.event_timestamp))
        });
    }

    public makeCommentsMd(comments: LiveJournalThreadedComment[], prefix: string = "> ") {
        let output: string = "";
        for (let comment of comments) {
            let text: string;

            if (!comment.text) {
                text = "(Deleted Comment)";
            } else {
                text = `**${comment.postername}**\n` + convertLjPostToMarkdown(comment.text);
            }
            output += '\n' + text.replace(/^/gm, prefix);
            output += this.makeCommentsMd(comment.children, `> ` + prefix);
            if (comment.parentdtalkid === 0) output += '\n';
        }
        return output;
    }

    public static parseEventDate(timeStamp: number): Date {
        return new Date(timeStamp * 1000);
    }

}

type LiveJournalThreadedComment = LiveJournalComment & { children: LiveJournalThreadedComment[]; };
function threadComments(comments: LiveJournalComment[]): LiveJournalThreadedComment[] {
    const threadedComments = comments as LiveJournalThreadedComment[];
    const commentMap: Record<number, LiveJournalThreadedComment> = {};
    for (let comment of threadedComments as LiveJournalThreadedComment[]) {
        comment.children = [];
        if (!comment.dtalkid) throw new Error(`Comment has no dtalkid`);
        commentMap[comment.dtalkid] = comment;
    }
    for (let comment of threadedComments) {
        if (comment.parentdtalkid !== 0) {
            commentMap[comment.parentdtalkid].children.push(comment as LiveJournalThreadedComment);
        }
    }
    return threadedComments.filter(c => c.parentdtalkid == 0);
}



function dateToString(date: Date) {
    return date.toISOString().substring(0, 16).replace("T", " ");
}

function isUserIcon(imageUrl: string) {
    return imageUrl.includes("userpic.livejournal.com");
}

const a = new LJArchive("output/friendjournals/bigbluefox");
a.writeObsidianMdAllEvents(`output/md/bigbluefox`);