import {combineEpics} from 'redux-observable';
import {loadRecentDesignListEpic, loadRecentSharedDesignListEpic} from './design';
import {loadRecentPatternCollectionListEpic, loadRecentSharedPatternCollectionListEpic} from './collection';
import {loadRecentGroupListEpic} from './group';

export const epics = combineEpics(
    loadRecentDesignListEpic,
    loadRecentSharedDesignListEpic,
    loadRecentPatternCollectionListEpic,
    loadRecentSharedPatternCollectionListEpic,
    loadRecentGroupListEpic,
);
