import path from 'path';
import Service from './service';

export default class MutexService extends Service {

    static get courseBaseUrl() {
        let url = path.join('mutex', 'courses', 'courseId');
        return url;
    }

    static get collectionBaseUrl() {
        let url = path.join('mutex', 'collections', 'collectId');
        return url;
    }

    static get keepAliveBaseUrl() {
        let url = path.join('mutex', 'keepalive', 'id');
        return url;
    }

    constructor() {
        super();
    }

    lockDesign(courseId) {
        let url = MutexService.courseBaseUrl.replace('courseId', courseId);
        return this.put(url)
            .then(response => Promise.resolve(response.data));
    }

    lockCollection(collectId) {
        let url = MutexService.collectionBaseUrl.replace('collectId', collectId);
        return this.put(url)
            .then(response => Promise.resolve(response.data));
    }

    takeoverDesign(courseId) {
        let url = MutexService.courseBaseUrl.replace('courseId', `${courseId}/takeover`);
        return this.put(url)
            .then(response => Promise.resolve(response.data));
    }

    takeoverCollection(collectId) {
        let url = MutexService.collectionBaseUrl.replace('collectId', `${collectId}/takeover`);
        return this.put(url)
            .then(response => Promise.resolve(response.data));
    }

    keepAlive(id, data) {
        let url = MutexService.keepAliveBaseUrl.replace('id', id);
        return this.put(url, data)
            .then(response => Promise.resolve(response.data));
    }
}
