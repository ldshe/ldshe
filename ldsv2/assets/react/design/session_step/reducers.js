import {Action, Panel} from './types';
import createReducers, {initPanel} from 'react/components/stacked_panel/reducers';

const initState = Object.assign({}, initPanel, {
    panels: [{panel: Panel.SESSION}],
    currPanel: {panel: Panel.SESSION},
});

const {panel} = createReducers(Action, initState);

export {
    panel as sessionStep,
};
