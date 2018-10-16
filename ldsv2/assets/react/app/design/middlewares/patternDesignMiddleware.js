import alertify from 'alertify.js';
import {LOCATION_CHANGE} from 'react-router-redux/reducer';
import {Config} from 'js/util';
import {Action as AppAction, StateName as AppStateName} from '../types';
import {Action as DesignWizardAction} from 'react/design/design_wizard/types';
import {Action as UnitStepAction} from 'react/design/unit_step/types'
import {PatternAction as UnitPatternAction, InstanceAction as UnitInstanceAction, StateName as UnitStateName} from 'react/design/learning_unit/design_panel/types';
import {Action as PatternAction, StateName as PattStateName} from 'react/design/pattern/types';


export default store => next => action => {
    const appState = Config.get(store.getState(), AppStateName.DESIGN_APP);
    const unitPattState = Config.get(store.getState(), UnitStateName.LEARNING_UNIT_PATTERN);
    const unitInstState = Config.get(store.getState(), UnitStateName.LEARNING_UNIT_PATTERN_INSTANCE);
    const pattState = Config.get(store.getState(), PattStateName.PATTERN);

    if(!appState.readDesignOnly && unitPattState.onEdit) {
        switch(action.type) {
            case LOCATION_CHANGE:
                /*
                * Since the history block function is unable to block the URL path change,
                * a compensate push action is done in the block function.
                * However, another side effect happens when user confirmed to leave the component
                * after having performed a Go Back action, the browser URL location does not change accordingly.
                */
                location.replace(`#${action.payload.pathname}`); //replace previous URL with the target one to fix the side effect
                return;

            case AppAction.CHANGE_EDIT_TAB:
            case DesignWizardAction.JUMP_TO:
            case DesignWizardAction.NEXT:
            case DesignWizardAction.BACK:
            case UnitStepAction.JUMP_TO_PANEL:
                if(unitPattState.structuralChanged || unitPattState.activityFieldChanged) {
                    alertify.theme('bootstrap')
                        .okBtn('Got it!')
                        .alert(
                            'Please click the "Done" button to apply changes or "Cancel" to leave.',
                            (e, ui) => e.preventDefault()
                        );
                    return;
                } else {
                    next(action);
                    return;
                }
        }
    }

    if(!appState.readDesignOnly && (unitPattState.additional.onEdit || unitInstState.additional.onEdit)) {
        switch(action.type) {
            case LOCATION_CHANGE:
                location.replace(`#${action.payload.pathname}`); //replace previous URL with the target one to fix the side effect
                return;

            case UnitPatternAction.ADDITIONAL_SETTINGS_PANEL.JUMP_TO_PANEL:
            case UnitInstanceAction.ADDITIONAL_SETTINGS_PANEL.JUMP_TO_PANEL:
                alertify.theme('bootstrap')
                    .okBtn('Got it!')
                    .alert(
                        'Please click the "Done" button to apply changes or "Cancel" to leave.',
                        (e, ui) => e.preventDefault()
                    );
                return;
        }
    }

    if(!appState.readPatternOnly && pattState.additional.onEdit) {
        switch(action.type) {
            case LOCATION_CHANGE:
                location.replace(`#${action.payload.pathname}`); //replace previous URL with the target one to fix the side effect
                return;

            case PatternAction.ADDITIONAL_SETTINGS_PANEL.JUMP_TO_PANEL:
                alertify.theme('bootstrap')
                    .okBtn('Got it!')
                    .alert(
                        'Please click the "Done" button to apply changes or "Cancel" to leave.',
                        (e, ui) => e.preventDefault()
                    );
                return;
        }
    }

    next(action);
}
