import {Action as AppAction} from 'react/app/design/types';
import {Action as ShareAction} from './types';

export const initSettings = {
    contribution: null,
    acls: [],
    groups: [],
    configLoadedNum: 0,
    groupLoadedNum: 0,
};

const createReducers = (Action, initState) => ({
    share: (state = initState ? initState : initSettings, action) => {
        switch (action.type) {
            case AppAction.LOAD_DESIGN_CONFIG_COMPLETE:
            case AppAction.LOAD_PATTERN_COLLECTION_CONFIG_COMPLETE: {
                let {config} = action.payload;
                let contribution = config.contribution;
                let acls = config.share;
                let configLoadedNum = state.configLoadedNum + 1;
                return Object.assign({}, state, {contribution, acls, configLoadedNum});
            }

            case AppAction.LOAD_GROUP_LIST_COMPLETE: {
                let {groups} = action.payload;
                let groupLoadedNum = state.groupLoadedNum + 1;
                return Object.assign({}, state, {groups, groupLoadedNum});
            }

            case ShareAction.RESET_SETTINGS: {
                return Object.assign({}, state);
            }

            case ShareAction.ADD_SHARE: {
                return Object.assign({}, state);
            }

            case ShareAction.CHANGE_SHARE: {
                return Object.assign({}, state);
            }

            case ShareAction.REMOVE_SHARE: {
                return Object.assign({}, state);
            }

            default:
                return null;
        }
    },
});

export default createReducers;
