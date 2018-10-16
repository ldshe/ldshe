import {Action} from '../types';
import {generalHttpError} from './http';

export const fileupload = file => ({type: Action.FILEUPLOAD, payload: {file}});

export const fileuploadComplete = data => ({type: Action.FILEUPLOAD_COMPLETE, payload: {data}});

export const fileuploadError = error => {
    error.message = 'File upload failed.';
    if(error.response) {
        let {status} = error.response;
        if(status == 401 || status == 404) return generalHttpError(error);
        if(status == 403) error.message = 'You need permission to perform this action.';
    }
    return {type: Action.FILEUPLOAD_ERROR, payload: {error}};
};
