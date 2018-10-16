import path from 'path';
import Service from './service';

export default class SessionService extends Service {

    static get baseUrl() {
        let url = path.join('courses', 'courseId', 'sessions');
        return url;
    }

    constructor() {
        super();
    }

    update(courseId, mutexId, timestamp, data) {
        let url = SessionService.baseUrl.replace('courseId', courseId);
        return this.patch(url, {mutexId, timestamp, data})
            .then(response => Promise.resolve());
    }

    deleteSessions(courseId, mutexId, timestamp, data) {
        let url = SessionService.baseUrl.replace('courseId', courseId);
        return this.delete(url, {mutexId, timestamp, data})
            .then(response => Promise.resolve());
    }
}
