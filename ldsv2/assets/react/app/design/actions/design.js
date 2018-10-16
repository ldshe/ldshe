import {reset as wizardReset} from 'react/design/design_wizard/actions';
import {reset as unitStepReset} from 'react/design/unit_step/actions';
import {reset as sessionStepReset} from 'react/design/session_step/actions';
import {reset as contextReset} from 'react/design/learning_context/actions';
import {reset as outcomeReset} from 'react/design/learning_outcome/actions';
import {reset as pedagogicalSequenceReset} from 'react/design/learning_unit/pedagogical_sequence/actions';
import {reset as patternReset} from 'react/design/learning_unit/design_panel/actions/pattern';
import {reset as patternInstanceReset} from 'react/design/learning_unit/design_panel/actions/unit';
// import {reset as patternImportReset} from 'react/design/learning_unit/import_panel/actions/import';
import {reset as patternExportReset} from 'react/design/learning_unit/import_panel/actions/export';
import {reset as patternModalReset} from 'react/design/learning_unit/import_panel/actions/modal';
import {reset as sessionReset} from 'react/design/learning_session/allocation_panel/actions';
import {resetDesignAutosave} from '../epics/autosave';
import {Action} from '../types';
import {generalHttpError} from './http';

const resetDesign = () => (dispatch, getState) => {
    resetDesignAutosave();
    dispatch(wizardReset());
    dispatch(unitStepReset());
    dispatch(sessionStepReset());
    dispatch(contextReset());
    dispatch(outcomeReset());
    dispatch(pedagogicalSequenceReset());
    dispatch(patternReset());
    dispatch(patternInstanceReset());
    // dispatch(patternImportReset());
    dispatch(patternExportReset());
    dispatch(patternModalReset());
    dispatch(sessionReset());
};

export const loadDesignList = listType => ({type: Action.LOAD_DESIGN_LIST, payload: {listType}});

export const loadDesignListComplete = () => ({type: Action.LOAD_DESIGN_LIST_COMPLETE});

export const loadDesignListError = error => ({type: Action.LOAD_DESIGN_LIST_ERROR, payload: {error}});

export const newDesign = altErrHandler => (dispatch, getState) => {
    dispatch(resetDesign());
    let payload = {altErrHandler};
    dispatch({type: Action.NEW_DESIGN, payload});
};

export const newCuratedDesign = altErrHandler => (dispatch, getState) => {
    dispatch(resetDesign());
    let payload = {altErrHandler};
    dispatch({type: Action.NEW_CURATED_DESIGN, payload});
};

export const newDesignComplete = design => {
    const {courseId, timestamp, user} = design;
    let payload = {
        courseId,
        timestamp,
        user,
    }
    return {type: Action.NEW_DESIGN_COMPLETE, payload}
};

export const newDesignError = error => ({type: Action.NEW_DESIGN_ERROR, payload: {error}});

export const loadReadableDesign = (courseId, readOnly=false, altErrHandler) => (dispatch, getState) => {
    dispatch(resetDesign());
    let payload = {courseId, readOnly, altErrHandler};
    dispatch({type: Action.LOAD_DESIGN, payload});
};

export const loadImportableDesign = (courseId, readOnly=false, altErrHandler) => (dispatch, getState) => {
    dispatch(resetDesign());
    let payload = {courseId, readOnly, altErrHandler, importable: true};
    dispatch({type: Action.LOAD_DESIGN, payload});
};

export const loadDesignComplete = design => {
    let payload = Object.assign({}, design);
    return {type: Action.LOAD_DESIGN_COMPLETE, payload}
};

export const loadDesignError = error => ({type: Action.LOAD_DESIGN_ERROR, payload: {error}});

export const copyDesign = courseId => (dispatch, getState) => {
    dispatch({type: Action.COPY_DESIGN, payload: {courseId}});

    let data = {message: 'Copying Design...'}
    dispatch({type: Action.COPYING_DESIGN, payload: {data}});
};

