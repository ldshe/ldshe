import {Action} from '../types';

export const clearInfoLogs = () => {
    let infos = [];
    let payload = {infos};
    return {type: Action.CLEAR_INFO_LOG, payload};
}

export const clearSuccessLogs = () => {
    let success = [];
    let payload = {success};
    return {type: Action.CLEAR_SUCCESS_LOG, payload};
}

export const clearErrorLogs = () => {
    let errors = [];
    let payload = {errors};
    return {type: Action.CLEAR_ERRORS_LOG, payload};
}
