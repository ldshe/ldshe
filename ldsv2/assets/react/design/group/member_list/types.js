import {Config} from 'js/util';
import {Action as BaseAction} from 'react/components/data_list/types';

export {SortDir} from 'react/components/data_list/types';

export const StateName = {
    MEMBER_LIST: 'userGroup.memberList',
}

const prefix = 'group_member_list_';
let PrefixedAction = Config.prefixType(BaseAction, prefix);

export const Action = Object.assign({}, PrefixedAction, {
    //Extended actions defined here
});

export const ListType = {
    MEMBER: 'member',
    MANAGEABLE: 'manageable',
}

export const ColumnMeta = {
    [ListType.MEMBER]: [
        {key: 'username', searchable: true, filterable: false, sortable: true},
        {key: 'fullname', searchable: true, filterable: false, sortable: true},
        {key: 'email', searchable: true, filterable: false, sortable: false},
    ],
    [ListType.MANAGEABLE]:  [
        {key: 'username', searchable: true, filterable: false, sortable: true},
        {key: 'fullname', searchable: true, filterable: false, sortable: true},
        {key: 'status', searchable: false, filterable: true, sortable: true},
        {key: 'email', searchable: true, filterable: false, sortable: false},
        {key: 'control', searchable: false, filterable: false, sortable: false},
    ]
}

export const StatusType = {
    ACTIVE: 'active',
    INVITING: 'inviting',
    INVITATION_REJECTED: 'invitation_rejected',
    INVITATION_EXPIRED: 'invitation_expired',
    LEFT: 'left',
}

export const StatusMap = {
    [StatusType.ACTIVE]: 'Active',
    [StatusType.INVITING]: 'Inviting',
    [StatusType.INVITATION_REJECTED]: 'Invitation rejected',
    [StatusType.INVITATION_EXPIRED]: 'Invitation expired',
    [StatusType.LEFT]: 'Left',
};
