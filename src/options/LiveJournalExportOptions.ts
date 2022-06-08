export type LiveJournalExportOptionsRaw = {
    what: 'journal',
    year: string,
    month: string,
    format: 'xml' | 'csv',
    header?: 'on',
    encid: '2',
    field_itemid?: 'on',
    field_eventtime?: 'on',
    field_logtime?: 'on',
    field_subject?: 'on',
    field_event?: 'on',
    field_security?: 'on',
    field_allowmask?: 'on',
    field_currents?: 'on';
    notranslation?: 'on';
};

export type LiveJournalExportOptions = {
    year: number,
    month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    format: 'xml' | 'csv',
    field_itemid?: boolean,
    field_eventtime?: boolean,
    field_logtime?: boolean,
    field_subject?: boolean,
    field_event?: boolean,
    field_security?: boolean,
    field_allowmask?: boolean,
    field_currents?: boolean;
};

export type LiveJournalExportOptionsCsv = Pick<LiveJournalExportOptions, 'year' | 'month'>;

export function convertLiveJournalExportOptions(options: LiveJournalExportOptions): LiveJournalExportOptionsRaw {
    const newOpts: LiveJournalExportOptionsRaw = {
        what: 'journal',
        year: `${options.year}`,
        month: `${options.month}`.padStart(2, '0'),
        format: options.format,
        header: 'on',
        encid: '2',
    };
    if (options.field_itemid) newOpts.field_itemid = 'on';
    if (options.field_eventtime) newOpts.field_eventtime = 'on';
    if (options.field_logtime) newOpts.field_logtime = 'on';
    if (options.field_subject) newOpts.field_subject = 'on';
    if (options.field_event) newOpts.field_event = 'on';
    if (options.field_security) newOpts.field_security = 'on';
    if (options.field_allowmask) newOpts.field_allowmask = 'on';
    if (options.field_currents) newOpts.field_currents = 'on';
    return newOpts;
}