import {Config} from 'js/util';
import {Action as BaseAction} from 'react/components/sortable_list/types';

export const StateName = {
    LEARNING_UNIT: 'learningUnit.unit',
}

export const PedagogicalApproaches = [
    'Project-based learning',
    'Self-directed learning',
    'Inquiry-based learning',
    'Problem-based learning',
];

const prefix = 'learning_unit_';
let PrefixedAction = Config.prefixType(BaseAction, prefix);

export const Action = Object.assign({}, PrefixedAction, {
    REMOVE_OUTCOME: `${prefix}remove_outcome`,
    UPDATE_TEACHING_STUDY_TIME: `${prefix}update_teaching_study_time`,
    PARTIAL_UPDATE: `${prefix}partial_update`,
});
