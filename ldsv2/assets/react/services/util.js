import TreeModel from 'tree-model';
import {Graph, alg, json} from 'graphlib';
import uuidv4 from 'uuid/v4';
import {isNumber} from 'js/util';
import PatternHandler from 'react/design/learning_unit/design_panel/actions/data_handler';
import {StageType} from 'react/design/learning_session/allocation_panel/types';

export const Design = {
    save: {
        convertPatternObject: data => {
            let dataObj = {};
            data.forEach(d => dataObj[d.id] = d.patt);
            return Pattern.convertDataObject(dataObj);
        }
    },

    load: {
        convertPatternObj(patt) {
            let handler = new PatternHandler;
            patt = handler.parse(patt);
            handler.setRoot(patt);
            let convertAdditionalObject = obj => {
                Object.keys(obj).forEach(v => {
                    obj[v].data.forEach(d => {
                        d.id = uuidv4();
                    })
                });
            };
            patt.walk(n => {
                if(isNumber(n.model.posLeft) && isNumber(n.model.posTop)) {
                    n.model.pos = {
                        left: n.model.posLeft,
                        top: n.model.posTop,
                    };
                    delete n.model.posLeft;
                    delete n.model.posTop;
                }
                if(n.model.additionalFeedbacks) convertAdditionalObject(n.model.additionalFeedbacks);
                if(n.model.additionalMotivators) convertAdditionalObject(n.model.additionalMotivators);
                if(n.model.additionalResources) convertAdditionalObject(n.model.additionalResources);
                if(n.model.additionalTools) convertAdditionalObject(n.model.additionalTools);
            });
            patt.walk(n => {
                handler.setCurrent(n);
                if(n.model.dependencies) {
                    let conns = n.model.dependencies;
                    handler.updateDependencies(conns)
                           .updateSequence();
                }
            });
            return patt;
        }
    },

    loadPartial: {
        convertOutcomes(data) {
            let outcomes = [];
            Object.keys(data)
                .forEach(k => {
                    let d = data[k];
                    d.id = k;
                    outcomes.push(d);
                });
            outcomes.sort((a, b) => a.pos - b.pos)
                .forEach(o => (delete o.pos));
            return outcomes;
        },

        convertUnits(data) {
            let units = [];
            Object.keys(data)
                .forEach(k => {
                    let d = data[k];
                    d.id = k;
                    units.push(d);
                });
            units.sort((a, b) => a.pos - b.pos)
                .forEach(o => (delete o.pos));
            return units;
        },
    },
}

export const Outcome = {
    convertDataObject: data => {
        let obj = {};
        data.forEach((d, i) => {
            obj[d.id] = Object.assign({}, d, {pos: i});
            delete obj[d.id].id;
        });
        return obj;
    }
};

export const Unit = {
    convertDataObject(data) {
        let obj = {};
        data.forEach((d, i) => {
            obj[d.id] = Object.assign({}, d, {pos: i});
            delete obj[d.id].id;
            delete obj[d.id].teachingTime;
            delete obj[d.id].selfStudyTime;
        });
        return obj;
    }
};

export const Pattern = {
    convertDependencies(parent) {
        let parentId = parent.model.id;
        let dependencies = parent.model.dependencies;
        let results = [];
        if(dependencies) {
            let g = json.read(dependencies.graph);
            g.edges().forEach(e => {
                results.push({
                    parentId,
                    sourceId: e.v,
                    targetId: e.w,
                });
            });
            dependencies.rootIds.forEach(rootId => {
                results.push({
                    parentId,
                    sourceId: null,
                    targetId: rootId,
                });
            })
        }
        return results;
    },

    convertDataObject(data) {
        let tree = new TreeModel;
        let result = {};
        let convertAdditionalObject = obj => {
            Object.keys(obj).forEach(v => {
                obj[v].data.forEach((d, i) => {
                    d.pos = i;
                    delete d.id;
                })
            });
        };
        Object.keys(data)
            .forEach(id => {
                let patt = data[id];
                let root = tree.parse(JSON.parse(JSON.stringify(patt.model)));
                root.walk(n => {
                    if(n.model.dependencies != undefined)
                        n.model.dependencies = Pattern.convertDependencies(n);
                    delete n.model.sequenceMap;
                    if(n.model.pos) {
                        n.model.posLeft = n.model.pos.left;
                        n.model.posTop = n.model.pos.top;
                    }
                    delete n.model.pos;
                    if(n.model.additionalFeedbacks) convertAdditionalObject(n.model.additionalFeedbacks);
                    if(n.model.additionalMotivators) convertAdditionalObject(n.model.additionalMotivators);
                    if(n.model.additionalResources) convertAdditionalObject(n.model.additionalResources);
                    if(n.model.additionalTools) convertAdditionalObject(n.model.additionalTools);
                });
                result[id] = root.model;
            })
        return result;
    }
};

export const Session = {
    convertDataObject: data => {
        let obj = {};
        data.forEach((d, i) => {
            obj[d.id] = Object.assign({}, d, {
                pos: d.stage == StageType.POST ? 10000 : i,
            });
            delete obj[d.id].id;
        });
        return obj;
    }
};
