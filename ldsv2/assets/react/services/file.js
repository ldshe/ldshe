import path from 'path';
import Service from './service';

export default class FileService extends Service {

    static get baseUrl() {
        let url = path.join('files', 'fileId');
        return url;
    }

    constructor() {
        super();
    }

    create(files) {
        let formData = new FormData;
        formData.append('file', files[0]);
        let url = FileService.baseUrl.replace('/fileId', '');
        return this.postFile(url, formData)
            .then(response => Promise.resolve(response.data));
    }
}
