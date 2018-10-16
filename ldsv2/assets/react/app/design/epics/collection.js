import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import CollectionService from 'react/services/collection';
import {ListType as PatternListType, ContributionRequest} from 'react/design/pattern_list/types';
import {ShareMode} from 'react/design/settings/types';
import {loadData as loadPatternListData} from 'react/design/pattern_list/actions';
import {Action as PatternAction} from 'react/design/pattern/types';
import {importContent as importPatternContent} from 'react/design/pattern/actions';
import {importPattern} from 'react/design/learning_unit/import_panel/actions/import';
import {Action, StateName} from '../types';
import {saveCollectionContentReady, saveCollectionComplete, saveCollectionContentError,
    loadPatternCollectionList, loadPatternCollectionListComplete, loadPatternCollectionListError,
    newPatternCollectionComplete, newPatternCollectionError,
    loadReadablePatternCollection, loadImportablePatternCollection, loadPatternCollectionComplete, loadPatternCollectionError,
    newPatternCollection, newCuratedPatternCollection, importCuratedPatternCollection,
    copyPatternCollectionComplete, importPatternCollectionComplete, importPatternCollectionError,
    loadingPatternCollectionPreview, loadPatternCollectionPreviewComplete, loadPatternCollectionPreviewError,
    importingPattern, importPatternComplete, importPatternError,
    exportPatternComplete, exportPatternError,
    removePatternCollectionComplete, removePatternCollectionError,
    loadPatternCollectionConfig, loadPatternCollectionConfigComplete, loadPatternCollectionConfigError,
    configurePatternCollectionComplete, configurePatternCollectionError,
    contributePatternCollectionComplete, contributePatternCollectionError,
    reviewPatternCollectionError} from '../actions';
import {getDataLayer, getHelper} from './autosave';
import {clearSaveContent as clearSettingsSaveContent} from './collection_settings';

const stateName = StateName.DESIGN_APP;

let collectionService = new CollectionService;

export const getSaveContent = () => {
    let helper = getHelper();
    let oriPatt = helper.get('collection');
    let dirty = helper.get('dirty.collection');
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
    let patt = helper.get('collection');
    Object.keys(data)
        .forEach(k => {
            if(patt[k]) {
                dataLayer.push({dirty: {collection: {[k]: true}}});
            }
        });
}

const updateSaveContent = data => {
    let dataLayer = getDataLayer();
    dataLayer.push({collection: data});
    setSaveContentDirty(data);
}

const clearSaveContent = ids => {
    let dataLayer = getDataLayer();
    ids.forEach(id => {
        dataLayer.push({collection: {[id]: undefined}});
        dataLayer.push({dirty: {collection: {[id]: undefined}}});
    });
}

const saveObs = (collectId, patternMutex, timestamp, data) =>
    Observable.fromPromise(collectionService.update(collectId, patternMutex, timestamp, data))
        .map(response => saveCollectionComplete())
        .catch(error => {
            setSaveContentDirty(data);
            console.error(error);
            return Observable.of(saveCollectionContentError(error));
        });

export const save = (store, data) => {
    const appState = Config.get(store.getState(), StateName.DESIGN_APP);
    const {collectId, patternMutex, timestamp2} = appState;
    return data ? saveObs(collectId, patternMutex, timestamp2, data) : Promise.resolve(saveCollectionComplete());
}

export const savePatternEpic = action$ =>
    action$.ofType(PatternAction.APPLY_PATTERN)
        .mergeMap(({payload}) => {
            const {obsPattId, obsRoot} = payload;
            let data = {[obsPattId]: obsRoot};
            updateSaveContent(data);
            clearSettingsSaveContent([obsPattId]);
            return Observable.of(saveCollectionContentReady());
        });

const getMyPatternList = (store, payload) =>
    Observable.fromPromise(collectionService.getAllPatternsByOwner())
        .map(data => {
            store.dispatch(loadPatternListData(data.collections));
            return loadPatternCollectionListComplete(data.collections);
        }).catch(error => {
            console.error(error);
            const {altErrHandler} = payload;
            let errHandler = altErrHandler ? altErrHandler : loadPatternCollectionListError;
            return Observable.of(errHandler(error));
        });

