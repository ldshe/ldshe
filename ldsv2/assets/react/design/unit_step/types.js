import {Config} from 'js/util';
import {Action as BaseAction} from 'react/components/stacked_panel/types';

export const StateName = {
    UNIT_STEP: 'unitStep',
}

export const Panel = {
    DESIGN_GRID: 'design_grid',
    DESIGN_UNIT: 'design_unit',
    DESIGN_PATTERN: 'design_pattern',
}

export const PanelType = {
    [Panel.DESIGN_GRID]: {title: 'Strategic Components'},
    [Panel.DESIGN_UNIT]: {title: 'Component Designs'},
    [Panel.DESIGN_PATTERN]: {title: 'Pattern Design'},
}

const prefix = 'unit_step_';
let PrefixedAction = Config.prefixType(BaseAction, prefix);

export const Action = Object.assign({}, PrefixedAction, {
    //Extended actions defined here
});
