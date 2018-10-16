import {Action, EditPage} from '../types';

export const lockDesignResource = courseId => ({type: Action.LOCK_DESIGN_RESOURCE, payload: {courseId}});

export const takeoverDesignResource = courseId => ({type: Action.TAKEOVER_DESIGN_RESOURCE, payload: {courseId}});

export const lockDesignResourceComplete = (mutexId, data) => ({type: Action.LOCK_DESIGN_RESOURCE_COMPLETE, payload: {mutexId, data}});

export const lockDesignResourceError = error => ({type: Action.LOCK_DESIGN_RESOURCE_ERROR, payload: {error}});

export const lockCollectionResource = collectId => ({type: Action.LOCK_COLLECTION_RESOURCE, payload: {collectId}});

export const takeoverCollectionResource = collectId => ({type: Action.TAKEOVER_COLLECTION_RESOURCE, payload: {collectId}});

export const lockCollectionResourceComplete = (mutexId, data) => ({type: Action.LOCK_COLLECTION_RESOURCE_COMPLETE, payload: {mutexId, data}});

export const lockCollectionResourceError = error => {
    let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
    return {type: Action.LOCK_COLLECTION_RESOURCE_ERROR, payload: {error, query}};
};

export const keepDesignAlive = (mutexId, courseId, resetLastActive=false) => ({type: Action.KEEP_DESIGN_ALIVE, payload: {mutexId, courseId, resetLastActive}});

export const keepDesignAliveComplete = data => ({type: Action.KEEP_DESIGN_ALIVE_COMPLETE, payload: {data}});

export const keepDesignAliveError = error => ({type: Action.KEEP_DESIGN_ALIVE_ERROR, payload: {error}});

export const keepCollectionAlive = (mutexId, collectId, resetLastActive=false) => ({type: Action.KEEP_COLLECTION_ALIVE, payload: {mutexId, collectId, resetLastActive}});

export const keepCollectionAliveComplete = data => ({type: Action.KEEP_COLLECTION_ALIVE_COMPLETE, payload: {data}});

export const keepCollectionAliveError = error => {
    let query = {home: {name: 'My Patterns', link: 'design.php#/pattern/my'}, editPage: EditPage.PATTERN};
    return {type: Action.KEEP_COLLECTION_ALIVE_ERROR, payload: {error, query}};
};
