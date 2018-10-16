import {push} from 'react-router-redux';
import {Config} from 'js/util';
import {Action as PanelAction, StateName} from './types';
import createActions from 'react/components/stacked_panel/actions';
import {Panel} from './types';

const stateName = StateName.PANEL;

const BaseActions = createActions(PanelAction, StateName.PANEL);

export const jumpToPanel = panel => (dispatch, getState) => {
    switch(panel) {
        case Panel.GROUP_MANAGEMENT: {
            const state = Config.get(getState(), stateName);
            let url = state.panels.filter(p => p.panel == panel)[0].opts.url
            dispatch(push(url));
            break;
        }

        default:
            dispatch(BaseActions.jumpToPanel(panel));
    }
}

export const {
    reset,
    freshPanel,
    pushPanel,
    pushPanels,
    popPanel,
} = BaseActions;
