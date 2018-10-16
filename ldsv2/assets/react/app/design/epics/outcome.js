import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import OutcomeService from 'react/services/outcome';
import {Action as OutcomeAction} from 'react/design/learning_outcome/types';
import {Action as AppAction, StateName} from '../types';
import {saveDesignContentReady, saveOutcomeComplete, saveDesignContentError} from '../actions';
import {getDataLayer, getHelper} from './autosave';

const service = new OutcomeService;

export const getSaveContent = () => {
    let helper = getHelper();
    if(helper.get('dirty.outcome'))
        return helper.get('outcome');
    else
        return undefined;
}

const setSaveContentDirty = () => {
    let dataLayer = getDataLayer();
    dataLayer.push({dirty: {outcome: true}});
}

const updateSaveContent = data => {
    let dataLayer = getDataLayer();
    dataLayer.push({outcome: undefined});
    dataLayer.push({outcome: data});
    setSaveContentDirty();
}

const saveObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.update(courseId, mutexId, timestamp, data))
        .map(response => saveOutcomeComplete())
        .catch(error => {
            setSaveContentDirty();
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? saveObs(courseId, designMutex, timestamp, data) : Promise.resolve(saveOutcomeComplete());
}

export const saveOutcomeEpic = action$ =>
    action$.ofType(
        OutcomeAction.ADD_ITEM,
        OutcomeAction.UPDATE_ITEM_FIELD,
        OutcomeAction.MOVE_ITEM,
        OutcomeAction.REMOVE_ITEM)
        .mergeMap(({payload}) => {
            updateSaveContent(payload.data);
            return Observable.of(saveDesignContentReady());
        });
