import {push} from 'react-router-redux';
import {Action} from '../types';

export const generalHttpError = (error, query=null) => ({type: Action.GENERAL_HTTP_ERROR, payload: {error, query}});

export const redirectErrorPage = url => (dispatch, getState) => {
    dispatch(push(url));
    return {type: Action.REDIRECT_ERROR_PAGE};
};
