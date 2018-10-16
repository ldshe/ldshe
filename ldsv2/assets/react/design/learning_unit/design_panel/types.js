import TreeModel from 'tree-model';
import {Config} from 'js/util';
import {Action as SortableListAction} from 'react/components/sortable_list/types';
import {Action as StackedPanelAction} from 'react/components/stacked_panel/types';

export const StateName = {
    LEARNING_UNIT_PATTERN: 'learningUnit.pattern',
    LEARNING_UNIT_PATTERN_INSTANCE: 'learningUnit.patternInstance',
};

export const BaseAction = {
    RESET: 'reset',
    RESTORE: 'restore',
    LOAD_USER_PATTERN: 'load_user_pattern',
    LOAD_CLONED_USER_PATTERN: 'load_cloned_user_pattern',
    DELETE_USER_PATTERN: 'delete_user_pattern',
    CHANGE_TAGS: 'change_tags',
    CHANGE_SUBTYPE: 'change_subtype',
    CHANGE_NAME: 'change_name',
    ADD_PATTERN: 'add_pattern',
    DELETE_PATTERN: 'delete_pattern',
    UPDATE_POSITION: 'update_position',
    UPDATE_CONNECTION: 'update_connection',
    CHANGE_LEVEL: 'change_level',
    SELECT_CHILD: 'select_child',
    ACTIVITY_FIELD_CHANGE: 'activity_field_change',
    APPLY_PATTERN: 'apply_pattern',
    APPLY_SETTINGS: 'apply_settings',
    APPLY_DELETE_USER_PATTERN: 'apply_delete_user_pattern',
    PARTIAL_UPDATE: 'partial_update',
};

export const PatternAction = Object.assign({}, Config.prefixType(BaseAction, 'learning_unit_pattern_'), {
    CANCEL_PATTERN: 'learning_unit_pattern_cancel_pattern',
    ADDITIONAL_SETTINGS_PANEL: Config.prefixType(StackedPanelAction, 'learning_unit_pattern_additional_settings_panel_'),
    ADDITIONAL_SETTINGS: Config.prefixType(SortableListAction, 'learning_unit_pattern_additional_settings_'),
});

export const InstanceAction = Object.assign({}, Config.prefixType(BaseAction, 'learning_unit_pattern_instance_'), {
    REFRESH_PATTERN: 'learning_unit_pattern_instance_refresh_pattern',
    REFRESH_UNIT_NAME: 'learning_unit_pattern_instance_refresh_unit_name',
    ADDITIONAL_SETTINGS_PANEL: Config.prefixType(StackedPanelAction, 'learning_unit_pattern_instance_additional_settings_panel_'),
    ADDITIONAL_SETTINGS: Config.prefixType(SortableListAction, 'learning_unit_pattern_instance_additional_settings_'),
});

export const DEFAULT_UNIT_SEQ_PREFIX = 'C.';

export const DragType = {
    PATTERN: 'pattern',
};

export const GraphType = {
    PATTERN: 'pattern',
    PATTERN_INSTANCE: 'pattern_instance',
};

export const PatternType = {
    ACTIVITY: 'activity',
    COMPOSITE: 'composite',
};

export const LearningGroup = {
    REFLECTIVE: 'reflective',
    PRODUCTIVE: 'productive',
    EXPLORATORY: 'exploratory',
    DIRECTED: 'directed',
};

export const LearningType = {
    REVISION: 'revision',
    REFLECTION: 'reflection',
    SELF_OR_PEER_ASSESSMENT: 'self_or_peer_assessment',
    CONCEPTUAL_OR_VISUAL_ARTEFACTS: 'conceptual_or_visual_artefacts',
    TANGIBLE_MANIPULABLE_ARTIFACT: 'tangible_manipulable_artifact',
    PRESENTATIONS_PERFORMANCE_ILLUSTRATION: 'presentations_performance_illustration',
    TANGIBLE_OR_IMMERSIVE_INVESTIGATION: 'tangible_or_immersive_investigation',
    EXPLORATIONS_THROUGH_CONVERSATION: 'explorations_through_conversation',
    INFORMATION_EXPLORATION: 'information_exploration',
    TEST_ASSESSMENT: 'test_assessment',
    PRACTICE: 'practice',
    RECEIVING_AND_INTERPRETING_INFORMATION: 'receiving_and_interpreting_information',
};

export const AdditionalSettings = {
    URL: 'url',
    FILE: 'file',
};

const tree = new TreeModel();