export const copyCuratedDesign = courseId => (dispatch, getState) => {
    dispatch({type: Action.COPY_CURATED_DESIGN, payload: {courseId}});

    let data = {message: 'Copying Design...'}
    dispatch({type: Action.COPYING_DESIGN, payload: {data}});
};

export const copyDesignComplete = () => {
    let data = {message: 'Design copied.'}
    return {type: Action.COPY_DESIGN_COMPLETE, payload: {data}};
};

export const importDesign = courseId => (dispatch, getState) => {
    dispatch({type: Action.IMPORT_DESIGN, payload: {courseId}});

    let data = {message: 'Saving Design...'}
    dispatch({type: Action.IMPORTING_DESIGN, payload: {data}});
};

export const importCuratedDesign = courseId => (dispatch, getState) => {
    dispatch({type: Action.IMPORT_CURATED_DESIGN, payload: {courseId}});

    let data = {message: 'Saving Design...'}
    dispatch({type: Action.IMPORTING_DESIGN, payload: {data}});
};

export const importContentReady = importDesign => ({type: Action.IMPORT_CONTENT_READY, payload: importDesign});

export const importDesignComplete = () => {
    let data = {message: 'Design saved.'}
    return {type: Action.IMPORT_DESIGN_COMPLETE, payload: {data}};
};

export const importDesignError = error => {
    error.message = 'Save design failed.';
    if(error.response) {
        let {status} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.IMPORT_DESIGN_ERROR, payload: {error}};
};

export const removeDesign = courseId => {
    let payload = {courseId};
    return {type: Action.REMOVE_DESIGN, payload};
};

export const removeCuratedDesign = courseId => {
    let payload = {courseId};
    return {type: Action.REMOVE_CURATED_DESIGN, payload};
};

export const removeDesignComplete = () => {
    let data = {message: 'Design deleted.'}
    return {type: Action.REMOVE_DESIGN_COMPLETE, payload: {data}};
};

export const removeDesignError = error => {
    error.message = 'Delete design failed.';
    if(error.response) {
        let {status} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.REMOVE_DESIGN_ERROR, payload: {error}};
};

export const loadDesignConfig = courseId => {
    let payload = {courseId};
    return {type: Action.LOAD_DESIGN_CONFIG, payload};
};

export const loadDesignConfigComplete = config => ({type: Action.LOAD_DESIGN_CONFIG_COMPLETE, payload: {config}});

export const loadDesignConfigError = error => ({type: Action.LOAD_DESIGN_CONFIG_ERROR, payload: {error}});

export const configureDesign = (courseId, data) => {
    let payload = {courseId, data};
    return {type: Action.CONFIGURE_DESIGN, payload};
};

export const configureDesignComplete = () => {
    let data = {message: 'Settings applied.'}
    return {type: Action.CONFIGURE_DESIGN_COMPLETE, payload: {data}};
};

export const configureDesignError = error => {
    error.message = 'Apply settings failed.';
    if(error.response) {
        let {status, data} = error.response;
        if(status == 401) return generalHttpError(error);
        if(status == 404 && data.message.match(/^No query results for model/gi)) return generalHttpError(error);
        if(status == 404) error.message = data.message;
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.CONFIGURE_DESIGN_ERROR, payload: {error}};
};

export const contributeDesign = courseId => {
    let payload = {courseId};
    return {type: Action.CONTRIBUTE_DESIGN, payload};
};

export const contributeDesignComplete = () => {
    let data = {message: 'Request sent.'}
    return {type: Action.CONTRIBUTE_DESIGN_COMPLETE, payload: {data}};
};

export const contributeDesignError = error => {
    error.message = 'Send request failed.';
    if(error.response) {
        let {status, data} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.CONTRIBUTE_DESIGN_ERROR, payload: {error}};
};

export const reviewDesign = (courseId, status) => {
    let payload = {courseId, status};
    return {type: Action.REVIEW_DESIGN, payload};
};

