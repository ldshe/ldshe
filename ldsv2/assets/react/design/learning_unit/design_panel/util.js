import classnames from 'classnames';
import TreeModel from 'tree-model';
import {Graph, extAlg as alg, json} from 'js/graphlib';
import {PatternType, LearningType, SocialOrganization, Motivator, Resource} from './types';

export const getPatternClassName = p => {
    p = p.model;
    if(p.pattType == PatternType.COMPOSITE)
        return classnames({comp: true});
    else {
        switch(p.subType) {
            case LearningType.REVISION:
                return classnames({rev: true});
            case LearningType.REFLECTION:
                return classnames({ref: true});
            case LearningType.SELF_OR_PEER_ASSESSMENT:
                return classnames({spa: true});
            case LearningType.CONCEPTUAL_OR_VISUAL_ARTEFACTS:
                return classnames({ccv: true});
            case LearningType.TANGIBLE_MANIPULABLE_ARTIFACT:
                return classnames({ctm: true});
            case LearningType.PRESENTATIONS_PERFORMANCE_ILLUSTRATION:
                return classnames({ppi: true});
            case LearningType.TANGIBLE_OR_IMMERSIVE_INVESTIGATION:
                return classnames({tii: true});
            case LearningType.EXPLORATIONS_THROUGH_CONVERSATION:
                return classnames({eic: true});
            case LearningType.INFORMATION_EXPLORATION:
                return classnames({ie: true});
            case LearningType.TEST_ASSESSMENT:
                return classnames({ta: true});
            case LearningType.PRACTICE:
                return classnames({pra: true});
            case LearningType.RECEIVING_AND_INTERPRETING_INFORMATION:
                return classnames({rii: true});
        }
    }
};

export const getDefaultActivityName = type => {
    switch(type) {
        case LearningType.REVISION:
            return 'Revision';
        case LearningType.REFLECTION:
            return 'Reflection';
        case LearningType.SELF_OR_PEER_ASSESSMENT:
            return 'Self-/Peer-assessment';
        case LearningType.CONCEPTUAL_OR_VISUAL_ARTEFACTS:
            return 'Construction: Conceptual / Visual Artefacts';
        case LearningType.TANGIBLE_MANIPULABLE_ARTIFACT:
            return 'Construction: Tangible / Manipulable Artifacts';
        case LearningType.PRESENTATIONS_PERFORMANCE_ILLUSTRATION:
            return 'Presentations, Performance Illustrations';
        case LearningType.TANGIBLE_OR_IMMERSIVE_INVESTIGATION:
            return 'Tangible / Immersive Investigation';
        case LearningType.EXPLORATIONS_THROUGH_CONVERSATION:
            return 'Explorations through Conversation';
        case LearningType.INFORMATION_EXPLORATION:
            return 'Information Exploration';
        case LearningType.TEST_ASSESSMENT:
            return 'Test / Assessment';
        case LearningType.PRACTICE:
            return 'Practice';
        case LearningType.RECEIVING_AND_INTERPRETING_INFORMATION:
            return 'Receiving & Interpreting Information';
        default:
            return type;
    }
}

export const getSocialOrganizationName = type => {
    switch(type) {
        case SocialOrganization.GROUP:
            return 'Group';
        case SocialOrganization.INDIVIDUAL:
            return 'Individual';
        case SocialOrganization.PEER_REVIEW:
            return 'Peer-review';
        case SocialOrganization.WHOLE_CLASS:
            return 'Whole Class';
        default:
            return type;
    }
}

export const getMotivatorName = type => {
    switch(type) {
        case Motivator.BADGES:
            return 'Badges';
        case Motivator.LEADERBOARD:
            return 'Leaderboard';
        case Motivator.PEER_COMPETITION:
            return 'Peer Competition';
        case Motivator.PEER_RESPONSE_QUANTITY_AND_QUALITY:
            return 'Peer Response (Quantity and Quality)';
        case Motivator.SCORE:
            return 'Score';
        case Motivator.TEAM_AGENCY:
            return 'Team Agency';
        case Motivator.INDIVIDUAL_AGENCY:
            return 'Individual Agency';
        case Motivator.EXTRA_ACTIVITIES:
            return 'Extra Activities';
        default:
            return type;
    }
}

