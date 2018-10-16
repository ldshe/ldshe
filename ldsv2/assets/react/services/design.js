import path from 'path';
import Service from './service';
import {Design, Outcome, Unit, Pattern, Session} from './util';

export default class DesignService extends Service {

    static get baseUrl() {
        let url = path.join('designs', 'courseId');
        return url;
    }

    constructor() {
        super();
    }

    getAllByOwner() {
        let url = DesignService.baseUrl.replace('/courseId', '');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getRecentlyByOwner() {
        let url = DesignService.baseUrl.replace('courseId', 'recently');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getAllByCurator() {
        let url = DesignService.baseUrl.replace('courseId', 'curated');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getAllByShared(mode) {
        let url = DesignService.baseUrl.replace('courseId', 'shared');
        return this.get(url, {mode})
            .then(response => Promise.resolve(response.data));
    }

    getRecentlyByShared() {
        let url = DesignService.baseUrl.replace('courseId', 'shared/recently');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getAllBySharedGroup(groupId) {
        let url = DesignService.baseUrl.replace('courseId', `shared/groups/${groupId}`);
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getAllByContributed(status) {
        let url = DesignService.baseUrl.replace('courseId', 'contributed');
        return this.get(url, {status})
            .then(response => Promise.resolve(response.data));
    }

    handleFetchedDesign(response) {
        let {data} = response.data;
        data.patterns = data.patterns.map(p => {
            let obj = {};
            Object.keys(p)
                .forEach(k => {
                    obj.id = k;
                    obj.patt = Design.load.convertPatternObj(p[k]);
                });
            return obj;
        });
        data.instances = data.instances.map(i => {
            let obj = {};
            Object.keys(i)
                .forEach(k => {
                    obj.id = k;
                    obj.patt = Design.load.convertPatternObj(i[k]);
                });
            return obj;
        });
        return Promise.resolve(response.data);
    }

    getDesign(courseId, readOnly=false) {
        let url = DesignService.baseUrl.replace('courseId', courseId);
        return this.get(url, readOnly ? {readOnly} : undefined)
            .then(response => this.handleFetchedDesign(response));
    }

    getImportableDesign(courseId, readOnly=false) {
        let url = DesignService.baseUrl.replace('courseId', `${courseId}/import`);
        return this.get(url, readOnly ? {readOnly} : undefined)
            .then(response => this.handleFetchedDesign(response));
    }

    importDesign(courseId, data, fromId=null) {
        let url = fromId == null ?
            DesignService.baseUrl.replace('courseId', `${courseId}/copy`) :
            DesignService.baseUrl.replace('courseId', `${courseId}/import`);
        let course = data.course;
        let outcomes = Outcome.convertDataObject(data.outcomes);
        let units = Unit.convertDataObject(data.units);
        let patterns = Design.save.convertPatternObject(data.patterns);
        let instances = Design.save.convertPatternObject(data.instances);
        let sessions = Session.convertDataObject(data.sessions);
        return this.put(url, {
            fromId,
            data: {
                course,
                outcomes,
                units,
                patterns,
                instances,
                sessions,
            },
        }).then(response => Promise.resolve());
    }
}
