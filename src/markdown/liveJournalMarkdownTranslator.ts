import { NodeHtmlMarkdown, TranslatorConfigObject } from "node-html-markdown";
import { LiveJournalCutTranslator, LiveJournalPollTranslator, LiveJournalSpoilerTranslator, LiveJournalUserTagTranslator } from "./LiveJournalTagTranslators";


const ljTagTranslator: LiveJournalUserTagTranslator = new LiveJournalUserTagTranslator();

const liveJournalTagTranslators: TranslatorConfigObject = {
    'lj': new LiveJournalUserTagTranslator(),
    'lj-spoiler': new LiveJournalSpoilerTranslator(),
    'lj-cut': new LiveJournalCutTranslator(),
    'lj-poll': new LiveJournalPollTranslator(),
};

const liveJournalMarkdownTranslator = new NodeHtmlMarkdown({
  
}, liveJournalTagTranslators);

export default liveJournalMarkdownTranslator;