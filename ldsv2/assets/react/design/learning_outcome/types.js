import {Config} from 'js/util';
import {Action as BaseAction} from 'react/components/sortable_list/types';

export const StateName = {
    LEARNING_OUTCOME: 'learningOutcome',
}

export const LearningOutcomeTypes = {
    DISCIPLINARY_KNOWLEDGE: 'disciplinary_knowledge',
    DISCIPLINARY_SKILLS: 'disciplinary_skills',
    GENERIC_SKILLS: 'generic_skills',
};

export const LearningOutcomes = [
    {name: 'Disciplinary Knowledge', value: LearningOutcomeTypes.DISCIPLINARY_KNOWLEDGE, className: 'disciplinary-knowledge'},
    {name: 'Disciplinary Skills', value: LearningOutcomeTypes.DISCIPLINARY_SKILLS, className: 'disciplinary-skills'},
    {name: 'Generic Skills', value: LearningOutcomeTypes.GENERIC_SKILLS, className: 'generic-skills'},
];

export const LearningOutcomeDescriptions = [
    'Communication skills',
    'Collaboration skills',
    'Critical thinking',
    'Creativity',
    'Leadership',
    'Self-directed learning',
    'Time management',
];

const prefix = 'learning_outcome_';
let PrefixedAction = Config.prefixType(BaseAction, prefix);

export const Action = Object.assign({}, PrefixedAction, {
    PARTIAL_UPDATE: `${prefix}partial_update`,
});
