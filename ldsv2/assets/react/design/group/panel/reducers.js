import {Action, Panel} from './types';
import createReducers, {initPanel} from 'react/components/stacked_panel/reducers';

export default createReducers(Action, initPanel).panel;
