import {combineEpics} from 'redux-observable';
import {lockResourceEpic, keepResourceAliveEpic} from './mutex';
import {loadDesignListEpic, newDesignEpic, loadDesignEpic, importDesignEpic, removeDesignEpic, getDesignConfigEpic, configureDesignEpic, contributeDesignEpic, reviewDesignEpic} from './design';
import {autosaveEpic, autosaveEpic2} from './autosave';
import {initContextEpic, saveCourseEpic} from './course';
import {saveOutcomeEpic} from './outcome';
import {saveUnitEpic, calcTeachingStudyTimeEpic} from './unit';
import {savePatternEpic, deletePatternEpic} from './pattern';
import {saveInstanceEpic, deleteInstanceEpic} from './instance';
import {saveInstanceSettingsEpic} from './instance_settings';
import {saveSessionEpic, deleteSessionEpic} from './session';
import {savePatternEpic as saveCollectionEpic} from './collection';
import {saveSettingsEpic as saveCollectionSettingsEpic} from './collection_settings';
import {fileuploadEpic} from './file';
import {httpErrorEpic} from './http';
import {loadPatternCollectionListEpic, newPatternCollectionEpic, loadPatternCollectionEpic, importPatternCollectionEpic, loadPatternCollectionPreviewEpic, importPatternEpic, exportPatternEpic, removePatternCollectionEpic, getPatternConfigEpic, configurePatternCollectionEpic, contributePatternCollectionEpic, reviewPatternCollectionEpic} from './collection';
import {partialDesignContentUpdatedEpic, partialCollectionContentUpdatedEpic} from './partial_update';
import {loadGroupListEpic, newGroupEpic, loadGroupEpic, configureGroupEpic, removeGroupEpic, joinGroupEpic, leaveGroupEpic, loadMemberListEpic, newMemberEpic, removeMemberEpic} from './group';
import {loadNotificationListEpic, dimissNotificationEpic} from './notification';

export const epics = combineEpics(
    lockResourceEpic,
    keepResourceAliveEpic,
    loadDesignListEpic,
    newDesignEpic,
    loadDesignEpic,
    importDesignEpic,
    removeDesignEpic,
    getDesignConfigEpic,
    configureDesignEpic,
    contributeDesignEpic,
    reviewDesignEpic,
    autosaveEpic,
    autosaveEpic2,
    initContextEpic,
    saveCourseEpic,
    saveOutcomeEpic,
    saveUnitEpic,
    calcTeachingStudyTimeEpic,
    savePatternEpic,
    deletePatternEpic,
    saveInstanceEpic,
    deleteInstanceEpic,
    saveInstanceSettingsEpic,
    saveSessionEpic,
    deleteSessionEpic,
    saveCollectionEpic,
    saveCollectionSettingsEpic,
    fileuploadEpic,
    httpErrorEpic,
    loadPatternCollectionListEpic,
    newPatternCollectionEpic,
    loadPatternCollectionEpic,
    importPatternCollectionEpic,
    loadPatternCollectionPreviewEpic,
    importPatternEpic,
    exportPatternEpic,
    removePatternCollectionEpic,
    getPatternConfigEpic,
    configurePatternCollectionEpic,
    contributePatternCollectionEpic,
    reviewPatternCollectionEpic,
    partialDesignContentUpdatedEpic,
    partialCollectionContentUpdatedEpic,
    loadGroupListEpic,
    newGroupEpic,
    loadGroupEpic,
    configureGroupEpic,
    removeGroupEpic,
    joinGroupEpic,
    leaveGroupEpic,
    loadMemberListEpic,
    newMemberEpic,
    removeMemberEpic,
    loadNotificationListEpic,
    dimissNotificationEpic,
);
