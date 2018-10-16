import createReducers from 'react/components/data_list/reducers';
import {initList} from 'react/components/data_list/reducers';
import {Action} from './types';

const initState = Object.assign({}, initList, {
    loadedNum: 0,
});

const {list} = createReducers(Action, initState);

export default (state, action) => {
    switch (action.type) {

        case Action.DATA_LOADED: {
            let updState = list(state, action);
            updState.loadedNum += 1;
            return updState;
        }

        default: {
            return list(state, action);
        }
    }
};
