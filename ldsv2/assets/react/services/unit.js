import path from 'path';
import Service from './service';
import {Unit} from './util';

export default class UnitService extends Service {

    static get baseUrl() {
        let url = path.join('courses', 'courseId', 'units');
        return url;
    }

    constructor() {
        super();
    }

    update(courseId, mutexId, timestamp, data) {
        let url = UnitService.baseUrl.replace('courseId', courseId);
        let dataObj = Unit.convertDataObject(data);
        return this.put(url, {mutexId, timestamp, data: dataObj})
            .then(response => Promise.resolve());
    }
}
