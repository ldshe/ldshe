import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import PatternService from 'react/services/pattern';
import {InstanceAction} from 'react/design/learning_unit/design_panel/types';
import {Action as AppAction, StateName} from '../types';
import {saveDesignContentReady, saveInstanceComplete, saveDesignContentError} from '../actions';
import {getDataLayer, getHelper} from './autosave';
import {clearSaveContent as clearSettingsSaveContent} from './instance_settings';

const service = new PatternService;

export const getSaveContent = () => {
    let helper = getHelper();
    let oriPatt = helper.get('instance');
    let dirty = helper.get('dirty.instance');
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
    let patt = helper.get('instance');
    Object.keys(data)
        .forEach(k => {
            if(patt[k]) {
                dataLayer.push({dirty: {instance: {[k]: true}}});
            }
        });
}

const updateSaveContent = data => {
    let dataLayer = getDataLayer();
    dataLayer.push({instance: data});
    setSaveContentDirty(data);
}

const clearSaveContent = ids => {
    let dataLayer = getDataLayer();
    ids.forEach(id => {
        dataLayer.push({instance: {[id]: undefined}});
        dataLayer.push({dirty: {instance: {[id]: undefined}}});
    });
}

const saveObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.updateInstances(courseId, mutexId, timestamp, data))
        .map(response => saveInstanceComplete())
        .catch(error => {
            setSaveContentDirty(data);
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? saveObs(courseId, designMutex, timestamp, data) : Promise.resolve(saveInstanceComplete());
}

export const saveInstanceEpic = action$ =>
    action$.ofType(InstanceAction.APPLY_PATTERN)
        .mergeMap(({payload}) => {
            const {obsUnitId, obsRoot} = payload;
            let data = {[obsUnitId]: obsRoot};
            updateSaveContent(data);
            clearSettingsSaveContent([obsUnitId]);
            return Observable.of(saveDesignContentReady());
        });

export const deleteInstanceEpic = action$ =>
    action$.ofType(InstanceAction.APPLY_DELETE_USER_PATTERN)
        .mergeMap(({payload}) => {
            const {obsUnitId} = payload;
            clearSaveContent([obsUnitId]);
            clearSettingsSaveContent([obsUnitId]);
            return Observable.of(saveDesignContentReady());
        });
