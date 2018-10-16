import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import DataHandler from '../../design_panel/actions/data_handler';
import {loadClonedUserPattern, applyPatternChange} from '../../design_panel/actions/pattern';
import {ImportAction} from '../types';

const appStateName = AppStateName.DESIGN_APP;

export const reset = () => ({type: ImportAction.RESET});

export const importPattern = patt => (dispatch, getState) => {
    const {courseId, uuidv5Namespace} = Config.get(getState(), appStateName);
    let srcPatterns = [{patt}];
    let handler = new DataHandler;
    let data = handler.importClone(srcPatterns, {courseId, uuidv5Namespace}, {})
        .map(p => Object.assign({}, p, {id: p.patt.model.id}));
    dispatch(loadClonedUserPattern(data[0]));
    dispatch(applyPatternChange());
};
