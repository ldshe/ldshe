import {Action as AppAction} from 'react/app/design/types';
import {Action as OutcomeAction} from './types';
import createReducers from 'react/components/sortable_list/reducers';

const initList = {
    data: [],
};

const {list} = createReducers(OutcomeAction, initList);

export const learningOutcome = (state, action) => {

    switch (action.type) {

        case AppAction.LOAD_DESIGN_COMPLETE: {
            let data = action.payload.data.outcomes;
            return Object.assign({}, state, {data});
        }

        case OutcomeAction.PARTIAL_UPDATE: {
            const {data} = action.payload;
            return Object.assign({}, state, {data});
        }

        default:
            return list(state, action);
    }
};
