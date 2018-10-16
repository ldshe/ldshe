import {reset as resetGroup} from 'react/design/group/group_item/actions';
import {Action} from '../types';
import {generalHttpError} from './http';

export const loadGroupList = () => ({type: Action.LOAD_GROUP_LIST});

export const loadEmbeddedGroupList = () => ({type: Action.LOAD_EMBEDDED_GROUP_LIST});

export const loadGroupListComplete = groups => ({type: Action.LOAD_GROUP_LIST_COMPLETE, payload: {groups}});

export const loadGroupListError = error => ({type: Action.LOAD_GROUP_LIST_ERROR, payload: {error}});

export const newGroup = data => (dispatch, getState) => {
    dispatch(resetGroup());
    dispatch({type: Action.NEW_GROUP, payload: {data}});
};

export const newGroupComplete = group => {
    const {groupId, user} = group;
    let payload = {
        groupId,
        user,
    };
    return {type: Action.NEW_GROUP_COMPLETE, payload};
}

export const newGroupError = error => {
    let query = {home: {name: 'My Groups', link: 'design.php#/group'}};
    return {type: Action.NEW_GROUP_ERROR, payload: {error, query}};
};

export const loadGroup = groupId => (dispatch, getState) => {
    dispatch(resetGroup());
    let payload = {groupId};
    dispatch({type: Action.LOAD_GROUP, payload});
};

export const loadGroupComplete = group => {
    let payload = Object.assign({}, group);
    return {type: Action.LOAD_GROUP_COMPLETE, payload}
};

export const loadGroupError = error => {
    let query = {home: {name: 'My Groups', link: 'design.php#/group'}};
    return {type: Action.LOAD_GROUP_ERROR, payload: {error, query}};
};

export const configureGroup = (groupId, data) => {
    let payload = {groupId, data};
    return {type: Action.CONFIGURE_GROUP, payload};
};

export const configureGroupComplete = () => {
    let data = {message: 'Settings applied.'}
    return {type: Action.CONFIGURE_GROUP_COMPLETE, payload: {data}};
};

export const configureGroupError = error => {
    error.message = 'Apply settings failed.';
    if(error.response) {
        let query = {home: {name: 'Groups', link: 'design.php#/group'}};
        let {status} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error, query);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.CONFIGURE_GROUP_ERROR, payload: {error}};
};

export const removeGroup = groupId => {
    let payload = {groupId};
    return {type: Action.REMOVE_GROUP, payload};
};

export const removeGroupComplete = () => {
    let data = {message: 'Group deleted.'}
    return {type: Action.REMOVE_GROUP_COMPLETE, payload: {data}};
};

export const removeGroupError = error => {
    error.message = 'Delete group failed.';
    if(error.response) {
        let query = {home: {name: 'Groups', link: 'design.php#/group'}};
        let {status} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error, query);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.REMOVE_GROUP_ERROR, payload: {error}};
};

export const joinGroup = (groupId, userId, isAccept) => {
    let payload = {groupId, userId, isAccept};
    return {type: Action.JOIN_GROUP, payload};
};

export const joinGroupComplete = () => {
    let data = {message: 'Group joined.'}
    return {type: Action.JOIN_GROUP_COMPLETE, payload: {data}};
};

export const joinGroupError = error => {
    error.message = 'Join group failed.';
    if(error.response) {
        let query = {home: {name: 'Groups', link: 'design.php#/group'}};
        let {status, data} = error.response;
        if(status == 401) return generalHttpError(error, query);
        if(status == 403) error.message = 'You need permission to perform this action.';
        if(status == 404) error.message = data.message;
        if(status == 404 && data.message.match(/^No query results for model/gi)) error.message = 'Group not found.';
        if(status == 409) error.message = data.message;
    }
    return {type: Action.JOIN_GROUP_ERROR, payload: {error}};
};

export const leaveGroup = (groupId, userId) => {
    let payload = {groupId, userId};
    return {type: Action.LEAVE_GROUP, payload};
};

export const leaveGroupComplete = () => {
    let data = {message: 'Group left.'}
    return {type: Action.LEAVE_GROUP_COMPLETE, payload: {data}};
};

export const leaveGroupError = error => {
    error.message = 'Leave group failed.';
    if(error.response) {
        let query = {home: {name: 'Groups', link: 'design.php#/group'}};
        let {status, data} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error, query);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.LEAVE_GROUP_ERROR, payload: {error}};
};

export const loadMemberList = (listType, groupId) => ({type: Action.LOAD_MEMBER_LIST, payload:{listType, groupId}});

export const loadMemberListComplete = () => ({type: Action.LOAD_MEMBER_LIST_COMPLETE});

export const loadMemberListError = error => {
    let query = {home: {name: 'Groups', link: 'design.php#/group'}};
    return {type: Action.LOAD_MEMBER_LIST_ERROR, payload: {error, query}};
};

export const newMember = (groupId, userId) => ({type: Action.NEW_MEMBER, payload: {groupId, data: {userId}}});

export const newMemberComplete = () => {
    let data = {message: 'Invitation sent.'};
    return {type: Action.NEW_MEMBER_COMPLETE, payload: {data}};
};

export const newMemberError = error => {
    error.message = 'Add member failed.';
    if(error.response) {
        let query = {home: {name: 'Groups', link: 'design.php#/group'}};
        let {status, data} = error.response;
        if(status == 401) return generalHttpError(error, query);
        if(status == 404 && data.message.match(/^No query results for model/gi)) return generalHttpError(error, query);
        if(status == 404 || status == 409) error.message = data.message;
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.NEW_MEMBER_ERROR, payload: {error}};
};

export const removeMember = (groupId, userId) => {
    let payload = {groupId, userId};
    return {type: Action.REMOVE_MEMBER, payload};
};

export const removeMemberComplete = () => {
    let data = {message: 'Member deleted.'}
    return {type: Action.REMOVE_MEMBER_COMPLETE, payload: {data}};
};

export const removeMemberError = error => {
    error.message = 'Delete member failed.';
    if(error.response) {
        let query = {home: {name: 'Groups', link: 'design.php#/group'}};
        let {status} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error, query);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.REMOVE_MEMBER_ERROR, payload: {error}};
};
