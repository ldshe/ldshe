import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import SessionService from 'react/services/session';
import {Action as SessionAction, StageType} from 'react/design/learning_session/allocation_panel/types';
import {Action as AppAction, StateName} from '../types';
import {saveDesignContentReady, saveSessionComplete, saveDesignContentError, deleteSessionComplete} from '../actions';
import {getDataLayer, getHelper} from './autosave';

const service = new SessionService;

export const getSaveContent = () => {
    let helper = getHelper();
    let oriSess = helper.get('session');
    let dirty = helper.get('dirty.session');
    let notEmpty = false;
    let rtnSess = {};
    Object.keys(oriSess)
        .forEach(k => {
            if(dirty[k]) {
                notEmpty = true;
                rtnSess[k] = oriSess[k];
            }
        });
    return notEmpty ? rtnSess : undefined;
}

const setSaveContentDirty = data => {
    let helper = getHelper();
    let dataLayer = getDataLayer();
    let sess = helper.get('session');
    Object.keys(data)
        .forEach(k => {
        if(sess[k]) {
            dataLayer.push({dirty: {session: {[k]: true}}});
        }
    });
}

const updateSaveContent = data => {
    let dataLayer = getDataLayer();
    data.forEach(d => {
        let id = d.id;
        delete d.id;
        let data = {[id]: d};
        dataLayer.push({session: {[id]: undefined}});
        dataLayer.push({session: data});
        setSaveContentDirty(data);
    });
}

const clearSaveContent = ids => {
    let dataLayer = getDataLayer();
    ids.forEach(id => {
        dataLayer.push({session: {[id]: undefined}});
        dataLayer.push({dirty: {session: {[id]: undefined}}});
    });
}

const saveObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.update(courseId, mutexId, timestamp, data))
        .map(response => saveSessionComplete())
        .catch(error => {
            setSaveContentDirty(data);
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? saveObs(courseId, designMutex, timestamp, data) : Promise.resolve(saveSessionComplete());
}

export const saveSessionEpic = action$ =>
    action$.ofType(
            SessionAction.ADD_SESSION,
            SessionAction.ADD_STAGE_ITEM,
            SessionAction.REORDER_STAGE_ITEM,
            SessionAction.REMOVE_STAGE_ITEM,
            SessionAction.REMOVE_ALL_STAGE_ITEM,
            SessionAction.CLEAR_STAGE_ITEM,
            SessionAction.FIELD_CHANGE,)
        .mergeMap(({payload}) => {
            let {data, obsSessIds} = payload;
            updateSaveContent(
                data.map((d, i) => {
                    if(obsSessIds.indexOf(d.id) != -1) {
                        let obj = Object.assign({}, d);
                        obj.pos = d.stage == StageType.POST ? 10000 : i;
                        return obj;
                    } else {
                        return null;
                    }
                }).filter(d => d)
            );
            return Observable.of(saveDesignContentReady());
        });

export const getDeletedContent = () => {
    let helper = getHelper();
    let oriIds = helper.get('sessionDeleted');
    let dirty = helper.get('dirty.sessionDeleted');
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
    ids.forEach(id => dataLayer.push({dirty: {sessionDeleted: {[id]: true}}}));
}

const updateDeletedContent = ids => {
    let dataLayer = getDataLayer();
    dataLayer.push(['sessionDeleted.push', ...ids]);
    setDeletedContentDirty(ids);
    clearSaveContent(ids);
}

const delObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.deleteSessions(courseId, mutexId, timestamp, data))
        .map(response => deleteSessionComplete())
        .catch(error => {
            setDeletedContentDirty(data);
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const del = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? delObs(courseId, designMutex, timestamp, data) : Promise.resolve(deleteSessionComplete());
}

export const deleteSessionEpic = action$ =>
    action$.ofType(SessionAction.REMOVE_SESSION)
        .mergeMap(({payload}) => {
            const {obsSessIds} = payload;
            updateDeletedContent(obsSessIds);
            return Observable.of(saveDesignContentReady());
        });