export const getResourceName = type => {
    switch(type) {
        case Resource.ADDITIONAL_EXAMPLES:
            return 'Additional Examples';
        case Resource.ASSESSMENT_RUBRIC:
            return 'Assessment Rubric';
        case Resource.AUDIO:
            return 'Audio';
        case Resource.BOOK:
            return 'Book';
        case Resource.BOOK_CHAPTER:
            return 'Book Chapter';
        case Resource.CHECKLIST:
            return 'Checklist';
        case Resource.COURSE_SESSION_OUTLINE:
            return 'Course / Session Outline';
        case Resource.DEMO_VIDEO:
            return 'Demo Video';
        case Resource.DISCUSSION_QUESTIONS:
            return 'Discussion Questions';
        case Resource.INTERACTIVE_LEARNING_MATERIAL:
            return 'Interactive Learning Material';
        case Resource.LECTURE_TEXT:
            return 'Lecture Text';
        case Resource.LECTURE_VIDEO:
            return 'Lecture Video';
        case Resource.PAPER:
            return 'Paper';
        case Resource.PPT_SLIDES:
            return 'PPT Slides';
        case Resource.QUIZ:
            return 'Quiz';
        case Resource.SAMPLE_WORK_BY_STUDENTS:
            return 'Sample Work by Students';
        case Resource.SURVEY:
            return 'Survey';
        case Resource.TASK_EXAMPLE:
            return 'Task Example';
        case Resource.TEMPLATE:
            return 'Template';
        case Resource.TUTORIAL_TEXT:
            return 'Tutorial Text';
        case Resource.TUTORIAL_VIDEO:
            return 'Tutorial Video';
        case Resource.VIDEO:
            return 'Video';
        case Resource.WEBSITE:
            return 'Website';
        case Resource.WORKSHEET:
            return 'Worksheet';
        case Resource.WRITING_TEMPLATE:
            return 'Writing Template';
        default:
            return type;
    }
}

export const snapToGrid = (x, y, scale=1) => {
    const snappedX = Math.floor(Number(x) / scale / 10) * 10;
    const snappedY = Math.floor(Number(y) / scale / 10) * 10;
    return [snappedX, snappedY];
};

export const comparePattern = (pA, pB) => {
    let nA = pA.patt.model.fullname.toUpperCase();
    let nB = pB.patt.model.fullname.toUpperCase();
     if (nA < nB) return -1;
     if (nA > nB) return 1;
     return 0;
};

export const autoAlignment = props => {
    let {g, id, initLeft, initTop, nodeW, nodeH, padW, padH, isPartial} = props;
    let path = alg.asap(g, id, n => 1 + g.node(n).pos.left / 10000, isPartial);
    let nodes = [];
    for(let id in path) nodes.push({id, time: path[id].time});
    nodes.sort((a, b) => a.time - b.time)
        .forEach(n => n.time = Math.floor(n.time));

    let mergedNodes = [];
    let t = 0;
    nodes.forEach(n => {
        if(t==0 || t != n.time) {
            mergedNodes.push([n]);
            t = n.time;
        } else {
            mergedNodes[mergedNodes.length-1].push(n);
        }
    });

    let depth = 0;
    let maxDepth = mergedNodes.length;
    let nodeHalfW = nodeW/2;
    let x;
    let y = initTop;
    let pos = {};
    while(depth++ < maxDepth) {
        let nodes = mergedNodes.shift();
        if(depth == 1) {
            if(nodes.length > 1)
                initLeft += (nodeW+padW) * (nodes.length-1)/2;
        } else {
            y += nodeH + padH;
        }
        if(nodes.length % 2 == 0) {
            x = (nodeW+padW) * nodes.length/2;
            x -= nodeHalfW + padW/2;
        } else {
            x = (nodeW+padW) * Math.floor(nodes.length/2);
        }
        x = initLeft - x;
        nodes.forEach(n => {
            pos[n.id] = {left: x, top: y}
            x += nodeW+padW;
        });
    }
    return pos;
};
