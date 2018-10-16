import {Action, StateName} from './types';
import createActions from 'react/components/stacked_panel/actions';
import {Panel}  from './types';

const BaseActions = createActions(Action, StateName.UNIT_STEP);

export const freshPanel = () => (dispatch, getState) => {
    dispatch(BaseActions.freshPanel(Panel.DESIGN_GRID));
}

export const {
    reset,
    pushPanel,
    popPanel,
    jumpToPanel,
} = BaseActions;