const getCuratorPatternList = (store, payload) =>
    Observable.fromPromise(collectionService.getAllPatternsByCurator())
        .map(data => {
            store.dispatch(loadPatternListData(data.collections));
            return loadPatternCollectionListComplete(data.collections);
        }).catch(error => {
            console.error(error);
            const {altErrHandler} = payload;
            let errHandler = altErrHandler ? altErrHandler : loadPatternCollectionListError;
            return Observable.of(errHandler(error));
        });

const getSharedPatternList = (store, mode, payload) =>
    Observable.fromPromise(collectionService.getAllPatternByShared(mode))
        .map(data => {
            store.dispatch(loadPatternListData(data.collections));
            return loadPatternCollectionListComplete(data.collections);
        }).catch(error => {
            console.error(error);
            const {altErrHandler} = payload;
            let errHandler = altErrHandler ? altErrHandler : loadPatternCollectionListError;
            return Observable.of(errHandler(error));
        });

const getSharedGroupPatternList = (store, groupId, payload) =>
    Observable.fromPromise(collectionService.getAllPatternBySharedGroup(groupId))
        .map(data => {
            store.dispatch(loadPatternListData(data.collections));
            return loadPatternCollectionListComplete(data.collections);
        }).catch(error => {
            console.error(error);
            const {altErrHandler} = payload;
            let errHandler = altErrHandler ? altErrHandler : loadPatternCollectionListError;
            return Observable.of(errHandler(error));
        });

const getContributedPatternList = (store, status, payload) =>
    Observable.fromPromise(collectionService.getAllPatternsByContributed(status))
        .map(data => {
            store.dispatch(loadPatternListData(data.collections));
            return loadPatternCollectionListComplete(data.collections);
        }).catch(error => {
            console.error(error);
            const {altErrHandler} = payload;
            let errHandler = altErrHandler ? altErrHandler : loadPatternCollectionListError;
            return Observable.of(errHandler(error));
        });

export const loadPatternCollectionListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_PATTERN_COLLECTION_LIST, Action.LOAD_PATTERN_COLLECTION_LIST_POPUP)
        .mergeMap(({type, payload}) => {
            if(payload.listType == PatternListType.MY)
                return getMyPatternList(store, payload);
            else if(payload.listType == PatternListType.CURATOR)
                return getCuratorPatternList(store, payload);
            else if(payload.listType == PatternListType.PENDING_REQUESTS)
                return getContributedPatternList(store, ContributionRequest.PENDING, payload);
            else {//PatternListType.OTHERS
                switch(payload.listType) {
                    case PatternListType.PUBLIC:
                        return getSharedPatternList(store, ShareMode.ALL, payload);
                    case PatternListType.GROUP: {
                        let state = Config.get(store.getState(), stateName);
                        return getSharedGroupPatternList(store, state.groupId, payload);
                    }
                    default:
                        return getSharedPatternList(store, [ShareMode.GROUP, ShareMode.USER], payload);
                }
                return
            }
        });

export const newPatternCollectionEpic = action$ =>
    action$.ofType(Action.NEW_PATTERN_COLLECTION, Action.NEW_CURATED_PATTERN_COLLECTION)
        .mergeMap(({type, payload}) =>
             Observable.fromPromise(type == Action.NEW_PATTERN_COLLECTION ? collectionService.create() : collectionService.createCurated())
                .map(data => newPatternCollectionComplete(data))
                .catch(error => {
                    console.error(error);
                    const {altErrHandler} = payload;
                    let errHandler = altErrHandler ? altErrHandler : newPatternCollectionError;
                    return Observable.of(errHandler(error));
                })
        );

export const loadPatternCollectionEpic = action$ =>
    action$.ofType(Action.LOAD_PATTERN_COLLECTION)
        .mergeMap(({payload}) => {
            const {reqTimestamp, collectId, readOnly, importable} = payload;
            let service = importable ?
                collectionService.getImportablePattern(collectId, readOnly) :
                collectionService.getPattern(collectId, readOnly);
            return Observable.fromPromise(service)
                .map(data => loadPatternCollectionComplete(data, {reqTimestamp}))
                .catch(error => {
                    console.error(error);
                    const {altErrHandler} = payload;
                    let errHandler = altErrHandler ? altErrHandler : loadPatternCollectionError;
                    return Observable.of(errHandler(error));
                });
        });

const srcPatternLoaded = action$ =>
    action$.ofType(Action.LOAD_PATTERN_COLLECTION_COMPLETE)
        .take(1)
        .takeUntil(action$.ofType(Action.IMPORT_PATTERN_COLLECTION_ERROR, Action.GENERAL_HTTP_ERROR));

