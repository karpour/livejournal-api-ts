export type LiveJournalExportCommentsOptions = {
    get: 'comment_meta' | 'comment_body';
    startid: number;
};

/*
Comment Data Summary
Element	Attribute	Mode	Mutable	Description
maxid 		meta 	yes 	This element gives you an integer value of the maximum comment id currently available in the user's journal. This is the endpoint, inclusive.
comment 	id 	meta, body 	no 	The id of this particular comment.
comment 	posterid 	meta, body 	yes 	The id of the poster of this comment. This can only change from 0 (anonymous) to some non-zero number. It will never go the other way, nor will it change from some non-zero number to another non-zero number. Anonymous (0) is the default if no posterid is supplied.
comment 	state 	meta, body 	yes 	S = screened comment, D = deleted comment, A = active (visible) comment. If the state is not explicitly defined, it is assumed to be A.
comment 	jitemid 	body 	no 	Journal itemid this comment was posted in.
comment 	parentid 	body 	no 	0 if this comment is top-level, else, it is the id of the comment this one was posted in response to. Top-level (0) is the default if no parentid is supplied.
usermap 	id 	meta 	no 	Poster id part of pair.
usermap 	user 	meta 	yes 	Username part of poster id + user pair. This can change if a user renames.
body 		body 	no 	The text of the comment.
subject 		body 	no 	The subject of the comment. This may not be present with every comment.
date 		body 	no 	The time this comment was posted at. This is in the W3C Date and Time format.
property 		body 	no 	The property tag has one attribute, name, that indicates the name of this property. The content of the tag is the value of that property.
*/