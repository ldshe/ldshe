import {Action} from '../types';

export const isSaving = () => ({type: Action.SAVE_IN_PROGRESS});

export const setPartialUpdate = partialUpdate => ({type: Action.SET_PARTIAL_UPDATE, payload: {partialUpdate}});

export const saveProcessComplete = error => ({type: Action.SAVE_PROCESS_COMPLETE});

export const saveProcessError = error => ({type: Action.SAVE_PROCESS_ERROR, payload: {error}});
