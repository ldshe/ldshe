import {Action} from './types';
import createReducers, {initStep} from 'react/components/wizard/reducers';

const initState = Object.assign({}, initStep, {
    total: 3,
    current: 1,
    max: 3,
});

const {step} = createReducers(Action, initState);

export {
    step as designStep,
};