let Activity = {
    REVISION: {
        id: LearningType.REVISION,
        patt: tree.parse({id: LearningType.REVISION, pattType: PatternType.ACTIVITY, subType: LearningType.REVISION, group: LearningGroup.REFLECTIVE, fullname: 'Revision', shortname: 'Rev'}),
    },
    REFLECTION: {
        id: LearningType.REFLECTION,
        patt: tree.parse({id: LearningType.REFLECTION, pattType: PatternType.ACTIVITY, subType: LearningType.REFLECTION, group: LearningGroup.REFLECTIVE, fullname: 'Reflection', shortname: 'Ref'}),
    },
    SELF_OR_PEER_ASSESSMENT: {
        id: LearningType.SELF_OR_PEER_ASSESSMENT,
        patt: tree.parse({id: LearningType.SELF_OR_PEER_ASSESSMENT, pattType: PatternType.ACTIVITY, subType: LearningType.SELF_OR_PEER_ASSESSMENT, group: LearningGroup.REFLECTIVE, fullname: 'Self-/Peer-assessment', shortname: 'SPA'}),
    },
    CONCEPTUAL_OR_VISUAL_ARTEFACTS: {
        id: LearningType.CONCEPTUAL_OR_VISUAL_ARTEFACTS,
        patt: tree.parse({id: LearningType.CONCEPTUAL_OR_VISUAL_ARTEFACTS, pattType: PatternType.ACTIVITY, subType: LearningType.CONCEPTUAL_OR_VISUAL_ARTEFACTS, group: LearningGroup.PRODUCTIVE, fullname: 'Construction: Conceptual / Visual Artefacts', shortname: 'CCV'}),
    },
    TANGIBLE_MANIPULABLE_ARTIFACT: {
        id: LearningType.TANGIBLE_MANIPULABLE_ARTIFACT,
        patt: tree.parse({id: LearningType.TANGIBLE_MANIPULABLE_ARTIFACT, pattType: PatternType.ACTIVITY, subType: LearningType.TANGIBLE_MANIPULABLE_ARTIFACT, group: LearningGroup.PRODUCTIVE, fullname: 'Construction: Tangible / Manipulable Artifacts', shortname: 'CTM'}),
    },
    PRESENTATIONS_PERFORMANCE_ILLUSTRATION: {
        id: LearningType.PRESENTATIONS_PERFORMANCE_ILLUSTRATION,
        patt: tree.parse({id: LearningType.PRESENTATIONS_PERFORMANCE_ILLUSTRATION, pattType: PatternType.ACTIVITY, subType: LearningType.PRESENTATIONS_PERFORMANCE_ILLUSTRATION, group: LearningGroup.PRODUCTIVE, fullname: 'Presentations, Performance Illustrations', shortname: 'PPI'}),
    },
    TANGIBLE_OR_IMMERSIVE_INVESTIGATION: {
        id: LearningType.TANGIBLE_OR_IMMERSIVE_INVESTIGATION,
        patt: tree.parse({id: LearningType.TANGIBLE_OR_IMMERSIVE_INVESTIGATION, pattType: PatternType.ACTIVITY, subType: LearningType.TANGIBLE_OR_IMMERSIVE_INVESTIGATION, group: LearningGroup.EXPLORATORY, fullname: 'Tangible / Immersive Investigation', shortname: 'TII'}),
    },
    EXPLORATIONS_THROUGH_CONVERSATION: {
        id: LearningType.EXPLORATIONS_THROUGH_CONVERSATION,
        patt: tree.parse({id: LearningType.EXPLORATIONS_THROUGH_CONVERSATION, pattType: PatternType.ACTIVITY, subType: LearningType.EXPLORATIONS_THROUGH_CONVERSATION, group: LearningGroup.EXPLORATORY, fullname: 'Explorations through Conversation', shortname: 'EIC'}),
    },
    INFORMATION_EXPLORATION: {
        id: LearningType.INFORMATION_EXPLORATION,
        patt: tree.parse({id: LearningType.INFORMATION_EXPLORATION, pattType: PatternType.ACTIVITY, subType: LearningType.INFORMATION_EXPLORATION, group: LearningGroup.EXPLORATORY, fullname: 'Information Exploration', shortname: 'IE'}),
    },
    TEST_ASSESSMENT: {
        id: LearningType.TEST_ASSESSMENT,
        patt: tree.parse({id: LearningType.TEST_ASSESSMENT, pattType: PatternType.ACTIVITY, subType: LearningType.TEST_ASSESSMENT, group: LearningGroup.DIRECTED, fullname: 'Test / Assessment', shortname: 'T/A'}),
    },
    PRACTICE: {
        id: LearningType.PRACTICE,
        patt: tree.parse({id: LearningType.PRACTICE, pattType: PatternType.ACTIVITY, subType: LearningType.PRACTICE, group: LearningGroup.DIRECTED, fullname: 'Practice', shortname: 'Pra'}),
    },
    RECEIVING_AND_INTERPRETING_INFORMATION: {
        id: LearningType.RECEIVING_AND_INTERPRETING_INFORMATION,
        patt: tree.parse({id: LearningType.RECEIVING_AND_INTERPRETING_INFORMATION, pattType: PatternType.ACTIVITY, subType: LearningType.RECEIVING_AND_INTERPRETING_INFORMATION, group: LearningGroup.DIRECTED, fullname: 'Receiving & Interpreting Information', shortname: 'RII'}),
    },
};

export const SocialOrganization = {
    GROUP: 'group',
    INDIVIDUAL: 'individual',
    PEER_REVIEW: 'peer_review',
    WHOLE_CLASS: 'whole_class',
};

