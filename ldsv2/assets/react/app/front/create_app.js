import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import {createEpicMiddleware} from 'redux-observable';
import thunkMiddleware from 'redux-thunk';
import createFrontReducers from './reducers';
import {epics as frontEpics} from './epics';
import RecentList from  'react/front/recent_list';

export default (props) => {
    const store = createStore(
        createFrontReducers(),
        applyMiddleware(
            createEpicMiddleware(frontEpics),
            thunkMiddleware,
        ),
    );

    return (
        <Provider store={store}>
            <RecentList/>
        </Provider>
    );
}
