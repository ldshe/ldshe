import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import FileService from 'react/services/file';
import {Action} from '../types';
import {fileuploadComplete, fileuploadError} from '../actions';

let fileService = new FileService;

const fileupload = file =>
    Observable.fromPromise(fileService.create(file))
        .map(data => fileuploadComplete(data))
        .catch(error => {
            console.error(error);
            return Observable.of(fileuploadError(error));
        });

export const fileuploadEpic = (action$, store) =>
    action$.ofType(Action.FILEUPLOAD)
        .mergeMap(({payload}) => fileupload(payload.file));
