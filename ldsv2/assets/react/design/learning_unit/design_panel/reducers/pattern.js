import {Action as AppAction} from 'react/app/design/types';
import createStackedPanelReducers, {initPanel} from 'react/components/stacked_panel/reducers';
import {Panel, LearningActivity, PatternAction} from '../types';

const initPatt = {
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

    editPattId: null,

    editRoot: null,

    currEditNode: null,

    selectedChildId: null,

    structuralChanged: false,

    activityFieldChanged: false,

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

    onEdit: false,
};

const additionalPanel = createStackedPanelReducers(PatternAction.ADDITIONAL_SETTINGS_PANEL).panel;

export default (state = initPatt, action) => {
    switch (action.type) {
        case AppAction.LOAD_DESIGN_COMPLETE: {
            let userPatts = action.payload.data.patterns;
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

        case PatternAction.RESET: {
            let state = initPatt;
            return Object.assign({}, state);
        }

        case PatternAction.RESTORE: {
            return Object.assign({}, state);
        }

        case PatternAction.LOAD_USER_PATTERN: {
            const {editPattId, editRoot, currEditNode} = action.payload;
            let onEdit = true;
            return Object.assign({}, state, {editPattId, editRoot, currEditNode, onEdit});
        }

        case PatternAction.LOAD_CLONED_USER_PATTERN: {
            const {editPattId, editRoot, currEditNode} = action.payload;
            return Object.assign({}, state, {editPattId, editRoot, currEditNode});
        }

        case PatternAction.DELETE_USER_PATTERN: {
            const {userPatts} = action.payload;
            return Object.assign({}, state, {userPatts});
        }

        case PatternAction.ADD_PATTERN:
        case PatternAction.DELETE_PATTERN:
        case PatternAction.UPDATE_POSITION:
        case PatternAction.UPDATE_CONNECTION:
        case PatternAction.CHANGE_TAGS:
        case PatternAction.CHANGE_SUBTYPE:
        case PatternAction.CHANGE_NAME: {
            let structuralChanged = true;
            const {editRoot, currEditNode} = action.payload;
            return Object.assign({}, state, {editRoot, currEditNode, structuralChanged});
        }

        case PatternAction.ACTIVITY_FIELD_CHANGE: {
            let activityFieldChanged = true;
            const {editRoot, currEditNode} = action.payload;
            return Object.assign({}, state, {editRoot, currEditNode, activityFieldChanged});
        }

        case PatternAction.ADDITIONAL_SETTINGS_PANEL.RESET:
        case PatternAction.ADDITIONAL_SETTINGS_PANEL.FRESH_PANEL:
        case PatternAction.ADDITIONAL_SETTINGS_PANEL.PUSH_PANEL:
        case PatternAction.ADDITIONAL_SETTINGS_PANEL.POP_PANEL:
        case PatternAction.ADDITIONAL_SETTINGS_PANEL.JUMP_TO_PANEL: {
            let additionalSettingsPanel = additionalPanel(state.additional.additionalSettingsPanel, action);
            let additional = Object.assign({}, state.additional, {additionalSettingsPanel});
            additional.onEdit = action.type == PatternAction.ADDITIONAL_SETTINGS_PANEL.PUSH_PANEL;
            if(!additional.onEdit) additional.activityFieldChanged = false;
            return Object.assign({}, state, {additional});
        }

        case PatternAction.ADDITIONAL_SETTINGS.ADD_ITEM:
        case PatternAction.ADDITIONAL_SETTINGS.REMOVE_ITEM:
        case PatternAction.ADDITIONAL_SETTINGS.MOVE_ITEM:
        case PatternAction.ADDITIONAL_SETTINGS.UPDATE_ITEM_FIELD: {
            const {data} = action.payload;
            let additional = Object.assign({}, state.additional, {currAdditionalSettingsData: data});
            if(action.type == PatternAction.ADDITIONAL_SETTINGS.UPDATE_ITEM_FIELD) additional.activityFieldChanged = true;
            return Object.assign({}, state, {additional});
        }

        case PatternAction.APPLY_PATTERN: {
            let structuralChanged = false;
            let activityFieldChanged = false;
            let onEdit = false;
            const {userPatts} = action.payload;
            return Object.assign({}, state, {userPatts, structuralChanged, activityFieldChanged, onEdit});
        }

        case PatternAction.CANCEL_PATTERN: {
            let structuralChanged = false;
            let activityFieldChanged = false;
            let onEdit = false;
            const {editPattId, editRoot, currEditNode} = action.payload;
            return Object.assign({}, state, {editPattId, editRoot, currEditNode, structuralChanged, activityFieldChanged, onEdit});
        }

        case PatternAction.CHANGE_LEVEL: {
            const {currEditNode, selectedChildId} = action.payload;
            return Object.assign({}, state, {currEditNode, selectedChildId});
        }

        case PatternAction.SELECT_CHILD: {
            const {selectedChildId} = action.payload;
            return Object.assign({}, state, {selectedChildId});
        }

        case PatternAction.PARTIAL_UPDATE: {
            const {userPatts} = action.payload;
            return Object.assign({}, state, {userPatts});
        }

        default:
            return state;
    }
};
