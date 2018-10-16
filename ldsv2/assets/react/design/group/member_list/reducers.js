import {Action as AppAction} from 'react/app/design/types';
import createReducers from 'react/components/data_list/reducers';
import {initList} from 'react/components/data_list/reducers';
import {Action as ListAction} from './types';

const initState = Object.assign({}, initList, {
    loadedNum: 0,
    createdNum: 0,
});

const {list} = createReducers(ListAction, initState);

export default (state, action) => {
    switch (action.type) {
        case AppAction.NEW_MEMBER_COMPLETE: {
            let createdNum = state.createdNum + 1;
            return Object.assign({}, state, {createdNum});
        }

        case ListAction.DATA_LOADED: {
            let updState = list(state, action);
            updState.loadedNum += 1;
            return updState;
        }

        default: {
            return list(state, action);
        }
    }
};
