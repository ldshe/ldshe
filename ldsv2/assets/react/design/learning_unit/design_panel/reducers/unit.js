import {Action as AppAction} from 'react/app/design/types';
import createStackedPanelReducers, {initPanel} from 'react/components/stacked_panel/reducers';
import {Panel, LearningActivity, InstanceAction} from '../types';

const initPattInst = {
    sysPatts: [
        LearningActivity.REVISION,
        LearningActivity.REFLECTION,
        LearningActivity.SELF_OR_PEER_ASSESSMENT,
        LearningActivity.CONCEPTUAL_OR_VISUAL_ARTEFACTS,
        LearningActivity.TANGIBLE_MANIPULABLE_ARTIFACT,
        LearningActivity.PRESENTATIONS_PERFORMANCE_ILLUSTRATION,
        LearningActivity.TANGIBLE_OR_IMMERSIVE_INVESTIGATION,
        LearningActivity.EXPLORATIONS_THROUGH_CONVERSATION,
        LearningActivity.INFORMATION_EXPLORATION,
        LearningActivity.TEST_ASSESSMENT,
        LearningActivity.PRACTICE,
        LearningActivity.RECEIVING_AND_INTERPRETING_INFORMATION,
    ],

    userPatts: [],

    editUnitId: null,

    editUnitPos: -1,

    editRoot: null,

    currEditNode: null,

    selectedChildId: null,

    additional: {
        currAdditionalSettingsData: [],
        additionalSettingsPanel: initPanel,
        onEdit: false,
        activityFieldChanged: false,
    },

    fileState: {
        uploadNum: 0,
        uploadedFile: null,
    },
};

const additionalPanel = createStackedPanelReducers(InstanceAction.ADDITIONAL_SETTINGS_PANEL).panel;

export default (state = initPattInst, action) => {
    switch (action.type) {
        case AppAction.LOAD_DESIGN_COMPLETE: {
            let userPatts = action.payload.data.instances;
            return Object.assign({}, state, {userPatts});
        }

        case AppAction.FILEUPLOAD_COMPLETE: {
            let {data} = action.payload;
            let uploadNum = state.fileState.uploadNum + 1;
            let uploadedFile = data;
            return Object.assign({}, state, {fileState: {uploadNum, uploadedFile}});
        }

        case AppAction.FILEUPLOAD_ERROR: {
            let uploadNum = state.fileState.uploadNum + 1;
            let {error} = action.payload;
            return Object.assign({}, state, {fileState: {uploadNum, error}});
        }

        case InstanceAction.RESET: {
            let state = initPattInst;
            return Object.assign({}, state);
        }

        case InstanceAction.RESTORE: {
            return Object.assign({}, state);
        }

        case InstanceAction.LOAD_USER_PATTERN: {
            const {editUnitId, editUnitPos, editRoot, currEditNode} = action.payload;
            let userPatts = state.userPatts.slice();
            let pos = userPatts.map(p => p.id).indexOf(editUnitId);
            if(pos == -1) userPatts.push({id: editUnitId, patt: editRoot});
            return Object.assign({}, state, {userPatts, editUnitId, editUnitPos, editRoot, currEditNode});
        }

        case InstanceAction.DELETE_USER_PATTERN: {
            const {userPatts} = action.payload;
            return Object.assign({}, state, {userPatts});
        }

        case InstanceAction.ADD_PATTERN:
        case InstanceAction.DELETE_PATTERN:
        case InstanceAction.UPDATE_POSITION:
        case InstanceAction.UPDATE_CONNECTION:
        case InstanceAction.ACTIVITY_FIELD_CHANGE:
        case InstanceAction.CHANGE_SUBTYPE:
        case InstanceAction.CHANGE_NAME: {
            const {editRoot, currEditNode} = action.payload;
            //immediately take effect
            let userPatts = state.userPatts.slice();
            let repPos = userPatts.map(p => p.id).indexOf(state.editUnitId);
            if(repPos != -1)
                userPatts[repPos] = {id: state.editUnitId, patt: editRoot};
            else
                userPatts.push({id: state.editUnitId, patt: editRoot});
            return Object.assign({}, state, {userPatts, editRoot, currEditNode});
        }

        case InstanceAction.ADDITIONAL_SETTINGS_PANEL.RESET:
        case InstanceAction.ADDITIONAL_SETTINGS_PANEL.FRESH_PANEL:
        case InstanceAction.ADDITIONAL_SETTINGS_PANEL.PUSH_PANEL:
        case InstanceAction.ADDITIONAL_SETTINGS_PANEL.POP_PANEL:
        case InstanceAction.ADDITIONAL_SETTINGS_PANEL.JUMP_TO_PANEL: {
            let additionalSettingsPanel = additionalPanel(state.additional.additionalSettingsPanel, action);
            let additional = Object.assign({}, state.additional, {additionalSettingsPanel});
            additional.onEdit = action.type == InstanceAction.ADDITIONAL_SETTINGS_PANEL.PUSH_PANEL;
            if(!additional.onEdit) additional.activityFieldChanged = false;
            return Object.assign({}, state, {additional});
        }

        case InstanceAction.ADDITIONAL_SETTINGS.ADD_ITEM:
        case InstanceAction.ADDITIONAL_SETTINGS.REMOVE_ITEM:
        case InstanceAction.ADDITIONAL_SETTINGS.MOVE_ITEM:
        case InstanceAction.ADDITIONAL_SETTINGS.UPDATE_ITEM_FIELD: {
            const {data} = action.payload;
            let additional = Object.assign({}, state.additional, {currAdditionalSettingsData: data});
            if(action.type == InstanceAction.ADDITIONAL_SETTINGS.UPDATE_ITEM_FIELD) additional.activityFieldChanged = true;
            return Object.assign({}, state, {additional});
        }

        case InstanceAction.CHANGE_LEVEL: {
            const {currEditNode, selectedChildId} = action.payload;
            return Object.assign({}, state, {currEditNode, selectedChildId});
        }

        case InstanceAction.SELECT_CHILD: {
            const {selectedChildId} = action.payload;
            return Object.assign({}, state, {selectedChildId});
        }

        case InstanceAction.REFRESH_PATTERN: {
            const {userPatts} = action.payload;
            return Object.assign({}, state, {userPatts});
        }

        case InstanceAction.PARTIAL_UPDATE: {
            const {userPatts, editRoot, currEditNode} = action.payload;
            return Object.assign({}, state, {userPatts, editRoot, currEditNode});
        }

        default:
            return state;
    }
};
