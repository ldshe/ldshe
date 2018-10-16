import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import CourseService from 'react/services/course';
import {Action as ContextAction} from 'react/design/learning_context/types';
import {Action as AppAction, StateName} from '../types';
import {initLearningContextComplete, initLearningContextError,
        saveDesignContentReady, saveCourseComplete, saveDesignContentError} from '../actions';
import {getDataLayer, getHelper} from './autosave';

const service = new CourseService;

const initContext = (data, store) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return Observable.fromPromise(service.update(courseId, designMutex, timestamp, data))
        .map(() => initLearningContextComplete())
        .catch(error => {
            console.error(error);
            return Observable.of(initLearningContextError(error));
        });
}

export const initContextEpic = (action$, store) =>
    action$.ofType(AppAction.LEARNING_CONTEXT_INIT)
        .mergeMap(({payload}) => initContext(payload.data, store));

export const getSaveContent = () => {
    let helper = getHelper();
    if(helper.get('dirty.course'))
        return helper.get('course');
    else
        return undefined;
}

const setSaveContentDirty = () => {
    let dataLayer = getDataLayer();
    dataLayer.push({dirty: {course: true}});
}

const updateSaveContent = field => {
    let dataLayer = getDataLayer();
    dataLayer.push({course: field});
    setSaveContentDirty();
}

const saveObs = (courseId, mutexId, timestamp, data) =>
    Observable.fromPromise(service.update(courseId, mutexId, timestamp, data))
        .map(response => saveCourseComplete())
        .catch(error => {
            setSaveContentDirty();
            console.error(error);
            return Observable.of(saveDesignContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {courseId, designMutex, timestamp} = appState;
    return data ? saveObs(courseId, designMutex, timestamp, data) : Promise.resolve(saveCourseComplete());
}

export const saveCourseEpic = action$ =>
    action$.ofType(ContextAction.FIELD_CHANGE)
        .mergeMap(({payload}) => {
            updateSaveContent(payload.field);
            return Observable.of(saveDesignContentReady());
        });
