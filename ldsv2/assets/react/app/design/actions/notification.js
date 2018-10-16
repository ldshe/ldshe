import {Action} from '../types';

export const loadNotificationList = () => ({type: Action.LOAD_NOTIFICATION_LIST});

export const loadNotificationListComplete = data => ({type: Action.LOAD_NOTIFICATION_LIST_COMPLETE, payload: {data}});

export const loadNotificationListError = error => ({type: Action.LOAD_NOTIFICATION_LIST_ERROR, payload: {error}});

export const dismissNotification = id => ({type: Action.DISMISS_NOTIFICATION, payload: {id}});

export const dismissNotificationComplete = () => ({type: Action.DISMISS_NOTIFICATION_COMPLETE});

export const dismissNotificationError = error => ({type: Action.DISMISS_NOTIFICATION_ERROR, payload: {error}});
