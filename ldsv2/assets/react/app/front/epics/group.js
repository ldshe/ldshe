import {Observable} from 'rxjs/Rx';
import GroupService from 'react/services/group';
import {Action} from '../types';
import {loadRecentGroupListComplete, loadRecentGroupListError} from '../actions';

let groupService = new GroupService;

export const loadRecentGroupListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_RECENT_GROUP_LIST)
        .mergeMap(() =>
            Observable.fromPromise(groupService.getRecentlyByMember())
                .map(data => loadRecentGroupListComplete(data.groups))
                .catch(error => {
                    console.error(error);
                    return Observable.of(loadRecentGroupListError(error));
                })
        );
