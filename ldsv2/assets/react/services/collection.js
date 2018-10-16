import path from 'path';
import Service from './service';
import {Design, Pattern} from './util';

export default class CollectionService extends Service {

    static get pattBaseUrl() {
        let url = path.join('collections', 'patterns', 'collectId');
        return url;
    }

    constructor() {
        super();
    }

    getAllPatternsByOwner() {
        let url = CollectionService.pattBaseUrl.replace('/collectId', '');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getRecentlyPatternsByOwner() {
        let url = CollectionService.pattBaseUrl.replace('collectId', 'recently');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }


    getAllPatternsByCurator() {
        let url = CollectionService.pattBaseUrl.replace('collectId', 'curated');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getAllPatternByShared(mode) {
        let url = CollectionService.pattBaseUrl.replace('collectId', 'shared');
        return this.get(url, {mode})
            .then(response => Promise.resolve(response.data));
    }

    getRecentlyPatternsByShared() {
        let url = CollectionService.pattBaseUrl.replace('collectId', 'shared/recently');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getAllPatternBySharedGroup(groupId) {
        let url = CollectionService.pattBaseUrl.replace('collectId', `shared/groups/${groupId}`);
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getAllPatternsByContributed() {
        let url = CollectionService.pattBaseUrl.replace('collectId', 'contributed');
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    getPattern(collectId, readOnly=false) {
        let url = CollectionService.pattBaseUrl.replace('collectId', collectId);
        return this.get(url, readOnly ? {readOnly} : undefined)
            .then(response => {
                let {data} = response.data;
                data.pattern = Design.load.convertPatternObj(data.pattern);
                return Promise.resolve(response.data);
            });
    }

    getImportablePattern(collectId, readOnly=false) {
        let url = CollectionService.pattBaseUrl.replace('collectId', `${collectId}/import`);
        return this.get(url, readOnly ? {readOnly} : undefined)
            .then(response => {
                let {data} = response.data;
                data.pattern = Design.load.convertPatternObj(data.pattern);
                return Promise.resolve(response.data);
            });
    }

    create(data=null) {
        let url = CollectionService.pattBaseUrl.replace('/collectId', '');
        let dataObj = data ? Pattern.convertDataObject(data) : null;
        return this.post(url, {data: dataObj})
            .then(response => Promise.resolve(response.data));
    }

    createCurated() {
        let url = CollectionService.pattBaseUrl.replace('collectId', 'curated');
        return this.post(url)
            .then(response => Promise.resolve(response.data));
    }

    update(collectId, mutexId, timestamp, data) {
        let url = CollectionService.pattBaseUrl.replace('collectId', collectId);
        let dataObj = Pattern.convertDataObject(data);
        return this.put(url, {mutexId, timestamp, data: dataObj})
            .then(response => Promise.resolve());
    }

    updateSettings(collectId, mutexId, timestamp, data) {
        let url = CollectionService.pattBaseUrl.replace('collectId', collectId)+'/settings';
        let dataObj = Pattern.convertDataObject(data);
        return this.put(url, {mutexId, timestamp, data: dataObj})
            .then(response => Promise.resolve());
    }

    importPattern(collectId, data, fromId=null) {
        let url = fromId ?
            CollectionService.pattBaseUrl.replace('collectId', `${collectId}/import`) :
            CollectionService.pattBaseUrl.replace('collectId', `${collectId}/copy`);
        let dataObj = Pattern.convertDataObject(data.pattern);
        return this.put(url, {fromId, data: dataObj})
            .then(response => Promise.resolve());
    }

    deletePattern(collectId) {
        let url = CollectionService.pattBaseUrl.replace('collectId', collectId);
        return this.delete(url)
            .then(response => Promise.resolve());
    }

    getConfig(collectId) {
        let url = CollectionService.pattBaseUrl.replace('collectId', `${collectId}/settings`);
        return this.get(url)
            .then(response => Promise.resolve(response.data));
    }

    configure(collectId, data) {
        let url = CollectionService.pattBaseUrl.replace('collectId', `${collectId}/settings`);
        return this.patch(url, {data})
            .then(response => Promise.resolve());
    }

    makeContribution(collectId) {
        let url = CollectionService.pattBaseUrl.replace('collectId', `${collectId}/contributions/request`);
        return this.put(url)
            .then(response => Promise.resolve());
    }

    reviewContribution(collectId, status) {
        let url = CollectionService.pattBaseUrl.replace('collectId', `${collectId}/contributions/respond`);
        return this.put(url, {status})
            .then(response => Promise.resolve());
    }
}