export const reviewDesignError = error => {
    error.message = 'Set status failed.';
    if(error.response) {
        let {status, data} = error.response;
        if(status == 401) return generalHttpError(error);
        if(status == 404 && data.message.match(/^No query results for model/gi)) return generalHttpError(error);
        if(status == 404) error.message = data.message;
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.REVIEW_DESIGN_ERROR, payload: {error}};
};

export const importPattern = collectId => {
    let payload = {collectId};
    return {type: Action.IMPORT_PATTERN, payload};
};

export const importingPattern = () => {
    let data = {message: 'Saving pattern...'}
    return {type: Action.IMPORTING_PATTERN, payload: {data}};
};

export const importPatternComplete = () => {
    let data = {message: 'Pattern saved.'}
    return {type: Action.IMPORT_PATTERN_COMPLETE, payload: {data}};
};

export const importPatternError = error => {
    error.message = 'Save pattern failed.';
    if(error.response) {
        let {status} = error.response;
        if(status == 401) return generalHttpError(error);
        if(status == 403) error.message = 'You need permission to perform this action.';
        if(status == 404) error.message = 'Requested resources not found.';
    }
    return {type: Action.IMPORT_PATTERN_ERROR, payload: {error}};
};

export const exportPattern = patt => (dispatch, getState) => {
    let payload = {patt};
    dispatch({type: Action.EXPORT_PATTERN, payload});

    let data = {message: 'Saving pattern...'}
    dispatch({type: Action.EXPORTING_PATTERN, payload: {data}});
};

export const exportPatternComplete = () => {
    let data = {message: 'Pattern saved.'}
    return {type: Action.EXPORT_PATTERN_COMPLETE, payload: {data}};
};

export const exportPatternError = error => {
    error.message = 'Save pattern failed.';
    if(error.response) {
        let {status} = error.response;
        if(status == 401) return generalHttpError(error);
        if(status == 403) error.message = 'You need permission to perform this action.';
        if(status == 404) error.message = 'Requested resources not found.';
    }
    return {type: Action.EXPORT_PATTERN_ERROR, payload: {error}};
};

export const initLearningContext = data => ({type: Action.LEARNING_CONTEXT_INIT, payload: {data}});

export const initLearningContextComplete = () => ({type: Action.LEARNING_CONTEXT_INIT_COMPLETE});

export const initLearningContextError = error => ({type: Action.LEARNING_CONTEXT_INIT_ERROR, payload: {error}});

export const saveDesignContentReady = () => ({type: Action.SAVE_DESIGN_CONTENT_READY});

export const saveDesignContentError = error => ({type: Action.SAVE_DESIGN_CONTENT_ERROR, payload: {error}});

export const saveCourseComplete = () => ({type: Action.SAVE_COURSE_COMPLETE});

export const saveOutcomeComplete = () => ({type: Action.SAVE_OUTCOME_COMPLETE});

export const saveUnitComplete = () => ({type: Action.SAVE_UNIT_COMPLETE});

export const calcTeachingStudyTimeComplete = () => ({type: Action.CALC_TEACHING_STUDY_TIME_COMPLETE});

export const savePatternComplete = () => ({type: Action.SAVE_PATTERN_COMPLETE});

export const deletePatternComplete = () => ({type: Action.DELETE_PATTERN_COMPLETE});

export const saveInstanceComplete = () => ({type: Action.SAVE_INSTANCE_COMPLETE});

export const saveInstanceSettingsComplete = () => ({type: Action.SAVE_INSTANCE_SETTINGS_COMPLETE});

export const saveSessionComplete = () => ({type: Action.SAVE_SESSION_COMPLETE});

export const deleteSessionComplete = () => ({type: Action.DELETE_SESSION_COMPLETE});

export const changeEditTab = editTab => ({type: Action.CHANGE_EDIT_TAB, payload: {editTab}});

export const setLastDesignRead = () => ({type: Action.SET_LAST_DESIGN_READ});

export const designContentUpdated = content => ({type: Action.DESIGN_CONTENT_UPDATED, payload: {content}});
