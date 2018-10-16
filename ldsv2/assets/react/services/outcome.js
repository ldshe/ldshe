import path from 'path';
import Service from './service';
import {Outcome} from './util';

export default class OutcomeService extends Service {

    static get baseUrl() {
        let url = path.join('courses', 'courseId', 'outcomes');
        return url;
    }

    constructor() {
        super();
    }

    update(courseId, mutexId, timestamp, data) {
        let url = OutcomeService.baseUrl.replace('courseId', courseId);
        let dataObj = Outcome.convertDataObject(data);
        return this.put(url, {mutexId, timestamp, data: dataObj})
            .then(response => Promise.resolve());
    }
}
