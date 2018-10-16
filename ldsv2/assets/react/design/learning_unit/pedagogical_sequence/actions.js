import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import {Config, isNumber} from 'js/util';
import {Design} from  'react/services/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {importContentReady} from 'react/app/design/actions';
import createActions from 'react/components/sortable_list/actions';
import {loadUserPattern, deleteUserPattern, refreshUnitType, changeUnitTitle} from '../design_panel/actions/unit';
import {Action, StateName as UnitStateName} from './types';
import DataHandler from './data_handler';

const appStateName = AppStateName.DESIGN_APP;
const unitStateName = UnitStateName.LEARNING_UNIT;

const SortableActions = createActions(Action, unitStateName);

export const addItem = pos => (dispatch, getState) => {
    const {courseId, uuidv5Namespace} = Config.get(getState(), appStateName);
    let item = {
        id: uuidv5(`course.${courseId}.${uuidv4()}`, uuidv5Namespace.unit),
        title: '',
        approach: '',
        outcomes: [],
        assessment: false,
        groupAssessment: 0,
        individualAssessment: 0,
        teachingTime: 0,
        selfStudyTime: 0,
        description: '',
    };
    dispatch(SortableActions.addItem(pos, item));
    dispatch(loadUserPattern(item.id));
    dispatch(refreshUnitType());
}

export const updateItemField = (pos, field) => (dispatch, getState) => {
    let keys = Object.keys(field);

    if(keys.indexOf('los[]') != -1 && field['los[]']) {
        const state = Config.get(getState(), unitStateName);
        const item = state.data[pos];
        let outcomes = [...item.outcomes];
        let [val, checked] = field['los[]'].split(':');
        if(checked)
            outcomes.push(val);
        else
            outcomes.splice(outcomes.indexOf(val), 1);
        field = {outcomes};
    }

    if(keys.indexOf('title') != -1) {
        const state = Config.get(getState(), unitStateName);
        const item = state.data[pos];
        dispatch(changeUnitTitle(item.id, field['title']));
    }

    if(keys.indexOf('groupAssessment') != -1) {
        const state = Config.get(getState(), unitStateName);
        const item = state.data[pos];
        if(isNumber(field['groupAssessment'])) {
            let val = Number(field['groupAssessment']);
            if(val < 1 || val > 100)
                val = null;
            field['groupAssessment'] = val;
        } else {
            field['groupAssessment'] = null;
        }

        field['assessment'] = isNumber(field['groupAssessment']) || isNumber(item['individualAssessment']);
    }

    if(keys.indexOf('individualAssessment') != -1) {
        const state = Config.get(getState(), unitStateName);
        const item = state.data[pos];
        if(isNumber(field['individualAssessment'])) {
            let val = Number(field['individualAssessment']);
            if(val < 1 || val > 100)
                val = null;
            field['individualAssessment'] = val
        } else {
            field['individualAssessment'] = null;
        }

        field['assessment'] = isNumber(field['individualAssessment']) || isNumber(item['groupAssessment']);
    }

    dispatch(SortableActions.updateItemField(pos, field));
}

export const moveItem = (prevPos, newPos) => (dispatch, getState) => {
    dispatch(SortableActions.moveItem(prevPos, newPos));
    dispatch(refreshUnitType());
}

export const removeItem = (pos, id) => (dispatch, getState) => {
    dispatch(SortableActions.removeItem(pos));
    dispatch(deleteUserPattern(id));
    dispatch(refreshUnitType());
    const state = Config.get(getState(), unitStateName);
}

export const removeOutcome = id => (dispatch, getState) => {
    const state = Config.get(getState(), unitStateName);
    let data = state.data.slice();
    data.forEach(d => {
        let rmPos = d.outcomes.indexOf(id);
        if(rmPos != -1) {
            let o = d.outcomes.slice();
            o.splice(rmPos, 1);
            d.outcomes = o;
        }
    });
    let payload = {data};
    dispatch({type: Action.REMOVE_OUTCOME, payload});
}

export const updateTeachingStudyTime = (id, teachingTime, selfStudyTime) => (dispatch, getState) => {
    const state = Config.get(getState(), unitStateName);
    let data = state.data.slice();
    let d = data.filter(d => d.id == id)[0];
    d.teachingTime = teachingTime;
    d.selfStudyTime = selfStudyTime;
    let payload = {data};
    dispatch({type: Action.UPDATE_TEACHING_STUDY_TIME, payload});
}

export const importContent = srcUnits => (dispatch, getState) => {
    const {courseId, uuidv5Namespace, importDesign} = Config.get(getState(), appStateName);
    let idMap = Object.assign({}, importDesign.idMap);
    let handler = new DataHandler;
    let units = handler.importClone(srcUnits, {courseId, uuidv5Namespace}, idMap);
    let content = Object.assign({}, importDesign.content, {units});
    dispatch(importContentReady({content, idMap}));
}

export const partialUpdate = units => (dispatch, getState) => {
    units = JSON.parse(JSON.stringify(units));
    const state = Config.get(getState(), unitStateName);
    let data = Design.loadPartial.convertUnits(units);
    let ids = data.map(d => d.id);
    let dels = [];
    state.data.forEach(d => {
        if(!ids.includes(d.id))
            dels.push(d.id);
    });
    dels.forEach(id => {
        const updated = Config.get(getState(), unitStateName);
        updated.data.forEach((d, i) => {
            if(d.id == id)
                dispatch(removeItem(i, d.id));
        });
    });
    let payload = {data};
    dispatch({type: Action.PARTIAL_UPDATE, payload});
}

export const {
    restore,
    reset,
} = SortableActions;
