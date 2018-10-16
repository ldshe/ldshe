import {Action as AppAction} from 'react/app/design/types';
import {Action as ListAction} from './types';

const initState = {
    data: [],
    succeedNum: 0,
    failedNum: 0,
};

export const notification = (state = initState, action) => {
    switch (action.type) {
        case AppAction.LOAD_NOTIFICATION_LIST_COMPLETE: {
            let {data} = action.payload;
            return Object.assign({}, state, {data});
        }

        case AppAction.JOIN_GROUP_COMPLETE: {
            let succeedNum = state.succeedNum + 1;
            return Object.assign({}, state, {succeedNum});
        }

        case AppAction.JOIN_GROUP_ERROR: {
            let failedNum = state.failedNum + 1;
            return Object.assign({}, state, {failedNum});
        }

        case ListAction.RESET: {
            return Object.assign({}, initState);
        }

        default: {
            return state;
        }
    }
};
