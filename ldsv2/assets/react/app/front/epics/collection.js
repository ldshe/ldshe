import {Observable} from 'rxjs/Rx';
import CollectionService from 'react/services/collection';
import {Action} from '../types';
import {loadRecentPatternCollectionListComplete, loadRecentPatternCollectionListError,
    loadRecentSharedPatternCollectionListComplete, loadRecentSharedPatternCollectionListError} from '../actions';

let collectionService = new CollectionService;

export const loadRecentPatternCollectionListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_RECENT_PATTERN_COLLECTION_LIST)
        .mergeMap(() =>
            Observable.fromPromise(collectionService.getRecentlyPatternsByOwner())
                .map(data => loadRecentPatternCollectionListComplete(data.collections))
                .catch(error => {
                    console.error(error);
                    return Observable.of(loadRecentPatternCollectionListError(error));
                })
        );

export const loadRecentSharedPatternCollectionListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_RECENT_SHARED_PATTERN_COLLECTION_LIST)
        .mergeMap(() =>
            Observable.fromPromise(collectionService.getRecentlyPatternsByShared())
                .map(data => loadRecentSharedPatternCollectionListComplete(data.collections))
                .catch(error => {
                    console.error(error);
                    return Observable.of(loadRecentSharedPatternCollectionListError(error));
                })
        );
