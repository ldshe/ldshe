import alertify from 'alertify.js';
import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import createHashHistory from 'history/createHashHistory';
import {Router, Route, Switch} from 'react-router-dom';
import {routerMiddleware, ConnectedRouter} from 'react-router-redux'
import {createEpicMiddleware} from 'redux-observable';
import thunkMiddleware from 'redux-thunk';
import {ListType as DesignListType} from 'react/design/design_list/types';
import {ListType as PatternListType} from 'react/design/pattern_list/types';
import {ListType as GroupListType} from 'react/design/group/group_list/types';
import {NotificationAlert} from 'react/design/notification';
import Http from '../http_errors';
import Http404 from '../http_errors/http_404';
import createDesignReducers from './reducers';
import {epics as designEpics} from './epics';
import {readOnlyMiddleware, patternDesignMiddleware} from './middlewares';
import Landing from './pages/landing';
import DesignCreate from './pages/design_create';
import DesignEdit from './pages/design_edit';
import DesignPreview from './pages/design_preview';
import DesignPrintable from './pages/design_printable';
import DesignTakeover from './pages/design_takeover';
import PatternCreate from './pages/pattern_create';
import PatternEdit from './pages/pattern_edit';
import PatternPreview from './pages/pattern_preview';
import PatternLanding from './pages/pattern_landing';
import PatternTakeover from './pages/pattern_takeover';
import GroupBase from './pages/group_base';
import GroupLanding from './pages/group_landing';
import GroupCreate from './pages/group_create';
import GroupEdit from './pages/group_edit';
import GroupPreview from './pages/group_preview';
import MemberEdit from './pages/member_edit';
import Base from './pages/base';

export default (props) => {
    const history = createHashHistory({
        getUserConfirmation: (message, callback) => {
            alertify
              .theme('bootstrap')
              .okBtn('Leave anyway')
              .cancelBtn('Stay')
              .confirm(message, e => {
                  e.preventDefault();
                  callback(true);
              }, e => {
                  e.preventDefault();
                  callback(false);
              });
        },
    });

    const store = createStore(
        createDesignReducers(JSON.parse(props['data-user'])),
        applyMiddleware(
            createEpicMiddleware(designEpics),
            thunkMiddleware,
            routerMiddleware(history),
            readOnlyMiddleware,
            patternDesignMiddleware,
        ),
    );

    return (
        <Provider store={store}>
            <Base history={history}>
                <ConnectedRouter history={history}>
                    <Switch>
                        <Route exact path="/" component={Landing} />
                        <Route path="/my" render={() => <Landing initListType={DesignListType.MY}/>}/>
                        <Route path="/curated" render={() => <Landing initListType={DesignListType.CURATOR}/>}/>
                        <Route path="/public" render={() => <Landing initListType={DesignListType.PUBLIC}/>}/>
                        <Route path="/shared" render={() => <Landing initListType={DesignListType.OTHERS}/>}/>
                        <Route path="/contributed" render={() => <Landing initListType={DesignListType.PENDING_REQUESTS}/>}/>
                        <Route path="/create" component={DesignCreate}/>
                        <Route path="/edit/:courseId" component={DesignEdit}/>
                        <Route path="/preview/:courseId" component={DesignPreview}/>
                        <Route path="/printable/:courseId" component={DesignPrintable}/>
                        <Route path="/takeover/:courseId" component={DesignTakeover}/>
                        <Route exact path="/pattern" component={PatternLanding} />
                        <Route path="/pattern/my" render={() => <PatternLanding initListType={PatternListType.MY}/>}/>
                        <Route path="/pattern/curated" render={() => <PatternLanding initListType={PatternListType.CURATOR}/>}/>
                        <Route path="/pattern/public" render={() => <PatternLanding initListType={PatternListType.PUBLIC}/>}/>
                        <Route path="/pattern/shared" render={() => <PatternLanding initListType={PatternListType.OTHERS}/>}/>
                        <Route path="/pattern/contributed" render={() => <PatternLanding initListType={PatternListType.PENDING_REQUESTS}/>}/>
                        <Route path="/pattern/create" component={PatternCreate}/>
                        <Route path="/pattern/edit/:collectId" component={PatternEdit}/>
                        <Route path="/pattern/preview/:collectId" component={PatternPreview}/>
                        <Route path="/pattern/takeover/:collectId" component={PatternTakeover}/>
                        <Route exact path="/group" render={props => <GroupBase {...props} component={GroupLanding}/>}/>
                        <Route path="/group/create" render={props => <GroupBase {...props} component={GroupCreate}/>}/>
                        <Route exact path="/group/edit/:groupId" render={props => <GroupBase {...props} component={GroupEdit}/>}/>
                        <Route exact path="/group/preview/:groupId" render={props => <GroupBase {...props} component={GroupPreview}/>}/>
                        <Route path="/group/edit/:groupId/member" render={props => <GroupBase {...props} component={MemberEdit}/>}/>
                        <Route path="/http" component={Http}/>
                        <Route component={Http404} />
                    </Switch>
                </ConnectedRouter>
                <NotificationAlert history={history}/>
            </Base>
        </Provider>
    );
}
