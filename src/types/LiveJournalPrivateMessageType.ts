
export const LiveJournalPrivateMessageTypes = [
    'Friended',
    'Birthday',
    'CommunityInvite',
    'CommunityJoinApprove',
    'CommunityJoinReject',
    'CommunityJoinRequest',
    'Defriended',
    'InvitedFriendJoins',
    'JournalNewComment',
    'JournalNewEntry',
    'NewUserpic',
    'NewVGift', // new virtual gift
    'OfficialPost', // notification from a news community
    'PermSale', // notification on permanent account sale (probably won’t happen)
    'PollVote',
    'SupOfficialPost', // ru_news notification
    'UserExpunged',
    'UserMessageRecvd',
    'UserMessageSent',
    'UserNewComment',
    'UserNewEntry',
    'message',
    'usermsg'
] as const;


export type LiveJournalPrivateMessageType = typeof LiveJournalPrivateMessageTypes[number];
