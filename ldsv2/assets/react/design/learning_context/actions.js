import validate from 'validate.js';
import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {initLearningContext, importContentReady} from 'react/app/design/actions';
import {Action, StateName as ContextStateName} from './types';
import {constraints} from './validator';

const appStateName = AppStateName.DESIGN_APP;
const contextStateName = ContextStateName.LEARNING_CONTEXT;

export const reset = () => ({type: Action.RESET});

export const restore = () => ({type: Action.RESTORE});

export const fieldChange = field => (dispatch, getState) => {
    Object.keys(field)
        .forEach(name => {
            switch(name) {
                case 'classSize': {
                    let c = {[name]: constraints[name]};
                    let error = validate({[name]: field[name]}, c);
                    if(error)
                        field[name] = null;
                    else
                        field[name] = Math.round(Number(field[name]));
                }
                break;

                case 'sessInDuration':
                case 'sessPpDuration': {
                    let c = {[name]: constraints[name]};
                    let error = validate({[name]: field[name]}, c);
                    if(error)
                        field[name] = null;
                    else
                        field[name] = Math.round(Number(field[name])*10)/10;
                }
                break;
            }
        });
        dispatch({type: Action.FIELD_CHANGE, payload: {field}});
};

export const initFieldChange = () => (dispatch, getState) => {
    const state = Config.get(getState(), contextStateName);
    dispatch(initLearningContext(state.data));
}

export const updateTotalTeachingStudyTime = (totalTeachingTime, totalSelfStudyTime) => (dispatch, getState) => {
    let teachingTime = totalTeachingTime;
    let selfStudyTime = totalSelfStudyTime;
    let payload = {teachingTime, selfStudyTime};
    dispatch({type: Action.UPDATE_TEACHING_STUDY_TIME, payload});
}

export const importContent = course => (dispatch, getState) => {
    const {importDesign} = Config.get(getState(), appStateName);
    let content = Object.assign({}, importDesign.content, {course});
    let idMap = importDesign.idMap;
    dispatch(importContentReady({content, idMap}));
}

export const partialUpdate = course => (dispatch, getState) => {
    const state = Config.get(getState(), contextStateName);
    let data = Object.assign({}, state.data, course);
    let payload = {data};
    dispatch({type: Action.PARTIAL_UPDATE, payload});
}
