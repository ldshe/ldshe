import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux'
import {designList} from 'react/design/design_list/reducers';
import {patternList} from 'react/design/pattern_list/reducers';
import {designStep} from 'react/design/design_wizard/reducers';
import {unitStep} from 'react/design/unit_step/reducers';
import {sessionStep} from 'react/design/session_step/reducers';
import {learningContext} from 'react/design/learning_context/reducers';
import {learningOutcome} from 'react/design/learning_outcome/reducers';
import {learningUnit} from 'react/design/learning_unit/reducers';
import {learningSession} from 'react/design/learning_session/allocation_panel/reducers';
import {pattern} from 'react/design/pattern/reducers';
import {userGroup} from 'react/design/group/redcuers';
import {notification} from 'react/design/notification/alert/reducers';
import {Action, EditTabType} from './types';

const initState = {
    courseId: null,
    collectId: null,
    groupId: null,
    designMutex: null,
    designMutexLastActiveOffset: 0,
    patternMutex: null,
    patternMutexLastActiveOffset: 0,
    user: null,
    timestamp: 0,
    timestamp2: 0,
    uuidv5Namespace: {
        outcome: 'e04abc87-eba7-4778-8a9e-c6f4c7e1bf56',
        unit: 'd79877d1-83e3-4ba2-946d-c8b682cd3ded',
        pattern: 'ea05dcab-8bba-4d14-9e99-e8769e61d72b',
        session: '94817096-d032-442a-9184-3b8e08e904df',
    },
    isDesignLocked: false,
    isNewDesign: false,
    isDesignLoaded: false,
    isDesignEditable: false,
    isPatternLocked: false,
    isNewPattern: false,
    isPatternLoaded: false,
    isPatternEditable: false,
    isNewGroup: false,
    isGroupLoaded: false,
    isGroupEditable: false,
    readDesignOnly: false,
    readPatternOnly: false,
    partialUpdate: false,
    isSaving: false,
    isSaveSucc: false,
    editTab: EditTabType.DESIGN,
    importDesign: {
        content: {},
        idMap: {},
    },
    importCollection: {
        content: {},
    },
    infos: [],
    success: [],
    errors: [],
}

