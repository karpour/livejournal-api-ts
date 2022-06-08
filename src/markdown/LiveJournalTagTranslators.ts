import { TranslatorConfig } from 'node-html-markdown';
import { TranslatorContext } from 'node-html-markdown/dist/translator';

type TranslatorPostProcessContext = TranslatorContext & { content: string; };

/**
 * Translator for <lj name="name" />
 */
export class LiveJournalUserTagTranslator implements TranslatorConfig {
    //public readonly prefix: string = 'ljtag';
    public readonly preserveIfEmpty = true;
    public postprocess(ctx: TranslatorPostProcessContext): string {
        //console.log(ctx.node.attributes);
        return `<lj-user:${(ctx.node.attributes as any).user ?? 'unknown'}>`;
    }
}

/**
 * Translator for <lj-spoiler> 
 */
export class LiveJournalSpoilerTranslator implements TranslatorConfig {
    //public readonly prefix: string = 'ljtag';
    public readonly preserveIfEmpty = false;
    public postprocess(ctx: TranslatorPostProcessContext): string {
        //console.log(ctx.node.attributes);
        return ctx.content;
    }
}

//<lj-cut text=\"Cut Cut here\">

/**
 * Translator for <lj-cut text="cut_text">
 */
export class LiveJournalCutTranslator implements TranslatorConfig {
    public readonly preserveIfEmpty = true;
    public readonly surroundingNewlines = true;
    public postprocess(ctx: TranslatorPostProcessContext): string {
        //console.log(ctx.node.attributes);
        const cutText: string | undefined = (ctx.node.attributes as any).text;
        if (cutText) {
            return `---${cutText}---\n` + ctx.content;
        } else {
            return `------\n` + ctx.content;
        }
    }
}

/**
 * Translator for <lj-poll pollid="123">abc</lj-poll>
 */
export class LiveJournalPollTranslator implements TranslatorConfig {
    public readonly preserveIfEmpty = true;
    public readonly surroundingNewlines = true;
    public postprocess(ctx: TranslatorPostProcessContext): string {
        //console.log(ctx.node.attributes);
        const pollId: string | undefined = (ctx.node.attributes as any).text;
        if (pollId) {
            return `Poll ${pollId}`;
        }
        return '';
    }
}
