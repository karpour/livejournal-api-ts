function parseDefaultIconUrl(url: string, username: string): string {
    const RegExp_Icon_Url = /^https?:\/\/l-userpic.livejournal.com\/\d+\/(\d+)$/;
    const regExpResult = RegExp_Icon_Url.exec(url);
    if (regExpResult) {
        return `${regExpResult[1]}_${username}.png`;
    }
    throw new Error(`Invalid URL: ${url}`);
}
