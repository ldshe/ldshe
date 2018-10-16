import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import PatternService from 'react/services/pattern';
import {PatternAction} from 'react/design/learning_unit/design_panel/types';
import {Action as AppAction, StateName} from '../types';
import {saveDesignContentReady, savePatternComplete, deletePatternComplete, saveDesignContentError} from '../actions';
import {getDataLayer, getHelper} from './autosave';

const service = new PatternService;

export const getSaveContent = () => {
    let helper = getHelper();
    let oriPatt = helper.get('pattern');
    let dirty = helper.get('dirty.pattern');
    let notEmpty = false;
    let rtnPatt = {};
    Object.keys(oriPatt)
        .forEach(k => {
            if(dirty[k]) {
                notEmpty = true;
                rtnPatt[k] = oriPatt[k];
            }
        });
    return notEmpty ? rtnPatt : undefined;
}

const setSaveContentDirty = data => {
    let helper = getHelper();
    let dataLayer = getDataLayer();
    let patt = helper.get('pattern');
    Object.keys(data)
        .forEach(k => {
            if(patt[k]) {
                dataLayer.push({dirty: {pattern: {[k]: true}}});
            }
        });
}

const updateSaveContent = data => {
    let dataLayer = getDataLayer();
    dataLayer.push({pattern: data});
    setSaveContentDirty(data);
}

const clearSaveContent = ids => {
    let dataLayer = getDataLayer();
    ids.forEach(id => {
        dataLayer.push({pattern: {[id]: undefined}});
        dataLayer.push({dirty: {pattern: {[id]: undefined}}});
    });
}

const saveObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.updatePatterns(courseId, mutexId, timestamp, data))
        .map(response => savePatternComplete())
        .catch(error => {
            setSaveContentDirty(data);
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? saveObs(courseId, designMutex, timestamp, data) : Promise.resolve(savePatternComplete());
}

export const savePatternEpic = action$ =>
    action$.ofType(PatternAction.APPLY_PATTERN)
        .mergeMap(({payload}) => {
            const {obsPattId, obsRoot} = payload;
            let data = {[obsPattId]: obsRoot};
            updateSaveContent(data);
            return Observable.of(saveDesignContentReady());
        });

export const getDeletedContent = () => {
    let helper = getHelper();
    let oriIds = helper.get('patternDeleted');
    let dirty = helper.get('dirty.patternDeleted');
    let rtnIds = [];
    oriIds.forEach(id => {
        if(dirty[id]) {
            rtnIds.push(id);
        }
    });
    return rtnIds.length > 0 ? rtnIds : undefined;
}

const setDeletedContentDirty = ids => {
    let dataLayer = getDataLayer();
    ids.forEach(id => dataLayer.push({dirty: {patternDeleted: {[id]: true}}}));
}

const updateDeletedContent = id => {
    let dataLayer = getDataLayer();
    dataLayer.push(['patternDeleted.push', id]);
    setDeletedContentDirty([id]);
    clearSaveContent([id]);
}

const delObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.deletePatterns(courseId, mutexId, timestamp, data))
        .map(response => deletePatternComplete())
        .catch(error => {
            setDeletedContentDirty(data);
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const del = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? delObs(courseId, designMutex, timestamp, data) : Promise.resolve(deletePatternComplete());
}

export const deletePatternEpic = action$ =>
    action$.ofType(PatternAction.APPLY_DELETE_USER_PATTERN)
        .mergeMap(({payload}) => {
            const {obsPattId} = payload;
            updateDeletedContent(obsPattId);
            return Observable.of(saveDesignContentReady());
        });