const destPatternCreated = action$ =>
    action$.ofType(Action.NEW_PATTERN_COLLECTION_COMPLETE)
        .take(1)
        .takeUntil(action$.ofType(Action.IMPORT_PATTERN_COLLECTION_ERROR, Action.GENERAL_HTTP_ERROR));

const saveDestPattern = (type, fromId, collectId, data) => {
    let promise = (type == Action.COPY_PATTERN_COLLECTION) ?
        collectionService.importPattern(collectId, data) :
        collectionService.importPattern(collectId, data, fromId);
    return Observable.fromPromise(promise)
        .mergeMap(() => {
            if(type == Action.COPY_PATTERN_COLLECTION) {
                return [loadPatternCollectionList(PatternListType.MY), copyPatternCollectionComplete()];
            } else if (type == Action.COPY_CURATED_PATTERN_COLLECTION) {
                return [loadPatternCollectionList(PatternListType.CURATOR), copyPatternCollectionComplete()];
            } else { //Action.IMPORT_PATTERN_COLLECTION
                return [importPatternCollectionComplete()];
            }
        }).catch(error => {
            console.error(error);
            return Observable.of(importPatternCollectionError(error));
        });
}

export const importPatternCollectionEpic = (action$, store) =>
    action$.ofType(Action.COPY_PATTERN_COLLECTION, Action.IMPORT_PATTERN_COLLECTION, Action.COPY_CURATED_PATTERN_COLLECTION, Action.IMPORT_CURATED_PATTERN_COLLECTION)
        .mergeMap(({type, payload}) => {
            let fromId;
            let load = Observable.defer(() => {
                if(type == Action.IMPORT_PATTERN_COLLECTION)
                    store.dispatch(loadImportablePatternCollection(payload.collectId, true, {altErrHandler: importPatternCollectionError}));
                else //Action.COPY_PATTERN_COLLECTION, Action.COPY_CURATED_PATTERN_COLLECTION, Action.IMPORT_CURATED_PATTERN_COLLECTION
                    store.dispatch(loadReadablePatternCollection(payload.collectId, true, {altErrHandler: importPatternCollectionError}));
                return srcPatternLoaded(action$);
            });
            let create = Observable.defer(() => {
                if(type == Action.COPY_CURATED_PATTERN_COLLECTION || type == Action.IMPORT_CURATED_PATTERN_COLLECTION)
                    store.dispatch(newCuratedPatternCollection(importPatternCollectionError));
                else
                    store.dispatch(newPatternCollection(importPatternCollectionError));
                return destPatternCreated(action$);
            });
            return Observable.concat(load, create)
                .map(data => Observable.of(data))
                .takeUntil(action$.ofType(Action.IMPORT_PATTERN_COLLECTION_ERROR, Action.GENERAL_HTTP_ERROR))
                .combineAll()
                .takeWhile(combined => combined.length == 2)
                .map(combined => {
                    let srcData = combined[0].payload.data;
                    fromId = combined[0].payload.collectId;
                    store.dispatch(importPatternContent(srcData.pattern));
                    let state = Config.get(store.getState(), stateName);
                    let collectId = state.collectId;
                    let data = state.importCollection.content;
                    return {collectId, data};
                })
                .mergeMap(({collectId, data}) => saveDestPattern(type, fromId, collectId, data));
        });

const removePatternCollection = (type, collectId) =>
    Observable.fromPromise(collectionService.deletePattern(collectId))
        .mergeMap(() => {
            if(type == Action.REMOVE_PATTERN_COLLECTION) {
                return [loadPatternCollectionList(PatternListType.MY), removePatternCollectionComplete()];
            } else { //Action.REMOVE_CURATED_PATTERN_COLLECTION
                return [loadPatternCollectionList(PatternListType.CURATOR), removePatternCollectionComplete()];
            }
        })
        .catch(error => {
            console.error(error);
            return Observable.of(removePatternCollectionError(error));
        });

export const removePatternCollectionEpic = action$ =>
    action$.ofType(Action.REMOVE_PATTERN_COLLECTION, Action.REMOVE_CURATED_PATTERN_COLLECTION)
        .mergeMap(({type, payload}) => removePatternCollection(type, payload.collectId));

