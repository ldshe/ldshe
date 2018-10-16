import 'data-layer-helper/dist/data-layer-helper';
import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import appConfig from '../config';
import {Action, StateName} from '../types';
import {isSaving, saveProcessComplete} from '../actions';
import {save as saveCourse, getSaveContent as getCourseContent} from './course';
import {save as saveOutcome, getSaveContent as getOutcomeContent} from './outcome';
import {save as saveUnit, getSaveContent as getUnitContent} from './unit';
import {save as savePattern, del as deletePattern, getSaveContent as getPatternContent, getDeletedContent as getDeletedPatternContent} from './pattern';
import {save as saveInstance, getSaveContent as getInstanceContent} from './instance';
import {save as saveInstanceSettings, getSaveContent as getInstanceSettingsContent} from './instance_settings';
import {save as saveSession, del as deleteSession, getSaveContent as getSessionContent, getDeletedContent as getDeletedSessionContent} from './session';
import {save as saveCollection, getSaveContent as getCollectionContent} from './collection';
import {save as saveCollectionSettings, getSaveContent as getCollectionSettingsContent} from './collection_settings';

const dataLayer = [];
const helper = new DataLayerHelper(dataLayer);

const resetDesignSaveContent = () => {
    dataLayer.push({course: undefined});
    dataLayer.push({outcome: undefined});
    dataLayer.push({unit: undefined});
    dataLayer.push({pattern: undefined});
    dataLayer.push({patternDeleted: undefined});
    dataLayer.push({instance: undefined});
    dataLayer.push({instanceSettings: undefined});
    dataLayer.push({session: undefined});
    dataLayer.push({sessionDeleted: undefined});

    dataLayer.push({course: {}});
    dataLayer.push({outcome: {}});
    dataLayer.push({unit: {}});
    dataLayer.push({pattern: {}});
    dataLayer.push({patternDeleted: []});
    dataLayer.push({instance: {}});
    dataLayer.push({instanceSettings: {}});
    dataLayer.push({session: {}});
    dataLayer.push({sessionDeleted: []});
};
resetDesignSaveContent();

const resetDesignDirtyBit = () => {
    dataLayer.push({
        dirty: {
            course: undefined,
            outcome: undefined,
            unit: undefined,
            pattern: undefined,
            patternDeleted: undefined,
            instance: undefined,
            instanceSettings: undefined,
            session: undefined,
            sessionDeleted: undefined,
        }
    });
    dataLayer.push({
        dirty: {
            course: false,
            outcome: false,
            unit: false,
            pattern: {},
            patternDeleted: {},
            instance: {},
            instanceSettings: {},
            session: {},
            sessionDeleted: {},
        }
    });
};
resetDesignDirtyBit();

export const resetDesignAutosave = () => {
    resetDesignSaveContent();
    resetDesignDirtyBit();
}

const resetCollectionSaveContent = () => {
    dataLayer.push({collection: undefined});
    dataLayer.push({collectionSettings: undefined});

    dataLayer.push({collection: {}});
    dataLayer.push({collectionSettings: {}});
};
resetCollectionSaveContent();

const resetCollectionDirtyBit = () => {
    dataLayer.push({
        dirty: {
            collection: undefined,
            collectionSettings: undefined,
        }
    });
    dataLayer.push({
        dirty: {
            collection: {},
            collectionSettings: {},
        }
    });
};
resetCollectionDirtyBit();

export const resetCollectionAutosave = () => {
    resetCollectionSaveContent();
    resetCollectionDirtyBit();
}

export const getDataLayer = () => dataLayer;

export const getHelper = () => helper;

const saveCourseObs = (store, data) => Observable.defer(() => saveCourse(store, data));
const saveOutcomeObs = (store, data) => Observable.defer(() => saveOutcome(store, data));
const saveUnitObs = (store, data) => Observable.defer(() => saveUnit(store, data));
const deletePatternObs = (store, data) => Observable.defer(() => deletePattern(store, data));
const savePatternObs = (store, data) => Observable.defer(() => savePattern(store, data));
const saveInstanceObs = (store, data) => Observable.defer(() => saveInstance(store, data));
const saveInstanceSettingsObs = (store, data) => Observable.defer(() => saveInstanceSettings(store, data));
const saveSessionObs = (store, data) => Observable.defer(() => saveSession(store, data));
const deleteSessionObs = (store, data) => Observable.defer(() => deleteSession(store, data));
const saveCollectionObs = (store, data) => Observable.defer(() => saveCollection(store, data));
const saveCollectionSettingsObs = (store, data) => Observable.defer(() => saveCollectionSettings(store, data));
const saveCompleteObs = Observable.defer(() => Observable.of(saveProcessComplete()));

export const autosaveEpic = (action$, store) =>
    action$.ofType(Action.SAVE_DESIGN_CONTENT_READY)
        .debounceTime(appConfig.autosaveDebounce)
        .filter(() => {
            const state = Config.get(store.getState(), StateName.DESIGN_APP);
            return !state.readDesignOnly;
        })
        .mergeMap(() => {
            let courseContent = getCourseContent();
            let outcomeContent = getOutcomeContent();
            let unitContent = getUnitContent();
            let deletedPatternContent = getDeletedPatternContent();
            let patternContent = getPatternContent();
            let instanceContent = getInstanceContent();
            let instanceSettingsContent = getInstanceSettingsContent();
            let deletedSessionContent = getDeletedSessionContent();
            let sessionContent = getSessionContent();
            resetDesignDirtyBit();
            return Observable.concat(
                saveCourseObs(store, courseContent),
                saveOutcomeObs(store, outcomeContent),
                saveUnitObs(store, unitContent),
                deletePatternObs(store, deletedPatternContent),
                savePatternObs(store, patternContent),
                saveInstanceObs(store, instanceContent),
                saveInstanceSettingsObs(store, instanceSettingsContent),
                deleteSessionObs(store, deletedSessionContent),
                saveSessionObs(store, sessionContent),
                saveCompleteObs)
                .takeUntil(action$.ofType(Action.SAVE_DESIGN_CONTENT_ERROR))
                .catch(error => {
                    console.error(error);
                    return Observable.of({type: Action.SAVE_PROCESS_ERROR, payload: {error}});
                })
                .startWith(isSaving());
        });

export const autosaveEpic2 = (action$, store) =>
    action$.ofType(Action.SAVE_COLLECTION_CONTENT_READY)
        .debounceTime(appConfig.autosaveDebounce)
        .filter(() => {
            const state = Config.get(store.getState(), StateName.DESIGN_APP);
            return !state.readPatternOnly;
        })
        .mergeMap(() => {
            let collectionContent = getCollectionContent();
            let collectionSettingsContent = getCollectionSettingsContent();
            resetCollectionDirtyBit();
            return Observable.concat(
                saveCollectionObs(store, collectionContent),
                saveCollectionSettingsObs(store, collectionSettingsContent),
                saveCompleteObs)
                .takeUntil(action$.ofType(Action.SAVE_COLLECTION_CONTENT_ERROR))
                .catch(error => {
                    console.error(error);
                    return Observable.of({type: Action.SAVE_PROCESS_ERROR, payload: {error}});
                })
                .startWith(isSaving());
        });
