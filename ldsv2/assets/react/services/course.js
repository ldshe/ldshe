import path from 'path';
import Service from './service';

export default class CourseService extends Service {

    static get baseUrl() {
        return 'courses';
    }

    constructor() {
        super();
    }

    create() {
        return this.post(CourseService.baseUrl)
            .then(response => Promise.resolve(response.data));
    }

    createCurated() {
        let url = path.join(CourseService.baseUrl, '/curated');
        return this.post(url)
            .then(response => Promise.resolve(response.data));
    }

    update(id, mutexId, timestamp, data) {
        let url = path.join(CourseService.baseUrl, id ? id.toString() : '');
        return this.put(url, {mutexId, timestamp, data})
            .then(response => Promise.resolve());
    }

    deleteCourse(id) {
        let url = path.join(CourseService.baseUrl, id ? id.toString() : '');
        return this.delete(url)
            .then(response => Promise.resolve());
    }

    getConfig(id) {
        let url = path.join(CourseService.baseUrl, id ? id.toString() : '', '/settings');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    configure(id, data) {
        let url = path.join(CourseService.baseUrl, id ? id.toString() : '', '/settings');
        return this.patch(url, {data})
            .then(response => Promise.resolve());
    }

    makeContribution(id) {
        let url = path.join(CourseService.baseUrl, id ? id.toString() : '', '/contributions/request');
        return this.put(url)
            .then(response => Promise.resolve());
    }

    reviewContribution(id, status) {
        let url = path.join(CourseService.baseUrl, id ? id.toString() : '', '/contributions/respond');
        return this.put(url, {status})
            .then(response => Promise.resolve());
    }
}
