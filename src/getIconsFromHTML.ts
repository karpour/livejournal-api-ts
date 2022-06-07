import parse, { HTMLElement } from "node-html-parser";
import { LiveJournalIconInfo, LiveJournalIconInfoDetails } from "./types";
import { decode } from "html-entities";


export function getIconsFromHTML(htmlString: string): LiveJournalIconInfo[] {
    const root = parse(htmlString);

    /** All trs that contain usericons */
    const trs = root.getElementsByTagName("tr").filter(el => el.attributes.valign == "middle");

    /** Get all tds for each tr and flatten it into one array, filter out the middle spacer ones */
    const tds: HTMLElement[] = trs.map(tr => tr.childNodes.filter(td => td instanceof HTMLElement && td.attributes.width == undefined)).flat() as HTMLElement[];

    const iconInfos: LiveJournalIconInfo[] = [];
    let currentUserImg: string | null = null;
    for (let td of tds) {
        if (td.attributes.align == "center") {
            // Image
            const userImgElement = td.childNodes[0] as HTMLElement;
            currentUserImg = userImgElement.attributes.src;
            console.log(currentUserImg);
        } else {
            if (currentUserImg) {
                iconInfos.push(Object.assign(processTd(td), { url: currentUserImg }));
                currentUserImg = null;
            }
        }
    }
    return iconInfos;
}

function processTd(td: HTMLElement): LiveJournalIconInfoDetails {
    let iconInfo: LiveJournalIconInfoDetails = {
        isdefault: false,
        keywords: []
    };
    const items = td.childNodes.map(node => node.innerText).filter(item => item != '');
    if (!items.length) return iconInfo;
    if (items[0] == "Default") {
        iconInfo.isdefault = true;
        items.splice(0, 1);
    }
    if (!items.length) return iconInfo;
    if (items[0] == "Keywords:") {
        if (items[1]) {
            iconInfo.keywords = decode(items[1]).split(/,\s?/).map(item => item.trim());
            items.splice(0, 2);
        } else {
            return iconInfo;
        }
    }
    if (!items.length) return iconInfo;
    iconInfo.description = decode(items[0]).trim();
    return iconInfo;
}