import {Config} from 'js/util';
import {Action as BaseAction} from 'react/components/stacked_panel/types';

export const StateName = {
    PANEL: 'userGroup.panel',
}

const prefix = 'group_panel_';
let PrefixedAction = Config.prefixType(BaseAction, prefix);

export const Action = Object.assign({}, PrefixedAction, {
    //Extended actions defined here
});

export const Panel = {
    GROUP_MANAGEMENT: 'group_management',
    MEMBERS_MANAGEMENT: 'members_management',
    MY_GROUP: 'my_group',
}

export const PanelType = {
    [Panel.GROUP_MANAGEMENT]: {title: 'Group Management'},
    [Panel.MEMBERS_MANAGEMENT]: {title: 'Members management'},
    [Panel.MY_GROUP]: {title: 'My Group'},
}