const createDesignAppReducers = initState => (state = initState, action) => {
    switch (action.type) {
        case Action.LOCK_DESIGN_RESOURCE:
        case Action.TAKEOVER_DESIGN_RESOURCE: {
            const {courseId} = action.payload;
            return Object.assign({}, state, {
                isDesignLocked: false,
                designMutex: null,
                designMutexLastActiveOffset: 0,
                courseId,
            });
        }

        case Action.LOCK_DESIGN_RESOURCE_COMPLETE: {
            const {mutexId, data} = action.payload;
            return Object.assign({}, state, {
                isDesignLocked: true,
                designMutex: mutexId,
                designMutexLastActiveOffset: data.lastActiveOffset,
            });
        }

        case Action.KEEP_DESIGN_ALIVE_COMPLETE: {
            const {data} = action.payload;
            return Object.assign({}, state, {
                designMutexLastActiveOffset: data.lastActiveOffset,
            });
        }

        case Action.NEW_DESIGN:
        case Action.LOAD_DESIGN: {
            const {readOnly} = action.payload;
            return Object.assign({}, state, {
                isNewDesign: false,
                isDesignLoaded: false,
                isDesignEditable: false,
                readDesignOnly: readOnly ? true : false,
                readPatternOnly: false,
            });
        }

        case Action.NEW_DESIGN_COMPLETE: {
            const {courseId, timestamp} = action.payload;
            return Object.assign({}, state, {
                courseId,
                timestamp,
                isNewDesign: true,
            });
        }

        case Action.LOAD_DESIGN_COMPLETE: {
            const {courseId, timestamp, isEditable} = action.payload;
            return Object.assign({}, state, {
                courseId,
                timestamp,
                isDesignLoaded: true,
                isDesignEditable: isEditable,
            });
        }

        case Action.IMPORT_DESIGN: {
            let importDesign = {
                content: {},
                idMap: {},
            };
            return Object.assign({}, state, {importDesign});
        }

        case Action.IMPORT_CONTENT_READY: {
            let importDesign = action.payload;
            return Object.assign({}, state, {importDesign});
        }

        case Action.LOCK_COLLECTION_RESOURCE:
        case Action.TAKEOVER_COLLECTION_RESOURCE: {
            const {collectId} = action.payload;
            return Object.assign({}, state, {
                isPatternLocked: false,
                patternMutex: null,
                patternMutexLastActiveOffset: 0,
                collectId,
            });
        }

        case Action.LOCK_COLLECTION_RESOURCE_COMPLETE: {
            const {mutexId, data} = action.payload;
            return Object.assign({}, state, {
                isPatternLocked: true,
                patternMutex: mutexId,
                patternMutexLastActiveOffset: data.lastActiveOffset,
            });
        }

        case Action.KEEP_COLLECTION_ALIVE_COMPLETE: {
            const {data} = action.payload;
            return Object.assign({}, state, {
                patternMutexLastActiveOffset: data.lastActiveOffset,
            });
        }

        case Action.NEW_PATTERN_COLLECTION:
        case Action.LOAD_PATTERN_COLLECTION: {
            const {readOnly} = action.payload;
            return Object.assign({}, state, {
                isNewPattern: false,
                isPatternLoaded: false,
                isPatternEditable: false,
                readPatternOnly: readOnly ? true : false,
                readDesignOnly: false,
            });
        }

        case Action.NEW_PATTERN_COLLECTION_COMPLETE: {
            const {collectId, timestamp} = action.payload;
            return Object.assign({}, state, {
                collectId,
                timestamp2: timestamp,
                isNewPattern: true,
            });
        }

        case Action.LOAD_PATTERN_COLLECTION_COMPLETE: {
            const {collectId, timestamp, isEditable} = action.payload;
            return Object.assign({}, state, {
                collectId,
                timestamp2: timestamp,
                isPatternLoaded: true,
                isPatternEditable: isEditable,
            });
        }

        case Action.IMPORT_PATTERN_COLLECTION: {
            let importCollection = {
                content: {},
            };
            return Object.assign({}, state, {importCollection});
        }

        case Action.IMPORT_COLLECTION_CONTENT_READY: {
            let importCollection = action.payload;
            return Object.assign({}, state, {importCollection});
        }

        case Action.SET_PARTIAL_UPDATE: {
            let {partialUpdate} = action.payload;
            return Object.assign({}, state, {partialUpdate});
        }

        case Action.SAVE_IN_PROGRESS: {
            return Object.assign({}, state, {
                isSaving: true,
                isSaveSucc: false,
            });
        }

        case Action.SAVE_PROCESS_COMPLETE: {
            return Object.assign({}, state, {
                isSaveSucc: true,
                isSaving: false,
            });
        }

        case Action.SAVE_DESIGN_CONTENT_ERROR:
        case Action.SAVE_COLLECTION_CONTENT_ERROR:
        case Action.SAVE_PROCESS_ERROR: {
            return Object.assign({}, state, {
                isSaveSucc: false,
                isSaving: false,
            });
        }

        case Action.CHANGE_EDIT_TAB: {
            const {editTab} = action.payload;
            return Object.assign({}, state, {editTab});
        }

        case Action.SET_LAST_DESIGN_READ: {
            let timestamp = Date.now();
            return Object.assign({}, state, {timestamp});
        }

        case Action.SET_LAST_COLLECTION_READ: {
            let timestamp2 = Date.now();
            return Object.assign({}, state, {timestamp2});
        }

        case Action.NEW_GROUP:
        case Action.LOAD_GROUP: {
            return Object.assign({}, state, {
                isNewGroup: false,
                isGroupLoaded: false,
                isGroupEditable: false,
            });
        }

		case Action.NEW_GROUP_COMPLETE: {
            const {groupId} = action.payload;
            return Object.assign({}, state, {
                groupId,
                isNewGroup: true,
            });
        }

		case Action.LOAD_GROUP_COMPLETE: {
            const {groupId, isEditable} = action.payload;
            return Object.assign({}, state, {
                groupId,
                isGroupLoaded: true,
                isGroupEditable: isEditable,
            });
        }

        case Action.CLEAR_INFO_LOG: {
            let {infos} = action.payload;
            return Object.assign({}, state, {infos});
        }

        case Action.CLEAR_SUCCESS_LOG: {
            let {success} = action.payload;
            return Object.assign({}, state, {success});
        }

        case Action.CLEAR_ERRORS_LOG: {
            let {errors} = action.payload;
            return Object.assign({}, state, {errors});
        }

        case Action.COPYING_DESIGN:
        case Action.IMPORTING_DESIGN:
        case Action.IMPORTING_PATTERN:
        case Action.EXPORTING_PATTERN:
        case Action.COPYING_PATTERN_COLLECTION:
        case Action.IMPORTING_PATTERN_COLLECTION: {
            let {data} = action.payload;
            let infos = state.infos.slice();
            infos.push(data);
            return Object.assign({}, state, {infos});
        }

        case Action.IMPORT_DESIGN_COMPLETE:
        case Action.COPY_DESIGN_COMPLETE:
        case Action.REMOVE_DESIGN_COMPLETE:
        case Action.CONFIGURE_DESIGN_COMPLETE:
        case Action.CONTRIBUTE_DESIGN_COMPLETE:
        case Action.IMPORT_PATTERN_COMPLETE:
        case Action.EXPORT_PATTERN_COMPLETE:
        case Action.IMPORT_PATTERN_COLLECTION_COMPLETE:
        case Action.COPY_PATTERN_COLLECTION_COMPLETE:
        case Action.REMOVE_PATTERN_COLLECTION_COMPLETE:
        case Action.CONFIGURE_PATTERN_COLLECTION_COMPLETE:
        case Action.CONTRIBUTE_PATTERN_COLLECTION_COMPLETE:
        case Action.REMOVE_GROUP_COMPLETE:
        case Action.CONFIGURE_GROUP_COMPLETE:
        case Action.NEW_MEMBER_COMPLETE:
        case Action.REMOVE_MEMBER_COMPLETE: {
            let {data} = action.payload;
            let success = state.success.slice();
            success.push(data);
            return Object.assign({}, state, {success});
        }

        case Action.IMPORT_DESIGN_ERROR:
        case Action.REMOVE_DESIGN_ERROR:
        case Action.CONFIGURE_DESIGN_ERROR:
        case Action.CONTRIBUTE_DESIGN_ERROR:
        case Action.REVIEW_DESIGN_ERROR:
        case Action.LOAD_PATTERN_COLLECTION_LIST_POPUP_ERROR:
        case Action.LOAD_PATTERN_COLLECTION_PREVIEW_ERROR:
        case Action.IMPORT_PATTERN_ERROR:
        case Action.EXPORT_PATTERN_ERROR:
        case Action.IMPORT_PATTERN_COLLECTION_ERROR:
        case Action.REMOVE_PATTERN_COLLECTIOIN_ERROR:
        case Action.CONFIGURE_PATTERN_COLLECTION_ERROR:
        case Action.CONTRIBUTE_PATTERN_COLLECTION_ERROR:
        case Action.REVIEW_PATTERN_COLLECTION_ERROR:
        case Action.REMOVE_GROUP_ERROR:
        case Action.CONFIGURE_GROUP_ERROR:
        case Action.JOIN_GROUP_ERROR:
        case Action.LEAVE_GROUP_ERROR:
        case Action.NEW_MEMBER_ERROR:
        case Action.REMOVE_MEMBER_ERROR: {
            let {error} = action.payload;
            let errors = state.errors.slice();
            errors.push(error);
            return Object.assign({}, state, {errors});
        }

        default:
            return state;
    }
};


export default user => {
    let initAppState = Object.assign({}, initState, {user});
    return combineReducers({
        designApp: createDesignAppReducers(initAppState),
        designList,
        patternList,
        designStep,
        unitStep,
        sessionStep,
        learningContext,
        learningOutcome,
        learningUnit,
        learningSession,
        pattern,
        userGroup,
        notification,
        router: routerReducer,
    });
}
