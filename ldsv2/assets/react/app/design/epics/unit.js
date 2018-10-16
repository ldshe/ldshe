import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import UnitService from 'react/services/unit';
import {Action as UnitAction} from 'react/design/learning_unit/pedagogical_sequence/types';
import {calcTeachingStudyTime} from 'react/design/learning_unit/design_panel/actions/unit';
import {Action as AppAction, StateName} from '../types';
import {saveDesignContentReady, saveUnitComplete, saveDesignContentError, calcTeachingStudyTimeComplete} from '../actions';
import {getDataLayer, getHelper} from './autosave';

const service = new UnitService;

export const getSaveContent = () => {
    let helper = getHelper();
    if(helper.get('dirty.unit'))
        return helper.get('unit');
    else
        return undefined;
}

const setSaveContentDirty = () => {
    let dataLayer = getDataLayer();
    dataLayer.push({dirty: {unit: true}});
}

const updateSaveContent = data => {
    let dataLayer = getDataLayer();
    dataLayer.push({unit: undefined});
    dataLayer.push({unit: data});
    setSaveContentDirty();
}

const saveObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.update(courseId, mutexId, timestamp, data))
        .map(response => saveUnitComplete())
        .catch(error => {
            setSaveContentDirty();
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? saveObs(courseId, designMutex, timestamp, data) : Promise.resolve(saveUnitComplete());
}

export const saveUnitEpic = action$ =>
    action$.ofType(
        UnitAction.ADD_ITEM,
        UnitAction.UPDATE_ITEM_FIELD,
        UnitAction.MOVE_ITEM,
        UnitAction.REMOVE_ITEM,
        UnitAction.REMOVE_OUTCOME)
        .mergeMap(({payload}) => {
            updateSaveContent(payload.data);
            return Observable.of(saveDesignContentReady());
        });

export const calcTeachingStudyTimeEpic = (action$, store) =>
    action$.ofType(AppAction.LOAD_DESIGN_COMPLETE)
        .mergeMap(() => {
            store.dispatch(calcTeachingStudyTime());
            return Observable.of(calcTeachingStudyTimeComplete());
        });
