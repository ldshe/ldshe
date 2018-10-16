import {Action as AppAction} from 'react/app/design/types';
import {Action as ItemAction} from './types';

export const initItem = {
    data: {
        name: '',
        description: '',
    },
    updatedNum: 0,
    leftNum: 0,
};

export default (state = initItem, action) => {
    switch (action.type) {
        case AppAction.LOAD_GROUP_COMPLETE: {
            let data = action.payload.data.group;
            return Object.assign({}, state, {data});
        }

        case AppAction.CONFIGURE_GROUP_COMPLETE:
        case AppAction.CONFIGURE_GROUP_ERROR: {
            let updatedNum = state.updatedNum + 1;
            return Object.assign({}, state, {updatedNum});
        }

        case AppAction.LEAVE_GROUP_COMPLETE: {
            let leftNum = state.leftNum + 1;
            return Object.assign({}, state, {leftNum});
        }

        case ItemAction.RESET: {
            let state = initItem;
            return Object.assign({}, state);
        }

        case ItemAction.FIELD_CHANGE: {
            let {field} = action.payload;
            const data = Object.assign({}, state.data, field);
            return Object.assign({}, state, {data});
        }

        default:
            return state;
    }
};
