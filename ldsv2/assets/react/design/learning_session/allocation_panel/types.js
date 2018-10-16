export const StateName = {
    LEARNING_SESSION: 'learningSession',
}

const prefix = 'learning_session_';

export const Action = {
    RESET: prefix + 'reset',
    RESTORE: prefix + 'restore',
    ADD_SESSION: prefix + 'add_session',
    REMOVE_SESSION: prefix + 'remove_session',
    ADD_STAGE_ITEM: prefix + 'add_stage_item',
    REMOVE_STAGE_ITEM: prefix + 'remove_stage_item',
    REMOVE_ALL_STAGE_ITEM: prefix + 'remove_all_stage_item',
    REORDER_STAGE_ITEM: prefix + 'reorder_stage_item',
    CLEAR_STAGE_ITEM: prefix + 'clear_stage_item',
    EXPAND_STAGE_ITEM: prefix + 'expand_stage_item',
    UPDATE_ALLOCEDLOOKUP: prefix + 'update_allocedlookup',
    UPDATE_FILTER: prefix + 'update_filter',
    EXPAND_FILTER_ITEM: prefix + 'expand_filter_item',
    LOAD_DETAILS: prefix + 'load_details',
    FIELD_CHANGE: prefix + 'field_change',
    REMEMBER_SCROLL: prefix + 'remember_scroll',
    PARTIAL_UPDATE: prefix + 'partial_update',
};

export const FilterType = {
    ALL: 'all',
    REFRESH: 'refresh',
}

export const DragType = {
    UNALLOC_PATTERN: 'unalloc_pattern',
    MOVE_STAGE_ITEM: 'move_stage_item',
}

export const StageType = {
    PRE: 'pre',
    IN: 'in',
    POST: 'post',
}
