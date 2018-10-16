import {partialUpdate as contextPartialUpdate} from 'react/design/learning_context/actions';
import {partialUpdate as outcomesPartialUpdate} from 'react/design/learning_outcome/actions';
import {partialUpdate as unitsPartialUpdate} from 'react/design/learning_unit/pedagogical_sequence/actions';
import {partialUpdate as instancesPartialUpdate, partialSettingsUpdate as instancesPartialSettingsUpdate, calcTeachingStudyTime} from 'react/design/learning_unit/design_panel/actions/unit';
import {partialUpdate as patternsPartialUpdate, partialDelete as patternsPartialDelete} from 'react/design/learning_unit/design_panel/actions/pattern';
import {FilterType} from 'react/design/learning_session/allocation_panel/types';
import {partialUpdate as sessionsPartialUpdate, partialDelete as sessionsPartialDelete,
    updateFilter as updateSessionFilter, refreshAllocedlookup as refreshSessionAllocedlookup,
} from 'react/design/learning_session/allocation_panel/actions';
import {partialUpdate as collectionPartialUpdate, partialSettingsUpdate as collectionPartialSettingsUpdate} from 'react/design/pattern/actions';
import {Action, StateName} from '../types';
import {loadReadableDesign, loadReadablePatternCollection, setPartialUpdate} from '../actions';

export const partialDesignContentUpdatedEpic = (action$, store) =>
    action$.ofType(Action.DESIGN_CONTENT_UPDATED)
        .mergeMap(({payload}) => {
            const {content} = payload;
            const {course, outcomes, units,
                instances, instanceSettings,
                patterns, patternsDeleted,
                sessions, sessionsDeleted,
            } = content.data;
            store.dispatch(setPartialUpdate(true));
            try {
                if(course)
                    store.dispatch(contextPartialUpdate(course));
                if(outcomes)
                    store.dispatch(outcomesPartialUpdate(outcomes));
                if(units)
                    store.dispatch(unitsPartialUpdate(units));
                if(instances)
                    store.dispatch(instancesPartialUpdate(instances));
                if(instanceSettings)
                    store.dispatch(instancesPartialSettingsUpdate(instanceSettings));
                if(patterns)
                    store.dispatch(patternsPartialUpdate(patterns));
                if(patternsDeleted)
                    store.dispatch(patternsPartialDelete(patternsDeleted));
                if(sessions)
                    store.dispatch(sessionsPartialUpdate(sessions));
                if(sessionsDeleted)
                    store.dispatch(sessionsPartialDelete(sessionsDeleted));
                if(units || instances || instanceSettings)
                    store.dispatch(calcTeachingStudyTime());
                if(units || instances || instanceSettings || sessions || sessionsDeleted) {
                    store.dispatch(updateSessionFilter(FilterType.REFRESH));
                    store.dispatch(refreshSessionAllocedlookup());
                }
            } catch(error) {
                console.error(error);
                store.dispatch(loadReadableDesign(content.courseId, true));
            }
            return Observable.of(setPartialUpdate(false));
        });

export const partialCollectionContentUpdatedEpic = (action$, store) =>
    action$.ofType(Action.COLLECTION_CONTENT_UPDATED)
        .mergeMap(({payload}) => {
            const {content} = payload;
            const {collection, collectionSettings} = content.data;
            store.dispatch(setPartialUpdate(true));
            try {
                if(collection)
                    store.dispatch(collectionPartialUpdate(collection));
                if(collectionSettings)
                    store.dispatch(collectionPartialSettingsUpdate(collectionSettings));
            } catch(error) {
                console.error(error);
                store.dispatch(loadReadablePatternCollection(content.collectId, true));
            }
            return Observable.of(setPartialUpdate(false));
        });
