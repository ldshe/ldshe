import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import CollectionService from 'react/services/collection';
import {Action as PatternAction} from 'react/design/pattern/types';
import {Action as AppAction, StateName} from '../types';
import {saveCollectionContentReady, saveCollectionSettingsComplete, saveCollectionContentError} from '../actions';
import {getDataLayer, getHelper} from './autosave';

const service = new CollectionService;

export const getSaveContent = () => {
    let helper = getHelper();
    let oriPatt = helper.get('collectionSettings');
    let dirty = helper.get('dirty.collectionSettings');
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
    let patt = helper.get('collectionSettings');
    Object.keys(data).forEach(k => {
        Object.keys(data[k]).forEach(l => {
            if(patt[k] && patt[k][l]) {
                dataLayer.push({
                    dirty: {collectionSettings: {
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
    dataLayer.push({collectionSettings: data});
    setSaveContentDirty(data);
}

export const clearSaveContent = ids => {
    let dataLayer = getDataLayer();
    ids.forEach(id => {
        dataLayer.push({collectionSettings: {[id]: undefined}});
        dataLayer.push({dirty: {collectionSettings: {[id]: undefined}}});
    });
}

const saveObs = (collectId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.updateSettings(collectId, mutexId, timestamp, data))
        .map(response => saveCollectionSettingsComplete())
        .catch(error => {
            setSaveContentDirty(data);
            console.error(error);
            return Observable.of(saveCollectionContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {collectId, patternMutex, timestamp2} = appState;
    return data ? saveObs(collectId, patternMutex, timestamp2, data) : Promise.resolve(saveCollectionSettingsComplete());
}

export const saveSettingsEpic = action$ =>
    action$.ofType(PatternAction.APPLY_SETTINGS)
        .mergeMap(({payload}) => {
            const {obsPattId, obsNode} = payload;
            let data = {[obsPattId]: {[obsNode.model.id]: obsNode}};
            updateSaveContent(data);
            return Observable.of(saveCollectionContentReady());
        });
