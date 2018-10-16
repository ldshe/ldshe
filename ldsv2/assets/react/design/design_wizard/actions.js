import {Action, StateName} from './types';
import createActions from 'react/components/wizard/actions';

export const {
    reset,
    stepNext,
    stepBack,
    jumpTo,
} = createActions(Action, StateName.DESIGN_STEP);
