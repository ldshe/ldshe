import {combineReducers} from 'redux';
import {recentList} from 'react/front/recent_list/reducers';

export default () => {
    return combineReducers({
        recentList,
    });
}
