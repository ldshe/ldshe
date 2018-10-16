import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import {Action, StateName} from '../types';
import MutexService from 'react/services/mutex';
import {lockDesignResourceComplete, lockDesignResourceError,
        lockCollectionResourceComplete, lockCollectionResourceError,
        keepDesignAliveComplete, keepDesignAliveError,
        keepCollectionAliveComplete, keepCollectionAliveError} from '../actions';

const service = new MutexService;

const lockDesign = courseId =>
    Observable.fromPromise(service.lockDesign(courseId))
        .map(data => lockDesignResourceComplete(data.mutexId, data.data))
        .catch(error => {
            console.error(error);
            return Observable.of(lockDesignResourceError(error));
        });

const lockPattern = collectId =>
    Observable.fromPromise(service.lockCollection(collectId))
        .map(data => lockCollectionResourceComplete(data.mutexId, data.data))
        .catch(error => {
            console.error(error);
            return Observable.of(lockCollectionResourceError(error));
        });

const takeoverDesign = courseId =>
    Observable.fromPromise(service.takeoverDesign(courseId))
        .map(data => lockDesignResourceComplete(data.mutexId, data.data))
        .catch(error => {
            console.error(error);
            return Observable.of(lockDesignResourceError(error));
        });

const takeoverPattern = collectId =>
    Observable.fromPromise(service.takeoverCollection(collectId))
        .map(data => lockCollectionResourceComplete(data.mutexId, data.data))
        .catch(error => {
            console.error(error);
            return Observable.of(lockCollectionResourceError(error));
        });

export const lockResourceEpic = action$ =>
    action$.ofType(
        Action.LOCK_DESIGN_RESOURCE,
        Action.LOCK_COLLECTION_RESOURCE,
        Action.TAKEOVER_DESIGN_RESOURCE,
        Action.TAKEOVER_COLLECTION_RESOURCE)
        .mergeMap(({type, payload}) => {
            switch(type) {
                case Action.LOCK_DESIGN_RESOURCE:
                    return lockDesign(payload.courseId);

                case Action.LOCK_COLLECTION_RESOURCE:
                    return lockPattern(payload.collectId);

                case Action.TAKEOVER_DESIGN_RESOURCE:
                    return takeoverDesign(payload.courseId);

                case Action.TAKEOVER_COLLECTION_RESOURCE:
                    return takeoverPattern(payload.collectId);
            }
        });

export const keepDesignAlive = (mutexId, data) =>
    Observable.fromPromise(service.keepAlive(mutexId, data))
        .map(data => keepDesignAliveComplete(data.data))
        .catch(error => {
            console.error(error);
            return Observable.of(keepDesignAliveError(error));
        });

export const keepCollectionAlive = (mutexId, data) =>
    Observable.fromPromise(service.keepAlive(mutexId, data))
        .map(data => keepCollectionAliveComplete(data.data))
        .catch(error => {
            console.error(error);
            return Observable.of(keepCollectionAliveError(error));
        });

export const keepResourceAliveEpic = action$ =>
    action$.ofType(Action.KEEP_DESIGN_ALIVE, Action.KEEP_COLLECTION_ALIVE)
        .mergeMap(({type, payload}) => {
            let mutexId = payload.mutexId;
            let data = Object.assign({}, payload);
            delete data.mutexId;
            if(type == Action.KEEP_DESIGN_ALIVE) {
                return keepDesignAlive(mutexId, data);
            } else {
                return keepCollectionAlive(mutexId, data);
            }
        });
