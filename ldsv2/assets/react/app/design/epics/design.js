import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import CourseService from 'react/services/course';
import DesignService from 'react/services/design';
import {ListType as DesignListType, ContributionRequest} from 'react/design/design_list/types';
import {ShareMode} from 'react/design/settings/types';
import {loadData as loadDesignListData} from 'react/design/design_list/actions';
import {importContent as importCourseContent} from 'react/design/learning_context/actions';
import {importContent as importOutcomeContent} from 'react/design/learning_outcome/actions';
import {importContent as importUnitContent} from 'react/design/learning_unit/pedagogical_sequence/actions';
import {importContent as importPatternContent} from 'react/design/learning_unit/design_panel/actions/pattern';
import {importContent as importInstanceContent} from 'react/design/learning_unit/design_panel/actions/unit';
import {importContent as importSessionContent} from 'react/design/learning_session/allocation_panel/actions';
import {Action, StateName} from '../types';
import {loadDesignList, loadDesignListComplete, loadDesignListError,
        newDesign, newDesignComplete, newDesignError,
        loadReadableDesign, loadImportableDesign, loadDesignComplete, loadDesignError,
        copyDesignComplete, importDesignComplete, importDesignError,
        removeDesignComplete, removeDesignError,
        loadDesignConfig, loadDesignConfigComplete, loadDesignConfigError,
        configureDesignComplete, configureDesignError,
        contributeDesignComplete, contributeDesignError,
        reviewDesignError, importCuratedDesign, newCuratedDesign} from '../actions';

const stateName = StateName.DESIGN_APP;
let courseService = new CourseService;
let designService = new DesignService;

const getMyDesignList = store =>
    Observable.fromPromise(designService.getAllByOwner())
        .map(data => {
            store.dispatch(loadDesignListData(data.designs));
            return loadDesignListComplete();
        }).catch(error => {
            console.error(error);
            return Observable.of(loadDesignListError(error));
        });

const getCuratorDesignList = store =>
    Observable.fromPromise(designService.getAllByCurator())
        .map(data => {
            store.dispatch(loadDesignListData(data.designs));
            return loadDesignListComplete();
        }).catch(error => {
            console.error(error);
            return Observable.of(loadDesignListError(error));
        });

const getSharedDesignList = (store, mode) =>
    Observable.fromPromise(designService.getAllByShared(mode))
        .map(data => {
            store.dispatch(loadDesignListData(data.designs));
            return loadDesignListComplete();
        }).catch(error => {
            console.error(error);
            return Observable.of(loadDesignListError(error));
        });

const getSharedGroupDesignList = (store, groupId) =>
    Observable.fromPromise(designService.getAllBySharedGroup(groupId))
        .map(data => {
            store.dispatch(loadDesignListData(data.designs));
            return loadDesignListComplete();
        }).catch(error => {
            console.error(error);
            return Observable.of(loadDesignListError(error));
        });

const getContributedDesignList = (store, status) =>
    Observable.fromPromise(designService.getAllByContributed(status))
        .map(data => {
            store.dispatch(loadDesignListData(data.designs));
            return loadDesignListComplete();
        }).catch(error => {
            console.error(error);
            return Observable.of(loadDesignListError(error));
        });

export const loadDesignListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_DESIGN_LIST)
        .mergeMap(({payload}) => {
            if(payload.listType == DesignListType.MY)
                return getMyDesignList(store);
            else if(payload.listType == DesignListType.CURATOR)
                return getCuratorDesignList(store);
            else if(payload.listType == DesignListType.PENDING_REQUESTS)
                return getContributedDesignList(store, ContributionRequest.PENDING);
            else {//DesignListType.OTHERS
                switch(payload.listType) {
                    case DesignListType.PUBLIC:
                        return getSharedDesignList(store, ShareMode.ALL);
                    case DesignListType.GROUP: {
                        let state = Config.get(store.getState(), stateName);
                        return getSharedGroupDesignList(store, state.groupId);
                    }
                    default:
                        return getSharedDesignList(store, [ShareMode.GROUP, ShareMode.USER]);
                }
            }
        });

export const newDesignEpic = action$ =>
    action$.ofType(Action.NEW_DESIGN, Action.NEW_CURATED_DESIGN)
        .mergeMap(({type, payload}) =>
            Observable.fromPromise(type == Action.NEW_DESIGN ? courseService.create() : courseService.createCurated())
                .map(data => newDesignComplete(data))
                .catch(error => {
                    console.error(error);
                    const {altErrHandler} = payload;
                    let errHandler = altErrHandler ? altErrHandler : newDesignError;
                    return Observable.of(errHandler(error));
                })
        );

export const loadDesignEpic = action$ =>
    action$.ofType(Action.LOAD_DESIGN)
        .mergeMap(({payload}) => {
            const {courseId, readOnly, importable} = payload;
            let service = importable ?
                designService.getImportableDesign(courseId, readOnly) :
                designService.getDesign(courseId, readOnly);
            return Observable.fromPromise(service)
                .map(data => loadDesignComplete(data))
                .catch(error => {
                    console.error(error);
                    const {altErrHandler} = payload;
                    let errHandler = altErrHandler ? altErrHandler : loadDesignError;
                    return Observable.of(errHandler(error));
                });
        });

const srcDesignLoaded = action$ =>
    action$.ofType(Action.LOAD_DESIGN_COMPLETE)
        .take(1)
        .takeUntil(action$.ofType(Action.IMPORT_DESIGN_ERROR, Action.GENERAL_HTTP_ERROR));

const destDesignCreated = action$ =>
    action$.ofType(Action.NEW_DESIGN_COMPLETE)
        .take(1)
        .takeUntil(action$.ofType(Action.IMPORT_DESIGN_ERROR, Action.GENERAL_HTTP_ERROR));

