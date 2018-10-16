import {Action, Panel} from './types';
import createReducers, {initPanel} from 'react/components/stacked_panel/reducers';

const initState = Object.assign({}, initPanel, {
    panels: [{panel: Panel.DESIGN_GRID}],
    currPanel: {panel: Panel.DESIGN_GRID},
});

const {panel} = createReducers(Action, initState);

export {
    panel as unitStep,
};
