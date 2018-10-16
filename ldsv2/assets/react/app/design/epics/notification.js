import {Observable} from 'rxjs/Rx';
import NotificatonService from 'react/services/notification';
import {Action, StateName} from '../types';
import {loadNotificationList, loadNotificationListComplete, loadNotificationListError,
    dismissNotificationComplete, dismissNotificationError} from '../actions';

const stateName = StateName.DESIGN_APP;
let notificationService = new NotificatonService;

export const loadNotificationListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_NOTIFICATION_LIST)
        .mergeMap(() =>
            Observable.fromPromise(notificationService.getAllByOwner())
                .map(data => loadNotificationListComplete(data.notifications))
                .catch(error => {
                    console.error(error);
                    return Observable.of(loadNotificationListError(error));
                })
        );

export const dimissNotificationEpic = (action$, store) =>
    action$.ofType(Action.DISMISS_NOTIFICATION)
        .mergeMap(({payload}) =>
            Observable.fromPromise(notificationService.dismiss(payload.id))
                .mergeMap(data => [loadNotificationList(), dismissNotificationComplete()])
                .catch(error => {
                    console.error(error);
                    return Observable.of(dismissNotificationError(error));
                })
        );
