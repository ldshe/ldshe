import {Config} from 'js/util';
import {Action as BaseAction} from 'react/components/wizard/types';

export const StateName = {
    DESIGN_STEP: 'designStep',
}

export const Step = {
    COURSE: 1,
    UNIT: 2,
    SESSION: 3,
};

const prefix = 'design_wizard_';
let PrefixedAction = Config.prefixType(BaseAction, prefix);

export const Action = Object.assign({}, PrefixedAction, {
    //Extended actions defined here
});
