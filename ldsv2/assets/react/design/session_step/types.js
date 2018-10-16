import {Config} from 'js/util';
import {Action as BaseAction} from 'react/components/stacked_panel/types';

export const StateName = {
    SESSION_STEP: 'sessionStep',
}

export const Panel = {
    SESSION: 'session',
    SESSION_DETAILS: 'session_details',
    SESSION_SETTINGS: 'session_settings',
}

export const PanelType = {
    [Panel.SESSION]: {title: 'Sessions'},
    [Panel.SESSION_DETAILS]: {title: 'Details'},
    [Panel.SESSION_SETTINGS]: {title: 'Task Settings'},
}

const prefix = 'session_step_';
let PrefixedAction = Config.prefixType(BaseAction, prefix);

export const Action = Object.assign({}, PrefixedAction, {
    //Extended actions defined here
});
