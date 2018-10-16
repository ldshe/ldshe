import {Observable} from 'rxjs/Rx';
import DesignService from 'react/services/design';
import {Action} from '../types';
import {loadRecentDesignListComplete, loadRecentDesignListError,
    loadRecentSharedDesignListComplete, loadRecentSharedDesignListError} from '../actions';

let designService = new DesignService;

export const loadRecentDesignListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_RECENT_DESIGN_LIST)
        .mergeMap(() =>
            Observable.fromPromise(designService.getRecentlyByOwner())
                .map(data => loadRecentDesignListComplete(data.designs))
                .catch(error => {
                    console.error(error);
                    return Observable.of(loadRecentDesignListError(error));
                })
        );

export const loadRecentSharedDesignListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_RECENT_SHARED_DESIGN_LIST)
        .mergeMap(() =>
            Observable.fromPromise(designService.getRecentlyByShared())
                .map(data => loadRecentSharedDesignListComplete(data.designs))
                .catch(error => {
                    console.error(error);
                    return Observable.of(loadRecentSharedDesignListError(error));
                })
        );
