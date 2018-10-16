import {Action} from '../types';

export const loadRecentPatternCollectionList = () => ({type: Action.LOAD_RECENT_PATTERN_COLLECTION_LIST});

export const loadRecentPatternCollectionListComplete = data => ({type: Action.LOAD_RECENT_PATTERN_COLLECTION_LIST_COMPLETE, payload: {data}});

export const loadRecentPatternCollectionListError = error => ({type: Action.LOAD_RECENT_PATTERN_COLLECTION_LIST_ERROR, payload: {error}});

export const loadRecentSharedPatternCollectionList = () => ({type: Action.LOAD_RECENT_SHARED_PATTERN_COLLECTION_LIST});

export const loadRecentSharedPatternCollectionListComplete = data => ({type: Action.LOAD_RECENT_SHARED_PATTERN_COLLECTION_LIST_COMPLETE, payload: {data}});

export const loadRecentSharedPatternCollectionListError = error => ({type: Action.LOAD_RECENT_SHARED_PATTERN_COLLECTION_LIST_ERROR, payload: {error}});
