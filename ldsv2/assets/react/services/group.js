import path from 'path';
import Service from './service';

export default class GroupService extends Service {

    static get baseUrl() {
        let url = path.join('groups', 'groupId');
        return url;
    }

    constructor() {
        super();
    }

    getAllByMember() {
        return this.get(GroupService.baseUrl.replace('/groupId', ''))
            .then(response => Promise.resolve(response.data));
    }

    getRecentlyByMember() {
        return this.get(GroupService.baseUrl.replace('groupId', 'recently'))
            .then(response => Promise.resolve(response.data));
    }

    create(data) {
        return this.post(GroupService.baseUrl.replace('/groupId', ''), data)
            .then(response => Promise.resolve(response.data));
    }

    getGroup(groupId) {
        return this.get(GroupService.baseUrl.replace('groupId', groupId))
            .then(response => Promise.resolve(response.data));
    }

    update(id, data) {
        return this.put(GroupService.baseUrl.replace('groupId', id), data)
            .then(response => Promise.resolve());
    }

    deleteGroup(id) {
        return this.delete(GroupService.baseUrl.replace('groupId', id))
            .then(response => Promise.resolve());
    }

    joinGroup(groupId, userId, data) {
        return this.put(GroupService.baseUrl.replace('groupId', `${groupId}/members/${userId}/join`), data)
            .then(response => Promise.resolve());
    }

    leaveGroup(groupId, userId) {
        return this.put(GroupService.baseUrl.replace('groupId', `${groupId}/members/${userId}/leave`))
            .then(response => Promise.resolve());
    }

    getMembers(id) {
        return this.get(GroupService.baseUrl.replace('groupId', `${id}/members`))
            .then(response => Promise.resolve(response.data));
    }

    getManageableMembers(id) {
        return this.get(GroupService.baseUrl.replace('groupId', `${id}/members/manageable`))
            .then(response => Promise.resolve(response.data));
    }

    addMember(id, data) {
        return this.post(GroupService.baseUrl.replace('groupId', `${id}/members`), data)
            .then(response => Promise.resolve());
    }

    deleteMember(groupId, userId) {
        return this.delete(GroupService.baseUrl.replace('groupId', `${groupId}/members/${userId}`))
            .then(response => Promise.resolve());
    }
}
