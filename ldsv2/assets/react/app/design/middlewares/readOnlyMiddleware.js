import {Config} from 'js/util';
import {Action as AppAction, StateName as AppStateName} from '../types';
import {setLastDesignRead, setLastCollectionRead} from '../actions';
import {Action as ContextAction} from 'react/design/learning_context/types';
import {restore as contextRestore} from 'react/design/learning_context/actions';
import {Action as OutcomeAction} from 'react/design/learning_outcome/types';
import {restore as outcomeRestore} from 'react/design/learning_outcome/actions';
import {Action as UnitAction} from 'react/design/learning_unit/pedagogical_sequence/types';
import {restore as unitRestore} from 'react/design/learning_unit/pedagogical_sequence/actions';
import {PatternAction} from 'react/design/learning_unit/design_panel/types';
import {restore as patternRestore} from 'react/design/learning_unit/design_panel/actions/pattern';
import {InstanceAction} from 'react/design/learning_unit/design_panel/types';
import {restore as instanceRestore} from 'react/design/learning_unit/design_panel/actions/unit';
import {Action as SessionAction} from 'react/design/learning_session/allocation_panel/types';
import {restore as sessionRestore} from 'react/design/learning_session/allocation_panel/actions';
import {Action as CollectionAction} from 'react/design/pattern/types';
import {restore as collectionRestore} from 'react/design/pattern/actions';

const restoreDesign = (store, next, action, restore) => {
    const appState = Config.get(store.getState(), AppStateName.DESIGN_APP);
    if(appState.readDesignOnly)
        store.dispatch(restore());
    else
        next(action);
}

const restoreCollection = (store, next, action, restore) => {
    const appState = Config.get(store.getState(), AppStateName.DESIGN_APP);
    if(appState.readPatternOnly)
        store.dispatch(restore());
    else
        next(action);
}

export default store => next => action => {
    const appState = Config.get(store.getState(), AppStateName.DESIGN_APP);

    if(appState.partialUpdate) {
        next(action);
        return;
    }

    if(appState.readDesignOnly && action.type != AppAction.SET_LAST_DESIGN_READ && !appState.partialUpdate) {
        store.dispatch(setLastDesignRead());
    }

    if(appState.readPatternOnly && action.type != AppAction.SET_LAST_COLLECTION_READ && !appState.partialUpdate) {
        store.dispatch(setLastCollectionRead());
    }

    switch(action.type) {
        case ContextAction.FIELD_CHANGE: {
            restoreDesign(store, next, action, contextRestore);
            break;
        }

        case OutcomeAction.ADD_ITEM:
        case OutcomeAction.REMOVE_ITEM:
        case OutcomeAction.MOVE_ITEM:
        case OutcomeAction.UPDATE_ITEM_FIELD: {
            restoreDesign(store, next, action, unitRestore);
            break;
        }

        case UnitAction.ADD_ITEM:
        case UnitAction.REMOVE_ITEM:
        case UnitAction.MOVE_ITEM:
        case UnitAction.UPDATE_ITEM_FIELD: {
            restoreDesign(store, next, action, outcomeRestore);
            break;
        }

        case PatternAction.DELETE_USER_PATTERN:
        case PatternAction.CHANGE_SUBTYPE:
        case PatternAction.CHANGE_NAME:
        case PatternAction.ADD_PATTERN:
        case PatternAction.DELETE_PATTERN:
        case PatternAction.UPDATE_POSITION:
        case PatternAction.UPDATE_CONNECTION:
        case PatternAction.ACTIVITY_FIELD_CHANGE:
        case PatternAction.APPLY_PATTERN: {
            restoreDesign(store, next, action, patternRestore);
            break;
        }

        case InstanceAction.DELETE_USER_PATTERN:
        case InstanceAction.CHANGE_SUBTYPE:
        case InstanceAction.CHANGE_NAME:
        case InstanceAction.ADD_PATTERN:
        case InstanceAction.DELETE_PATTERN:
        case InstanceAction.UPDATE_POSITION:
        case InstanceAction.UPDATE_CONNECTION:
        case InstanceAction.ACTIVITY_FIELD_CHANGE: {
            restoreDesign(store, next, action, instanceRestore);
            break;
        }

        case SessionAction.ADD_SESSION:
        case SessionAction.REMOVE_SESSION:
        case SessionAction.ADD_STAGE_ITEM:
        case SessionAction.REMOVE_STAGE_ITEM:
        case SessionAction.REMOVE_ALL_STAGE_ITEM:
        case SessionAction.REORDER_STAGE_ITEM:
        case SessionAction.CLEAR_STAGE_ITEM:
        case SessionAction.FIELD_CHANGE: {
            restoreDesign(store, next, action, sessionRestore);
            break;
        }

        case CollectionAction.CHANGE_NAME:
        case CollectionAction.ADD_PATTERN:
        case CollectionAction.DELETE_PATTERN:
        case CollectionAction.UPDATE_POSITION:
        case CollectionAction.UPDATE_CONNECTION:
        case CollectionAction.ACTIVITY_FIELD_CHANGE: {
            restoreCollection(store, next, action, collectionRestore);
            break;
        }

        default:
            next(action);
    }
}