const saveDestDesign = (type, fromId, courseId, data) => {
    let promise = (type == Action.COPY_DESIGN) ?
        designService.importDesign(courseId, data) :
        designService.importDesign(courseId, data, fromId);
    return Observable.fromPromise(promise)
        .mergeMap(() => {
            if(type == Action.COPY_DESIGN) {
                return [loadDesignList(DesignListType.MY), copyDesignComplete()];
            } else if (type == Action.COPY_CURATED_DESIGN) {
                return [loadDesignList(DesignListType.CURATOR), copyDesignComplete()];
            } else { //Action.IMPORT_DESIGN
                return [importDesignComplete()];
            }
        }).catch(error => {
            console.error(error);
            return Observable.of(importDesignError(error));
        });
}

export const importDesignEpic = (action$, store) =>
    action$.ofType(Action.COPY_DESIGN, Action.IMPORT_DESIGN, Action.COPY_CURATED_DESIGN, Action.IMPORT_CURATED_DESIGN)
        .mergeMap(({type, payload}) => {
            let fromId;
            let load = Observable.defer(() => {
                if(type == Action.IMPORT_DESIGN)
                    store.dispatch(loadImportableDesign(payload.courseId, true, importDesignError));
                else //Action.COPY_DESIGN, Action.COPY_CURATED_DESIGN, Action.IMPORT_CURATED_DESIGN
                    store.dispatch(loadReadableDesign(payload.courseId, true, importDesignError));
                return srcDesignLoaded(action$);
            });
            let create = Observable.defer(() => {
                if(type == Action.COPY_CURATED_DESIGN || type == Action.IMPORT_CURATED_DESIGN)
                    store.dispatch(newCuratedDesign(importDesignError));
                else
                    store.dispatch(newDesign(importDesignError));
                return destDesignCreated(action$);
            });
            return Observable.concat(load, create)
                .map(data => Observable.of(data))
                .takeUntil(action$.ofType(Action.IMPORT_DESIGN_ERROR, Action.GENERAL_HTTP_ERROR))
                .combineAll()
                .takeWhile(combined => combined.length == 2)
                .map(combined => {
                    let srcData = combined[0].payload.data;
                    fromId = combined[0].payload.courseId;
                    store.dispatch(importCourseContent(srcData.course));
                    store.dispatch(importOutcomeContent(srcData.outcomes));
                    store.dispatch(importUnitContent(srcData.units));
                    store.dispatch(importPatternContent(srcData.patterns));
                    store.dispatch(importInstanceContent(srcData.instances));
                    store.dispatch(importSessionContent(srcData.sessions));
                    let state = Config.get(store.getState(), stateName);
                    let courseId = state.courseId;
                    let data = state.importDesign.content;
                    return {courseId, data};
                })
                .mergeMap(({courseId, data}) => saveDestDesign(type, fromId, courseId, data));
        });

const removeDesign = (type, courseId) =>
    Observable.fromPromise(courseService.deleteCourse(courseId))
        .mergeMap(() => {
            if(type == Action.REMOVE_DESIGN) {
                return [loadDesignList(DesignListType.MY), removeDesignComplete()];
            } else { //Action.REMOVE_CURATED_DESIGN
                return [loadDesignList(DesignListType.CURATOR), removeDesignComplete()];
            }
        })
        .catch(error => {
            console.error(error);
            return Observable.of(removeDesignError(error));
        });

export const removeDesignEpic = action$ =>
    action$.ofType(Action.REMOVE_DESIGN, Action.REMOVE_CURATED_DESIGN)
        .mergeMap(({type, payload}) => removeDesign(type, payload.courseId));

const getDesignConfig = courseId =>
    Observable.fromPromise(courseService.getConfig(courseId))
        .map(data => loadDesignConfigComplete(data))
        .catch(error => {
            console.error(error);
            return Observable.of(loadDesignConfigError(error));
        });

export const getDesignConfigEpic = action$ =>
    action$.ofType(Action.LOAD_DESIGN_CONFIG)
        .mergeMap(({payload}) => getDesignConfig(payload.courseId));

const configureDesign = (courseId, data) =>
    Observable.fromPromise(courseService.configure(courseId, data))
        .mergeMap(() => [loadDesignConfig(courseId), configureDesignComplete()])
        .catch(error => {
            console.error(error);
            return Observable.of(configureDesignError(error));
        });

export const configureDesignEpic = action$ =>
    action$.ofType(Action.CONFIGURE_DESIGN)
        .mergeMap(({payload}) => configureDesign(payload.courseId, payload.data));

const contributeDesign = courseId =>
    Observable.fromPromise(courseService.makeContribution(courseId))
        .mergeMap(() => [loadDesignConfig(courseId), contributeDesignComplete()])
        .catch(error => {
            console.error(error);
            return Observable.of(contributeDesignError(error));
        });

export const contributeDesignEpic = action$ =>
    action$.ofType(Action.CONTRIBUTE_DESIGN)
        .mergeMap(({payload}) => contributeDesign(payload.courseId));


const reviewDesign = (courseId, status) =>
    Observable.fromPromise(courseService.reviewContribution(courseId, status))
        .mergeMap(() => {
            if(status == ContributionRequest.APPROVED)
                return [loadDesignList(DesignListType.PENDING_REQUESTS), importCuratedDesign(courseId)];
            else
                return [loadDesignList(DesignListType.PENDING_REQUESTS)];
        })
        .catch(error => {
            console.error(error);
            return Observable.of(reviewDesignError(error));
        });

export const reviewDesignEpic = action$ =>
    action$.ofType(Action.REVIEW_DESIGN)
        .mergeMap(({payload}) => reviewDesign(payload.courseId, payload.status));
