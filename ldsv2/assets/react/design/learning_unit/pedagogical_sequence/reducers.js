import {Action as AppAction} from 'react/app/design/types';
import createReducers from 'react/components/sortable_list/reducers';
import {Action as UnitAction} from './types';

const initList = {
    data: [],
};

const {list} = createReducers(UnitAction, initList);

export default (state, action) => {

    switch (action.type) {

        case AppAction.LOAD_DESIGN_COMPLETE: {
            let data = action.payload.data.units;
            data = data.map(d => {
                if(!d.selfStudyTime)  d.selfStudyTime = 0;
                if(!d.teachingTime)  d.teachingTime = 0;
                return d;
            })
            return Object.assign({}, state, {data});
        }

        case UnitAction.REMOVE_OUTCOME:
        case UnitAction.UPDATE_TEACHING_STUDY_TIME: {
            const {data} = action.payload;
            return Object.assign({}, state, {data});
        }

        case UnitAction.PARTIAL_UPDATE: {
            const {data} = action.payload;
            return Object.assign({}, state, {data});
        }

        default:
            return list(state, action);
    }
};
