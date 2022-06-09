
export type LiveJournalUserTag = {
    /** Tag name*/
    name: string;
    /**
     * Tag security/visibility level. Supported options:
     * public
     * private
     * friends
     * group
     * List of group IDs can be retrieved from the security parameter
     */
    security_level: string;
    /** number of times the tag is used */
    uses: number;
    /** when set to on, the tag is visible in the S26 style system. When set to off, tags are available, but not visible, in the S2 style system*/
    display: string;
    /** structure that shows tag use statistics across security */
    security: {
        /** number of tag instances in public entries */
        public: number;
        /** number of tag instances in private entries */
        private: number;
        /** number of tag instances in entries visible to user's friends only */
        friends: number;
        /** structure that has user group identifiers as keys.
         *  Values stand for the number of times the tag was used in entries within the relevant user group */
        groups: { [key: string]: number; };
    };
};
