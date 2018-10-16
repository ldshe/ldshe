import path from 'path';
import Service from './service';

export default class NotificationService extends Service {

    static get baseUrl() {
        let url = path.join('notifications', 'noteId');
        return url;
    }

    constructor() {
        super();
    }

    getAllByOwner() {
        return this.get(NotificationService.baseUrl.replace('/noteId', ''))
            .then(response => Promise.resolve(response.data));
    }

    dismiss(id) {
        return this.delete(NotificationService.baseUrl.replace('noteId', id))
            .then(response => Promise.resolve());
    }
}
