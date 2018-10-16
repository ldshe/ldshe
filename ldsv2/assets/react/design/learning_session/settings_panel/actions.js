import {Config} from 'js/util';
import {StateName as PatternStateName, InstanceAction as Action} from 'react/design/learning_unit/design_panel/types';
import * as BaseActions from 'react/design/learning_unit/design_panel/actions/unit';

export const unloadUserPattern = id => (dispatch, getState) => {
    dispatch(BaseActions.loadUserPattern(id));
}

export const {
    loadUserPattern,
    activityFieldChange,
    resetAdditionalSettingsPanel,
    freshAdditionalSettingsPanel,
    pushAdditionalSettingsPanel,
    popAdditionalSettingsPanel,
    jumpToAdditionalSettingsPanel,
    addAdditionalSettings,
    removeAdditionalSettings,
    removeAllAdditionalSettings,
    moveAdditionalSettings,
    updateAdditionalSettings,
} = BaseActions;
