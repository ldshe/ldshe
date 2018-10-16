import {reset as patternCollectionReset} from 'react/design/pattern/actions';
import {resetCollectionAutosave} from '../epics/autosave';
import {Action, EditPage} from '../types';
import {generalHttpError} from './http';

const resetPatternCollection = () => (dispatch, getState) => {
    resetCollectionAutosave();
    dispatch(patternCollectionReset());
};

export const loadPatternCollectionList = listType => ({type: Action.LOAD_PATTERN_COLLECTION_LIST, payload: {listType}});

export const loadPatternCollectionListComplete = collections => ({type: Action.LOAD_PATTERN_COLLECTION_LIST_COMPLETE, payload: {collections}});

export const loadPatternCollectionListError = error => {
    let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
    return {type: Action.LOAD_PATTERN_COLLECTION_LIST_ERROR, payload: {error, query}};
};

export const loadPatternCollectionListPopup = listType => {
    let payload = {altErrHandler: loadPatternCollectionListPopupError};
    return {type: Action.LOAD_PATTERN_COLLECTION_LIST_POPUP, payload: {listType}};
};

export const loadPatternCollectionListPopupError = error => {
    error.message = 'Load My Patterns failed.';
    if(error.response) {
        let {status} = error.response;
        if(status == 401) return generalHttpError(error);
        if(status == 403) error.message = 'You need permission to perform this action.';
        if(status == 404) error.message = 'Requested resources not found.';
    }
    return {type: Action.LOAD_PATTERN_COLLECTION_LIST_POPUP_ERROR, payload: {error}};
};

export const loadReadablePatternCollection = (collectId, readOnly=false, opt={}) => (dispatch, getState) => {
    dispatch(resetPatternCollection());
    let {altErrHandler, reqTimestamp} = opt;
    let payload = {collectId, readOnly, altErrHandler, reqTimestamp};
    dispatch({type: Action.LOAD_PATTERN_COLLECTION, payload});
};

export const loadImportablePatternCollection = (collectId, readOnly=false, opt={}) => (dispatch, getState) => {
    dispatch(resetPatternCollection());
    let {altErrHandler, reqTimestamp} = opt;
    let payload = {collectId, readOnly, altErrHandler, reqTimestamp, importable: true};
    dispatch({type: Action.LOAD_PATTERN_COLLECTION, payload});
};

export const loadPatternCollectionComplete = (pattern, opts) => {
    let {reqTimestamp} = opts;
    let payload = Object.assign({}, pattern, {reqTimestamp});
    return {type: Action.LOAD_PATTERN_COLLECTION_COMPLETE, payload};
};

export const loadPatternCollectionError = error => {
    let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
    return {type: Action.LOAD_PATTERN_COLLECTION_ERROR, payload: {error, query}};
};

export const newPatternCollection = altErrHandler => (dispatch, getState) => {
    dispatch(resetPatternCollection());
    let payload = {altErrHandler};
    dispatch({type: Action.NEW_PATTERN_COLLECTION, payload});
};

export const newCuratedPatternCollection = altErrHandler => (dispatch, getState) => {
    dispatch(resetPatternCollection());
    let payload = {altErrHandler};
    dispatch({type: Action.NEW_CURATED_PATTERN_COLLECTION, payload});
};

export const newPatternCollectionComplete = collection => {
    const {collectId, timestamp, user} = collection;
    let payload = {
        collectId,
        timestamp,
        user,
    }
    return {type: Action.NEW_PATTERN_COLLECTION_COMPLETE, payload}
};

export const newPatternCollectionError = error => {
    let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
    return {type: Action.NEW_PATTERN_COLLECTION_ERROR, payload: {error, query}};
};

export const copyPatternCollection = collectId => (dispatch, getState) => {
    dispatch({type: Action.COPY_PATTERN_COLLECTION, payload: {collectId}});

    let data = {message: 'Copying Pattern...'}
    dispatch({type: Action.COPYING_PATTERN_COLLECTION, payload: {data}});
};

export const copyCuratedPatternCollection = collectId => (dispatch, getState) => {
    dispatch({type: Action.COPY_CURATED_PATTERN_COLLECTION, payload: {collectId}});

    let data = {message: 'Copying Pattern...'}
    dispatch({type: Action.COPYING_PATTERN_COLLECTION, payload: {data}});
};

export const copyPatternCollectionComplete = () => {
    let data = {message: 'Pattern copied.'}
    return {type: Action.COPY_PATTERN_COLLECTION_COMPLETE, payload: {data}};
};

export const importPatternCollection = collectId => (dispatch, getState) => {
    dispatch({type: Action.IMPORT_PATTERN_COLLECTION, payload: {collectId}});

    let data = {message: 'Saving Pattern...'}
    dispatch({type: Action.IMPORTING_PATTERN_COLLECTION, payload: {data}});
};

export const importCuratedPatternCollection = collectId => (dispatch, getState) => {
    dispatch({type: Action.IMPORT_CURATED_PATTERN_COLLECTION, payload: {collectId}});

    let data = {message: 'Saving pattern...'}
    dispatch({type: Action.IMPORTING_PATTERN_COLLECTION, payload: {data}});
};

export const importCollectionContentReady = importCollection => ({type: Action.IMPORT_COLLECTION_CONTENT_READY, payload: importCollection});

