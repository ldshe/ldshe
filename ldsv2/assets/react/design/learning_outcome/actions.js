import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import {Config} from 'js/util';
import {Design} from  'react/services/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {importContentReady} from 'react/app/design/actions';
import createActions from 'react/components/sortable_list/actions';
import {removeOutcome} from 'react/design/learning_unit/pedagogical_sequence/actions';
import {Action, StateName as OutcomeStateName, LearningOutcomes} from './types';
import DataHandler from './data_handler';

const appStateName = AppStateName.DESIGN_APP;
const outcomeStateName = OutcomeStateName.LEARNING_OUTCOME;

const SortableActions = createActions(Action, outcomeStateName);

export const addItem = pos => (dispatch, getState) => {
    const {courseId, uuidv5Namespace} = Config.get(getState(), appStateName);
    let item = {
        id: uuidv5(`course.${courseId}.${uuidv4()}`, uuidv5Namespace.outcome),
        type: LearningOutcomes[0].value,
        description: ''
    };
    dispatch(SortableActions.addItem(pos, item));
}

export const removeItem = (pos, id) => (dispatch, getState) => {
    dispatch(SortableActions.removeItem(pos));
    dispatch(removeOutcome(id));
}

export const importContent = srcOutcomes => (dispatch, getState) => {
    const {courseId, uuidv5Namespace, importDesign} = Config.get(getState(), appStateName);
    let idMap = Object.assign({}, importDesign.idMap);
    let handler = new DataHandler;
    let outcomes = handler.importClone(srcOutcomes, {courseId, uuidv5Namespace}, idMap);
    let content = Object.assign({}, importDesign.content, {outcomes});
    dispatch(importContentReady({content, idMap}));
}

export const partialUpdate = outcomes => (dispatch, getState) => {
    outcomes = JSON.parse(JSON.stringify(outcomes));
    let data = Design.loadPartial.convertOutcomes(outcomes);
    let payload = {data};
    return dispatch({type: Action.PARTIAL_UPDATE, payload});
}

export const {
    reset,
    restore,
    updateItemField,
    moveItem,
} = SortableActions;
