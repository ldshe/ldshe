import {Action, StateName} from './types';
import createActions from 'react/components/stacked_panel/actions';

export const {
    reset,
    freshPanel,
    pushPanel,
    popPanel,
    jumpToPanel,
} = createActions(Action, StateName.SESSION_STEP);
