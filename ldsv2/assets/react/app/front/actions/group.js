import {Action} from '../types';

export const loadRecentGroupList = () => ({type: Action.LOAD_RECENT_GROUP_LIST});

export const loadRecentGroupListComplete = data => ({type: Action.LOAD_RECENT_GROUP_LIST_COMPLETE, payload: {data}});

export const loadRecentGroupListError = error => ({type: Action.LOAD_RECENT_GROUP_LIST_ERROR, payload: {error}});
