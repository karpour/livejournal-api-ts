import { LiveJournalSecurity } from "../types";

export type LiveJournalGetAlbumsOptions = {
    status: "OK",
    auth_token: string,
    albums: LiveJournalAlbumInfo[];
};

export type LiveJournalAlbumInfo = {
    count: number,
    timecreate: string,
    name: string,
    allowmask: number,
    description: string,
    groupids: number[],
    cover: string,
    url: string,
    security: LiveJournalSecurity,
    type: "image",
    id: number,
    privacy: LiveJournalSecurity;
};


// photo.get_records
export type LiveJournalGetPhotosOptions = {
    albumid: 347,
    limit: 50,
    migrated_info: 1,
    offset: 0,
    order: "desc" | "asc",
    sort: "timecreate" // Upload date
    | "timecreate_original" // Creation Date
    | "name"; // Name
    user: string;
};

export type LiveJournalPhotoInfo = {
    width: string,
    timeupdate: number,
    timecreate: number,
    bad_original_exif: 0 | 1 | boolean,
    url: string,
    id: number,
    privacy: LiveJournalSecurity,
    albumid: number,
    available_sizes: string[],
    name: string,
    thumbnail_url: string,
    allowmask: number,
    description: string,
    height: string,
    groupids: number[],
    album_cover: boolean,
    display_sizes: string[],
    index: number,
    security: LiveJournalSecurity;
};

export type LiveJournalGetPhotosResult = {
    records: LiveJournalPhotoInfo[],
    status: "OK",
};
