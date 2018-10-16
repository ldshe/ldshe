import {Config} from 'js/util';
import {Action as ListBaseAction} from 'react/components/data_list/types';
import {Action as SettingsBaseAction} from 'react/design/settings/types';

export {SortDir} from 'react/components/data_list/types';

export const StateName = {
    PATTERN_LIST: 'patternList',
}

const prefix = 'pattern_list_';
let PrefixedAction = Object.assign({},
    Config.prefixType(ListBaseAction, prefix),
    Config.prefixType(SettingsBaseAction, prefix)
);

export const Action = Object.assign({}, PrefixedAction, {
    SWITCH_LIST: `${prefix}switch_list`,
    SET_EDIT_COLLECTION: `${prefix}set_edit_collection`,
    CONFIGURE_PATTERN: `${prefix}configure_pattern`,
});

export const ContributionRequest = {
    PENDING: 'pending',
    APPROVED: 'approved',
    DENIED: 'denied',
};

export const ListType = {
    MY: 'my',
    GROUP: 'group',
    CURATOR: 'curator',
    PUBLIC: 'public',
    OTHERS: 'others',
    PENDING_REQUESTS: 'pending_requests',
};

let myColumnMeta = [
    {key: 'fullname', searchable: true, filterable: false, sortable: true},
    {key: 'tags', searchable: true, filterable: false, sortable: false},
    {key: 'more', searchable: false, filterable: false, sortable: false},
];

let othersColumnMeta = [
    {key: 'fullname', searchable: true, filterable: false, sortable: true},
    {key: 'tags', searchable: true, filterable: false, sortable: false},
    {key: 'owner', searchable: true, filterable: false, sortable: true},
    {key: 'more', searchable: false, filterable: false, sortable: false},
];

export const ColumnMeta = {
    [ListType.MY]: myColumnMeta,
    [ListType.GROUP]: othersColumnMeta,
    [ListType.CURATOR]: othersColumnMeta,
    [ListType.PUBLIC]: othersColumnMeta,
    [ListType.OTHERS]: othersColumnMeta,
    [ListType.PENDING_REQUESTS]: othersColumnMeta,
}
