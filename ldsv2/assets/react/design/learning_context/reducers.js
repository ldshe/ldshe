import {Action as AppAction} from 'react/app/design/types';
import {Action as ContextAction, LearningModes, CourseTypes, Prerequisites} from './types';

export const initContext = {
    isInitialized: false,
    isInitialFailed: false,
    data: {
        title: 'Untitled',
        subject: '',
        teacher: '',
        classSize: 1,
        sessionNum: 1,
        mode: LearningModes[0].value,
        type: CourseTypes[0].value,
        prerequisite: Prerequisites[0].value,
        purpose: '',
        semester: '',
        sessInDuration: null,
        sessPpDuration: null,
    },
    teachingTime: 0,
    selfStudyTime: 0,
};

const context = (state = initContext, action) => {
    switch (action.type) {
        case AppAction.LOAD_DESIGN_COMPLETE: {
            let data = action.payload.data.course;
            return Object.assign({}, state, {data});
        }

        case AppAction.LEARNING_CONTEXT_INIT_COMPLETE: {
            return Object.assign({}, state, {isInitialized: true});
        }

        case AppAction.LEARNING_CONTEXT_INIT_ERROR: {
            return Object.assign({}, state, {isInitialFailed: true});
        }

        case ContextAction.RESET: {
            let state = initContext;
            return Object.assign({}, state);
        }

        case ContextAction.RESTORE: {
            return state;
        }

        case ContextAction.FIELD_CHANGE: {
            let {field} = action.payload;
            if(field.hasOwnProperty('title') && !field.title) field.title = 'Untitled';
            const data = Object.assign({}, state.data, field);
            return Object.assign({}, state, {data});
        }

        case ContextAction.UPDATE_TEACHING_STUDY_TIME: {
            let {teachingTime, selfStudyTime} = action.payload;
            return Object.assign({}, state, {teachingTime, selfStudyTime});
        }

        case ContextAction.PARTIAL_UPDATE: {
            const {data} = action.payload;
            return Object.assign({}, state, {data});
        }

        default:
            return state;
    }
};

export {
    context as learningContext,
};
