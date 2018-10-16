import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import PatternService from 'react/services/pattern';
import {InstanceAction} from 'react/design/learning_unit/design_panel/types';
import {Action as AppAction, StateName} from '../types';
import {saveDesignContentReady, saveInstanceSettingsComplete, saveDesignContentError} from '../actions';
import {getDataLayer, getHelper} from './autosave';

const service = new PatternService;

export const getSaveContent = () => {
    let helper = getHelper();
    let oriPatt = helper.get('instanceSettings');
    let dirty = helper.get('dirty.instanceSettings');
    let notEmpty = false;
    let rtnPatt = {};
    Object.keys(oriPatt).forEach(k => {
        if(oriPatt[k]) {
            Object.keys(oriPatt[k]).forEach(l => {
                if(dirty[k] && dirty[k][l]) {
                    notEmpty = true;
                    rtnPatt[l] = oriPatt[k][l];
                }
            });
        }
    });
    return notEmpty ? rtnPatt : undefined;
}

const setSaveContentDirty = data => {
    let helper = getHelper();
    let dataLayer = getDataLayer();
    let patt = helper.get('instanceSettings');
    Object.keys(data).forEach(k => {
        Object.keys(data[k]).forEach(l => {
            if(patt[k] && patt[k][l]) {
                dataLayer.push({
                    dirty: {instanceSettings: {
                        [k]: {
                            [l]: true
                        }
                    }}
                });
            }
        });
    });
}

const updateSaveContent = data => {
    let dataLayer = getDataLayer();
    dataLayer.push({instanceSettings: data});
    setSaveContentDirty(data);
}

export const clearSaveContent = ids => {
    let dataLayer = getDataLayer();
    ids.forEach(id => {
        dataLayer.push({instanceSettings: {[id]: undefined}});
        dataLayer.push({dirty: {instanceSettings: {[id]: undefined}}});
    });
}

const saveObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.updateInstanceSettings(courseId, mutexId, timestamp, data))
        .map(response => saveInstanceSettingsComplete())
        .catch(error => {
            setSaveContentDirty(data);
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? saveObs(courseId, designMutex, timestamp, data) : Promise.resolve(saveInstanceSettingsComplete());
}

export const saveInstanceSettingsEpic = action$ =>
    action$.ofType(InstanceAction.APPLY_SETTINGS)
        .mergeMap(({payload}) => {
            const {obsUnitId, obsNode} = payload;
            let data = {[obsUnitId]: {[obsNode.model.id]: obsNode}};
            updateSaveContent(data);
            return Observable.of(saveDesignContentReady());
        });