export const Setting = {
    FACE_TO_FACE_SYNCHRONOUS: 'face_to_face_synchronous',
    FACE_TO_FACE_CLASSROOM: 'face_to_face_classroom',
    FACE_TO_FACE_FIELD_WORK: 'face_to_face_field_work',
    INFORMAL_ON_OR_OFFLINE: 'informal_on_or_offline',
    ONLINE_ASYNCHRONOUS: 'online_asynchronous',
    ONLINE_SYNCHRONOUS: 'online_synchronous',
};

export const Feedback = {
    GROUP_FEEDBACK: 'Group Feedback',
    AUTOMATED_FEEDBACK: 'Automated Feedback',
    INDIVIDUAL_FEEDBACK: 'Individual Feedback',
    PEER_REVIEW_FEEDBACK: 'Peer-review Feedback',
    SCORE: 'Score',
    TEACHER_FEEDBACK: 'Teacher Feedback',
};

export const Motivator = {
    BADGES: 'Badges',
    LEADERBOARD: 'Leaderboard',
    PEER_COMPETITION: 'Peer Competition',
    PEER_RESPONSE_QUANTITY_AND_QUALITY: 'Peer Response (Quantity and Quality)',
    SCORE: 'Score',
    TEAM_AGENCY: 'Team Agency',
    INDIVIDUAL_AGENCY: 'Individual Agency',
    EXTRA_ACTIVITIES: 'Extra Activities',
};

export const Resource = {
    ADDITIONAL_EXAMPLES: 'Additional Examples',
    ASSESSMENT_RUBRIC: 'Assessment Rubric',
    AUDIO: 'Audio',
    BOOK: 'Book',
    BOOK_CHAPTER: 'Book Chapter',
    CHECKLIST: 'Checklist',
    COURSE_SESSION_OUTLINE: 'Course / Session Outline',
    DEMO_VIDEO: 'Demo Video',
    DISCUSSION_QUESTIONS: 'Discussion Questions',
    INTERACTIVE_LEARNING_MATERIAL: 'Interactive Learning Material',
    LECTURE_TEXT: 'Lecture Text',
    LECTURE_VIDEO: 'Lecture Video',
    PAPER: 'Paper',
    PPT_SLIDES: 'PPT Slides',
    QUIZ: 'Quiz',
    SAMPLE_WORK_BY_STUDENTS: 'Sample Work by Students',
    SURVEY: 'Survey',
    TASK_EXAMPLE: 'Task Example',
    TEMPLATE: 'Template',
    TUTORIAL_TEXT: 'Tutorial Text',
    TUTORIAL_VIDEO: 'Tutorial Video',
    VIDEO: 'Video',
    WEBSITE: 'Website',
    WORKSHEET: 'Worksheet',
    WRITING_TEMPLATE: 'Writing Template',
};

export const Tool = {
    BLOG: 'Blog',
    BRAINSTORMING_TOOL: 'Brainstorming Tool',
    CHATROOM: 'Chatroom',
    COURSE_OUTLINE_TEMPLET: 'Course Outline Templet',
    DESIGN_LOG: 'Design Log',
    DISCUSSION_FORUM: 'Discussion Forum',
    E_PORTFOLIO: 'e-Portfolio',
    LEARNING_DESIGN_STUDIO: 'Learning Design Studio',
    LMS_MOODLE: 'LMS-Moodle',
    MIND_MAPPING_TOOL: 'Mind-mapping Tool',
    ONLINE_ASSIGN_SUBMISSION: 'Online Assign Submission',
    ONLINE_COURSE_ROOM: 'Online Course Room',
    ONLINE_SHARED_DRIVE: 'Online Shared Drive',
    ONLINE_SHARED_WORKSPACE: 'Online Shared Workspace',
    PROGRAMMING_LANGUAGE: 'Programming Language',
    QUIZ_TOOL: 'Quiz Tool',
    SURVEY_TOOL: 'Survey Tool',
    SURVEY_POLL: 'Survey-Poll',
    VIDEO_QUIZ: 'Video Quiz',
    WIKI: 'Wiki',
};

Object.keys(Activity).forEach(k => {
    Activity[k].patt.model = Object.assign({}, Activity[k].patt.model, {
        tags: null,
        description: '',
        assessment: false,
        socialOrganization: SocialOrganization.GROUP,
        groupSize: 3,
        groupSizeMax: 3,
        feedbacks: [],
        motivators: [],
        duration: null,
        setting: Setting.FACE_TO_FACE_SYNCHRONOUS,
        resources: [],
        tools: [],
        note: '',
        additionalFeedbacks: {},
        additionalMotivators: {},
        additionalResources: {},
        additionalTools: {},
    });
});

export const LearningActivity = Activity;

export const Panel = {
    ADDITIONAL_SETTINGS_LIST: 'additional_settings_list',
    ADDITIONAL_SETTINGS_URL: 'additional_settings_url',
    ADDITIONAL_SETTINGS_FILE: 'additional_settings_file',
}

export const PanelType = {
    [Panel.ADDITIONAL_SETTINGS_LIST]: {},
    [Panel.ADDITIONAL_SETTINGS_URL]: {},
    [Panel.ADDITIONAL_SETTINGS_FILE]: {},
}
