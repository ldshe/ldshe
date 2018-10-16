import {Action} from '../types';

export const loadRecentDesignList = () => ({type: Action.LOAD_RECENT_DESIGN_LIST});

export const loadRecentDesignListComplete = data => ({type: Action.LOAD_RECENT_DESIGN_LIST_COMPLETE, payload: {data}});

export const loadRecentDesignListError = error => ({type: Action.LOAD_RECENT_DESIGN_LIST_ERROR, payload: {error}});

export const loadRecentSharedDesignList = () => ({type: Action.LOAD_RECENT_SHARED_DESIGN_LIST});

export const loadRecentSharedDesignListComplete = data => ({type: Action.LOAD_RECENT_SHARED_DESIGN_LIST_COMPLETE, payload: {data}});

export const loadRecentSharedDesignListError = error => ({type: Action.LOAD_RECENT_SHARED_DESIGN_LIST_ERROR, payload: {error}});
