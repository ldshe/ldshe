import path from 'path';
import Service from './service';
import {Pattern} from './util';

export default class PatternService extends Service {

    static get pattBaseUrl() {
        let url = path.join('courses', 'courseId', 'patterns');
        return url;
    }

    static get instBaseUrl() {
        let url = path.join('courses', 'courseId', 'instances');
        return url;
    }

    constructor() {
        super();
    }

    updatePatterns(courseId, mutexId, timestamp, data) {
        let url = PatternService.pattBaseUrl.replace('courseId', courseId);
        let dataObj = Pattern.convertDataObject(data);
        return this.patch(url, {mutexId, timestamp, data: dataObj})
            .then(response => Promise.resolve());
    }

    deletePatterns(courseId, mutexId, timestamp, data) {
        let url = PatternService.pattBaseUrl.replace('courseId', courseId);
        return this.delete(url, {mutexId, timestamp, data})
            .then(response => Promise.resolve());
    }

    updateInstances(courseId, mutexId, timestamp, data) {
        let url = PatternService.instBaseUrl.replace('courseId', courseId);
        let dataObj = Pattern.convertDataObject(data);
        return this.patch(url, {mutexId, timestamp, data: dataObj})
            .then(response => Promise.resolve());
    }

    updateInstanceSettings(courseId, mutexId, timestamp, data) {
        let url = PatternService.instBaseUrl.replace('courseId', courseId)+'/settings';
        let dataObj = Pattern.convertDataObject(data);
        return this.patch(url, {mutexId, timestamp, data: dataObj})
            .then(response => Promise.resolve());
    }
}
