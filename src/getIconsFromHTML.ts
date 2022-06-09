import parse, { HTMLElement } from "node-html-parser";
import { LiveJournalIconInfo, LiveJournalIconInfoDetails } from "./types";
import { decode } from "html-entities";

const RegExp_Icon_URL = /https:\/\/l-userpic\.livejournal\.com\/(\d+)\/(\d+)\/?/;

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
            //console.log(currentUserImg);
        } else {
            if (currentUserImg) {
                const regExpResult = RegExp_Icon_URL.exec(currentUserImg);
                if (!regExpResult) throw new Error(`Failed to parse URL ${currentUserImg}`);
                iconInfos.push(Object.assign(processTd(td), {
                    url: currentUserImg,
                    user_id: parseInt(regExpResult[2]),
                    icon_id: parseInt(regExpResult[1])
                }));
                currentUserImg = null;
            }
        }
    }
    return iconInfos;
}

function processTd(td: HTMLElement): LiveJournalIconInfoDetails {
    let iconInfo: LiveJournalIconInfoDetails = {
        is_default: false,
        user_id: 0,
        icon_id: 0,
        keywords: []
    };
    const items = td.childNodes.map(node => {
        if (node instanceof HTMLElement && node.attrs['data-ljuser']) {
            return node.attrs['data-ljuser'];
        }
        return node.innerText;
    }).filter(item => item != '');
    if (!items.length) return iconInfo;
    if (items[0] == "Default") {
        iconInfo.is_default = true;
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
    iconInfo.description = decode(items.join('')).trim();
    return iconInfo;
}