export const importPatternCollectionComplete = () => {
    let data = {message: 'Pattern saved.'}
    return {type: Action.IMPORT_PATTERN_COLLECTION_COMPLETE, payload: {data}};
};

export const importPatternCollectionError = error => {
    error.message = 'Save pattern failed.';
    if(error.response) {
        let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
        let {status} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error, query);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.IMPORT_PATTERN_COLLECTION_ERROR, payload: {error}};
};

export const loadPatternCollectionPreview = collectId => {
    return {type: Action.LOAD_PATTERN_COLLECTION_PREVIEW, payload: {collectId}};
};

export const loadingPatternCollectionPreview = () => ({type: Action.LOADING_PATTERN_COLLECTION_PREVIEW});

export const loadPatternCollectionPreviewComplete = (collectId, pattern) => {
    return {type: Action.LOAD_PATTERN_COLLECTION_PREVIEW_COMPLETE, payload: {collectId, pattern}};
};

export const loadPatternCollectionPreviewError = error => {
    error.message = 'Load pattern preview failed.';
    if(error.response) {
        let {status} = error.response;
        if(status == 401) return generalHttpError(error);
        if(status == 403) error.message = 'You need permission to perform this action.';
        if(status == 404) error.message = 'Requested resources not found.';
    }
    return {type: Action.LOAD_PATTERN_COLLECTION_PREVIEW_ERROR, payload: {error}};
};

export const removePatternCollection = collectId => {
    let payload = {collectId};
    return {type: Action.REMOVE_PATTERN_COLLECTION, payload};
};

export const removeCuratedPatternCollection = collectId => {
    let payload = {collectId};
    return {type: Action.REMOVE_CURATED_PATTERN_COLLECTION, payload};
};

export const removePatternCollectionComplete = () => {
    let data = {message: 'Pattern deleted.'}
    return {type: Action.REMOVE_PATTERN_COLLECTION_COMPLETE, payload: {data}};
};

export const removePatternCollectionError = error => {
    error.message = 'Delete pattern failed.';
    if(error.response) {
        let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
        let {status} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error, query);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.REMOVE_PATTERN_COLLECTIOIN_ERROR, payload: {error}};
};

export const loadPatternCollectionConfig = collectId => {
    let payload = {collectId};
    return {type: Action.LOAD_PATTERN_COLLECTION_CONFIG, payload};
};

export const loadPatternCollectionConfigComplete = config => ({type: Action.LOAD_PATTERN_COLLECTION_CONFIG_COMPLETE, payload: {config}});

export const loadPatternCollectionConfigError = error => {
    let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
    return {type: Action.LOAD_PATTERN_COLLECTION_CONFIG_ERROR, payload: {error, query}};
};

export const configurePatternCollection = (collectId, data) => {
    let payload = {collectId, data};
    return {type: Action.CONFIGURE_PATTERN_COLLECTION, payload};
};

export const configurePatternCollectionComplete = () => {
    let data = {message: 'Settings applied.'}
    return {type: Action.CONFIGURE_PATTERN_COLLECTION_COMPLETE, payload: {data}};
};

export const configurePatternCollectionError = error => {
    error.message = 'Apply settings failed.';
    if(error.response) {
        let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
        let {status, data} = error.response;
        if(status == 401) return generalHttpError(error, query);
        if(status == 404 && data.message.match(/^No query results for model/gi)) return generalHttpError(error, query);
        if(status == 404) error.message = data.message;
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.CONFIGURE_PATTERN_COLLECTION_ERROR, payload: {error}};
};

export const contributePatternCollection = collectId => {
    let payload = {collectId};
    return {type: Action.CONTRIBUTE_PATTERN_COLLECTION, payload};
};

export const contributePatternCollectionComplete = () => {
    let data = {message: 'Request sent.'}
    return {type: Action.CONTRIBUTE_PATTERN_COLLECTION_COMPLETE, payload: {data}};
};

export const contributePatternCollectionError = error => {
    error.message = 'Send request failed.';
    if(error.response) {
        let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
        let {status, data} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error, query);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.CONTRIBUTE_PATTERN_COLLECTION_ERROR, payload: {error}};
};

export const reviewPatternCollection = (collectId, status) => {
    let payload = {collectId, status};
    return {type: Action.REVIEW_PATTERN_COLLECTION, payload};
};

export const reviewPatternCollectionError = error => {
    error.message = 'Set status failed.';
    if(error.response) {
        let {status, data} = error.response;
        if(status == 401) return generalHttpError(error);
        if(status == 404 && data.message.match(/^No query results for model/gi)) return generalHttpError(error);
        if(status == 404) error.message = data.message;
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.REVIEW_PATTERN_COLLECTION_ERROR, payload: {error}};
};

export const saveCollectionContentReady = () => ({type: Action.SAVE_COLLECTION_CONTENT_READY});

export const saveCollectionContentError = error => {
    let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
    return {type: Action.SAVE_COLLECTION_CONTENT_ERROR, payload: {error, query}};
};

export const saveCollectionComplete = () => ({type: Action.SAVE_COLLECTION_COMPLETE});

export const saveCollectionSettingsComplete = () => ({type: Action.SAVE_COLLECTION_SETTINGS_COMPLETE});

export const setLastCollectionRead = () => ({type: Action.SET_LAST_COLLECTION_READ});

export const collectionContentUpdated = content => ({type: Action.COLLECTION_CONTENT_UPDATED, payload: {content}});
