import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {exportPattern as exportGlobalPattern} from 'react/app/design/actions';
import DataHandler from '../../design_panel/actions/data_handler';
import {StateName as LocalPatternStateName} from '../../design_panel/types';
import {ExportAction, StateName as ExportStateName} from '../types';

const appStateName = AppStateName.DESIGN_APP;
const localPatternStateName = LocalPatternStateName.LEARNING_UNIT_PATTERN;

export const reset = () => ({type: ExportAction.RESET});

export const listLoaded = userPatts => ({type: ExportAction.LIST_LOADED, payload: {userPatts}});

export const previewLoaded = patt => ({type: ExportAction.PREVIEW_LOADED, payload: {patt}});

export const exportPattern = id => (dispatch, getState) => {
    const {user, uuidv5Namespace} = Config.get(getState(), appStateName);
    const {userPatts} = Config.get(getState(), localPatternStateName);
    let srcPatterns = userPatts.filter(u => u.id == id);
    let handler = new DataHandler;
    let data = handler.exportClone(srcPatterns, {user, uuidv5Namespace})
        .map(p => Object.assign({}, p, {id: p.patt.model.id}));
    dispatch(exportGlobalPattern(data[0]));
};
