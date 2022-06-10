[{
    jsonrpc: "2.0",
    method: "profile.get_friends",
    params: {
        user: "henriekeg",
        get_list: "mutual_friends",
        mode_full: true,
        auth_token: "ajax:1654869600:12170000:132:/__api/::6ac1c045f05787d354341236794e7cbacb203c16"
    },
    id: 6
}];

export type LiveJournalGetProfileFriendsOptions = {
    user: string,
    get_list: 'mutual_friends' | 'pfriends' | 'friendof' | 'mutual_friendof';
    mode_full: boolean,
};

export type LiveJournalUserProfileFriend = {
    is_invisible: boolean | null,
    profile_url: string,
    display_name: string,
    lc_name: string;
};

export type LiveJournalGetProfileFriendsResponse = {
    commafy_count: string,
    count: number,
    ml_list_name: string,
    u_profile_url: string,
    status: "ok",
    auth_token: string,
    max_friend_show: 50,
    list_name: "mutual_friends",
    u_profile_friendlist_url: "https://henriekeg.livejournal.com/profile/friendlist",
    mode_full: 1,
    u_identity: "",
    mode_full_name: "mode_full_socconns",
    block: "socconns",
    list: LiveJournalUserProfileFriend[];
};