export const loadPatternCollectionPreviewEpic = (action$, store) =>
    action$.ofType(Action.LOAD_PATTERN_COLLECTION_PREVIEW)
        .mergeMap(({payload}) => {
            let reqTimestamp = Date.now();
            store.dispatch(loadingPatternCollectionPreview());
            store.dispatch(loadReadablePatternCollection(payload.collectId, true, {
                altErrHandler: loadPatternCollectionPreviewError,
                reqTimestamp,
            }));
            return action$.ofType(Action.LOAD_PATTERN_COLLECTION_COMPLETE)
                .filter(({payload}) => payload.reqTimestamp == reqTimestamp)
                .takeUntil(action$.ofType(Action.LOAD_PATTERN_COLLECTION_PREVIEW_ERROR, Action.GENERAL_HTTP_ERROR))
                .map(({payload}) => loadPatternCollectionPreviewComplete(payload.collectId, payload.data.pattern));
        });

export const importPatternEpic = (action$, store) => {
    return action$.ofType(Action.IMPORT_PATTERN)
        .mergeMap(({payload}) => {
            let reqTimestamp = Date.now();
            store.dispatch(importingPattern());
            store.dispatch(loadImportablePatternCollection(payload.collectId, true, {
                altErrHandler: importPatternError,
                reqTimestamp,
            }));
            return action$.ofType(Action.LOAD_PATTERN_COLLECTION_COMPLETE)
                .filter(({payload}) => payload.reqTimestamp == reqTimestamp)
                .takeUntil(action$.ofType(Action.IMPORT_PATTERN_ERROR, Action.GENERAL_HTTP_ERROR))
                .map(({payload}) => {
                    store.dispatch(importPattern(payload.data.pattern));
                    return importPatternComplete();
                });
        });
}

export const exportPatternEpic = (action$, store) =>
    action$.ofType(Action.EXPORT_PATTERN)
        .mergeMap(({payload}) => {
            let p = payload.patt;
            let data = {[p.id]: p.patt};
            return Observable.fromPromise(collectionService.create(data))
                .map(() => exportPatternComplete())
                .catch(error => {
                    console.error(error);
                    return Observable.of(exportPatternError(error));
                });
        });

const getPatternConfig = collectId =>
    Observable.fromPromise(collectionService.getConfig(collectId))
        .map(data => loadPatternCollectionConfigComplete(data))
        .catch(error => {
            console.error(error);
            return Observable.of(loadPatternCollectionConfigError(error));
        });

export const getPatternConfigEpic = action$ =>
    action$.ofType(Action.LOAD_PATTERN_COLLECTION_CONFIG)
        .mergeMap(({payload}) => getPatternConfig(payload.collectId));

const configurePatternCollection = (collectId, data) =>
    Observable.fromPromise(collectionService.configure(collectId, data))
        .mergeMap(() => [loadPatternCollectionConfig(collectId), configurePatternCollectionComplete()])
        .catch(error => {
            console.error(error);
            return Observable.of(configurePatternCollectionError(error));
        });

export const configurePatternCollectionEpic = action$ =>
    action$.ofType(Action.CONFIGURE_PATTERN_COLLECTION)
        .mergeMap(({payload}) => configurePatternCollection(payload.collectId, payload.data));

const contributePatternCollection = collectId =>
    Observable.fromPromise(collectionService.makeContribution(collectId))
        .mergeMap(() => [loadPatternCollectionConfig(collectId), contributePatternCollectionComplete()])
        .catch(error => {
            console.error(error);
            return Observable.of(contributePatternCollectionError(error));
        });

export const contributePatternCollectionEpic = action$ =>
    action$.ofType(Action.CONTRIBUTE_PATTERN_COLLECTION)
        .mergeMap(({payload}) => contributePatternCollection(payload.collectId));

const reviewPatternCollection = (collectId, status) =>
    Observable.fromPromise(collectionService.reviewContribution(collectId, status))
        .mergeMap(() => {
            if(status == ContributionRequest.APPROVED)
                return [loadPatternCollectionList(PatternListType.PENDING_REQUESTS), importCuratedPatternCollection(collectId)];
            else
                return [loadPatternCollectionList(PatternListType.PENDING_REQUESTS)];
        })
        .catch(error => {
            console.error(error);
            return Observable.of(reviewPatternCollectionError(error));
        });

export const reviewPatternCollectionEpic = action$ =>
    action$.ofType(Action.REVIEW_PATTERN_COLLECTION)
        .mergeMap(({payload}) => reviewPatternCollection(payload.collectId, payload.status));
