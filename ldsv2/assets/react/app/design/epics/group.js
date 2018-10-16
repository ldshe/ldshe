import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import GroupService from 'react/services/group';
import {loadData as loadGroupListData} from 'react/design/group/group_list/actions';
import {ListType} from 'react/design/group/member_list/types';
import {loadData as loadMemberListData} from 'react/design/group/member_list/actions';
import {Action, StateName} from '../types';
import {loadGroupList, loadGroupListComplete, loadGroupListError,
    newGroupComplete, newGroupError,
    loadGroup, loadGroupComplete, loadGroupError,
    removeGroupComplete, removeGroupError,
    configureGroupComplete, configureGroupError,
    loadMemberList, loadMemberListComplete, loadMemberListError,
    newMemberComplete, newMemberError,
    removeMemberComplete, removeMemberError,
    joinGroupComplete, joinGroupError,
    leaveGroupComplete, leaveGroupError} from '../actions';

const stateName = StateName.DESIGN_APP;
let groupService = new GroupService;

export const loadGroupListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_GROUP_LIST, Action.LOAD_EMBEDDED_GROUP_LIST)
        .mergeMap(({type}) =>
            Observable.fromPromise(groupService.getAllByMember())
                .map(data => {
                    if(type == Action.LOAD_GROUP_LIST) store.dispatch(loadGroupListData(data.groups));
                    return loadGroupListComplete(data.groups);
                }).catch(error => {
                    console.error(error);
                    return Observable.of(loadGroupListError(error));
                })
        );

export const newGroupEpic = action$ =>
    action$.ofType(Action.NEW_GROUP)
        .mergeMap(({payload}) =>
            Observable.fromPromise(groupService.create(payload.data))
                .map(data => newGroupComplete(data))
                .catch(error => {
                    console.error(error);
                    return Observable.of(newGroupError(error));
                })
        );

export const loadGroupEpic = action$ =>
    action$.ofType(Action.LOAD_GROUP)
        .mergeMap(({payload}) =>
            Observable.fromPromise(groupService.getGroup(payload.groupId))
                .map(data => loadGroupComplete(data))
                .catch(error => {
                    console.error(error);
                    return Observable.of(loadGroupError(error));
                })
        );

export const configureGroupEpic = action$ =>
    action$.ofType(Action.CONFIGURE_GROUP)
        .mergeMap(({payload}) =>
            Observable.fromPromise(groupService.update(payload.groupId, {data: payload.data}))
                .mergeMap(() => [loadGroup(payload.groupId), configureGroupComplete()])
                .catch(error => {
                    console.error(error);
                    return Observable.of(configureGroupError(error));
                })
        );

export const removeGroupEpic = action$ =>
    action$.ofType(Action.REMOVE_GROUP)
        .mergeMap(({payload}) =>
            Observable.fromPromise(groupService.deleteGroup(payload.groupId))
                .mergeMap(() => [loadGroupList(), removeGroupComplete()])
                .catch(error => {
                    console.error(error);
                    return Observable.of(removeGroupError(error));
                })
        );

export const joinGroupEpic = action$ =>
    action$.ofType(Action.JOIN_GROUP)
        .mergeMap(({payload}) =>
            Observable.fromPromise(groupService.joinGroup(payload.groupId, payload.userId, {isAccept: payload.isAccept}))
                .map(() => joinGroupComplete())
                .catch(error => {
                    console.error(error);
                    return Observable.of(joinGroupError(error));
                })
        );

export const leaveGroupEpic = action$ =>
    action$.ofType(Action.LEAVE_GROUP)
        .mergeMap(({payload}) =>
            Observable.fromPromise(groupService.leaveGroup(payload.groupId, payload.userId))
                .map(() => leaveGroupComplete())
                .catch(error => {
                    console.error(error);
                    return Observable.of(leaveGroupError(error));
                })
        );

export const loadMemberListEpic = (action$, store) =>
    action$.ofType(Action.LOAD_MEMBER_LIST)
        .mergeMap(({payload}) => {
            const {listType} = payload;
            switch(listType) {
                case ListType.MANAGEABLE:
                    return getManageableMembersList(store, payload);
                case ListType.MEMBER:
                    return getMembersList(store, payload);
            }
        });

const getManageableMembersList = (store, payload) =>
    Observable.fromPromise(groupService.getManageableMembers(payload.groupId))
        .map(data => {
            store.dispatch(loadMemberListData(payload.listType, data.members));
            return loadMemberListComplete();
        }).catch(error => {
            console.error(error);
            return Observable.of(loadMemberListError(error));
        });

const getMembersList = (store, payload) =>
    Observable.fromPromise(groupService.getMembers(payload.groupId))
        .map(data => {
            store.dispatch(loadMemberListData(payload.listType, data.members));
            return loadMemberListComplete();
        }).catch(error => {
            console.error(error);
            return Observable.of(loadMemberListError(error));
        });

export const newMemberEpic = action$ =>
    action$.ofType(Action.NEW_MEMBER)
        .mergeMap(({payload}) =>
            Observable.fromPromise(groupService.addMember(payload.groupId, payload.data))
                .mergeMap(() => [loadMemberList(ListType.MANAGEABLE, payload.groupId), newMemberComplete()])
                .catch(error => {
                    console.error(error);
                    return Observable.of(newMemberError(error));
                })
        );

export const removeMemberEpic = action$ =>
    action$.ofType(Action.REMOVE_MEMBER)
        .mergeMap(({payload}) =>
            Observable.fromPromise(groupService.deleteMember(payload.groupId, payload.userId))
                .mergeMap(() => [loadMemberList(ListType.MANAGEABLE, payload.groupId), removeMemberComplete()])
                .catch(error => {
                    console.error(error);
                    return Observable.of(removeMemberError(error));
                })
        );
