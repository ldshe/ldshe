import {push} from 'react-router-redux';
import {Observable} from 'rxjs/Rx';
import {Config} from 'js/util';
import {Action, StateName, EditPage} from '../types';
import {redirectErrorPage} from '../actions';

export const httpErrorEpic = (action$, store) =>
    action$.ofType(
        Action.GENERAL_HTTP_ERROR,
        Action.LOCK_DESIGN_RESOURCE_ERROR,
        Action.KEEP_DESIGN_ALIVE_ERROR,
        Action.LOAD_DESIGN_LIST_ERROR,
        Action.LOAD_DESIGN_CONFIG_ERROR,
        Action.NEW_DESIGN_ERROR,
        Action.LOAD_DESIGN_ERROR,
        Action.LEARNING_CONTEXT_INIT_ERROR,
        Action.SAVE_DESIGN_CONTENT_ERROR,
        Action.LOCK_COLLECTION_RESOURCE_ERROR,
        Action.KEEP_COLLECTION_ALIVE_ERROR,
        Action.LOAD_PATTERN_COLLECTION_LIST_ERROR,
        Action.LOAD_PATTERN_COLLECTION_CONFIG_ERROR,
        Action.NEW_PATTERN_COLLECTION_ERROR,
        Action.LOAD_PATTERN_COLLECTION_ERROR,
        Action.SAVE_COLLECTION_CONTENT_ERROR,
        Action.LOAD_GROUP_LIST_ERROR,
        Action.NEW_GROUP_ERROR,
        Action.LOAD_GROUP_ERROR,
        Action.LOAD_MEMBER_LIST_ERROR,
        Action.LOAD_NOTIFICATION_LIST_ERROR,
        Action.DISMISS_NOTIFICATION_ERROR,
    ).mergeMap(({payload}) => {
        const {error} = payload;
        let pathname;
        let query = payload.query || {
            home: {
                name: 'My Designs',
                link: 'design.php',
            }
        };

        if(error.response == undefined) {
            pathname = '/http/net_err';
            return Observable.of(push({pathname}));
        }

        switch(error.response.status) {
            case 400:
                pathname = '/http/400';
            break;

            case 401:
                pathname = '/http/401';
                query.dest = location.pathname.replace(/^\//g, '')+location.hash;
            break;

            case 403:
                pathname = '/http/403';
            break;

            case 404:
                pathname = '/http/404';
            break;

            case 405:
                pathname = '/http/405';
            break;

            case 409: {
                const state = Config.get(store.getState(), StateName.DESIGN_APP);
                query.editPage = query.editPage || EditPage.DESIGN;
                if(query.editPage == EditPage.DESIGN)
                    query.courseId = state.courseId;
                else
                    query.collectId = state.collectId;
                pathname = '/http/409';
            }
            break;

            case 423: {
                const state = Config.get(store.getState(), StateName.DESIGN_APP);
                let response = error.response.data;
                query.code = response.code || 0;
                query.message = response.message || '';
                query.user = state.user || null;
                query.editPage = query.editPage || EditPage.DESIGN;
                if(query.editPage == EditPage.DESIGN)
                    query.courseId = state.courseId;
                else
                    query.collectId = state.collectId;
                pathname = '/http/423';
            }
            break;

            default:
                pathname = '/http/500';
        }
        return Observable.of(push({pathname, query}));
    });
