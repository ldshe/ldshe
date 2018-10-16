import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import TreeModel from 'tree-model';
import {Graph, extAlg as alg, json} from 'js/graphlib';

export default class DataHandler {

    constructor(p, c=null) {
        this.tree = new TreeModel();
        this.p = p ? this.clone(p) : null;

        if(p && c) {
            if(p.model.id == c.model.id)
                this.c = this.p;
            else
                this.c = this.p.first(n => n.model.id == c.model.id);
        }
    }

    setRoot(p) {
        this.p = p;
    }

    setCurrent(c) {
        if(this.p.model.id == c.model.id)
            this.c = this.p;
        else
            this.c = this.p.first(n => n.model.id == c.model.id);
    }

    assignPattIds(p, cloned, ns, idMap, setRef) {
        let uuidGen = () => uuidv5(`course.${ns.courseId}.${uuidv4()}`, ns.uuidv5Namespace.pattern);
        this.assignNewIds(p, cloned, uuidGen, idMap, setRef);
    }

    assignCollectIds(p, cloned, ns, idMap, setRef) {
        let uuidGen = () => uuidv5(`user.${ns.user.id}.${uuidv4()}`, ns.uuidv5Namespace.pattern);
        this.assignNewIds(p, cloned, uuidGen, idMap, setRef);
    }

    assignNewIds(p, cloned, uuidGen, idMap, setRef) {
        p.walk(n => idMap[n.model.id] = uuidGen());
        cloned.walk(n => {
            if(setRef) n.model.ref = n.model.id;
            n.model.id = idMap[n.model.id];
            let dependencies = n.model.dependencies;
            if(dependencies) {
                let {rootIds, graph} = dependencies;
                dependencies.rootIds = rootIds.map(rootId => idMap[rootId]);
                dependencies.graph.edges.forEach(e => {
                    e.v = idMap[e.v];
                    e.w = idMap[e.w];
                });
                dependencies.graph.nodes.forEach(n => {
                    n.v = idMap[n.v];
                    n.value.id = idMap[n.value.id];
                    if(n.parent) n.parent = idMap[n.parent];
                });
            }
            let sequenceMap = n.model.sequenceMap;
            if(sequenceMap) {
                let newSequenceMap = {};
                Object.keys(sequenceMap)
                      .forEach(k => newSequenceMap[idMap[k]] = sequenceMap[k]);
                n.model.sequenceMap = newSequenceMap;
            }
        });
    }

    clone(p, reAssignIds=false, ns) {
        let cloned = this.tree.parse(JSON.parse(JSON.stringify(p.model)));
        if(reAssignIds) {
            if(ns.courseId)
                this.assignPattIds(p, cloned, ns, {}, true);
            else
                this.assignCollectIds(p, cloned, ns, {}, true);
        }
        return cloned;
    }

    shadowCloneModel(model) {
        model = JSON.parse(JSON.stringify(model));
        delete model.children;
        delete model.dependencies;
        delete model.sequenceMap;
        return model;
    }

    importClone(data, ns, idMap) {
        return data.map(d => {
            let p = d.patt;
            let cloned = this.tree.parse(JSON.parse(JSON.stringify(p.model)));
            this.assignPattIds(p, cloned, ns, idMap, false);
            return Object.assign({}, d, {patt: cloned});
        }).map(d => {
            let p = d.patt;
            p.walk(n => {
                if(n.model.ref)
                    n.model.ref = idMap[n.model.ref] ? idMap[n.model.ref] : n.model.ref;
            });
            return d;
        });
    }

    exportClone(data, ns, idMap={}) {
        return data.map(d => {
            let p = d.patt;
            let cloned = this.tree.parse(JSON.parse(JSON.stringify(p.model)));
            this.assignCollectIds(p, cloned, ns, idMap, false);
            return Object.assign({}, d, {patt: cloned});
        });
    }

    parse(p) {
        return this.tree.parse(p);
    }

    addChild(child) {
        if(this.c) {
            this.c.addChild(child);
        }
        return this;
    }

    removeChild(id) {
        if(this.c) {
            return this.c.first(n => n.model.id == id).drop();
        }
        return null;
    }

    updatePosition(id, pos) {
        if(this.c)
            this.c.first(n => n.model.id == id).model.pos = pos;
        return this;
    }

    updateDependencies(conns, newNode, delId) {
        if(this.c) {
            if(newNode) {
                let source = this.shadowCloneModel(newNode.model);
                let dependencies = this.c.model.dependencies || {rootIds: [], graph: {options: {directed: true, multigraph: false, compound: true}}};
                dependencies.rootIds.push(source.id);
                let g = json.read(dependencies.graph);
                g.setNode(source.id, source);
                dependencies.graph = json.write(g);
                this.c.model.dependencies = dependencies;
            } else {
                if(!conns && delId) {
                    let dependencies = this.c.model.dependencies;
                    if(dependencies) {
                        let g = json.read(dependencies.graph);
                        conns = g.edges()
                            .map(e => ({sourceId: e.v, targetId: e.w}))
                            .filter(({sourceId, targetId}) => sourceId != delId && targetId != delId);
                    }
                }

                if(!conns) {
                    let dependencies = this.c.model.dependencies;
                    if(dependencies) {
                        let g = json.read(dependencies.graph);
                        conns = g.edges().map(e => ({
                            sourceId: e.v,
                            targetId: e.w,
                        }));
                    }
                }

                if(conns) {
                    let subNodes = this.c.children || [];
                    let g = new Graph({directed: true, compound: true});
                    subNodes.forEach(n => {
                        n = this.shadowCloneModel(n.model);
                        g.setNode(n.id, n);
                    });
                    conns.forEach(c => {
                        if(c.sourceId) {
                            g.setEdge(c.sourceId, c.targetId);
                            try {
                                g.setParent(c.targetId, c.sourceId);
                            } catch(e) {
                                g.removeEdge(c.sourceId, c.targetId)
                            }
                        }
                    });
                    let heads = alg.heads(g);
                    let rootIds = [];
                    heads.forEach(ids => {
                        ids.sort((a, b) => {
                            let aPos = g.node(a).pos;
                            let bPos = g.node(b).pos;
                            return (aPos.left+aPos.top) - (bPos.left+bPos.top);
                        });
                        rootIds.push(ids[0]);
                    });
                    rootIds.sort((a, b) =>{
                        let aPos = g.node(a).pos;
                        let bPos = g.node(b).pos;
                        return (aPos.left+aPos.top) - (bPos.left+bPos.top);
                    });

                    this.c.model.dependencies = {
                        rootIds,
                        graph: json.write(g),
                    };
                }
            }
        }
        return this;
    }

    updateSequence() {
        if(this.c) {
            let dependencies = this.c.model.dependencies;
            if(dependencies) {
                let seqMap = {};
                let pos = 1;
                let {rootIds, graph} = dependencies;
                let g = json.read(graph);
                rootIds.forEach(rootId => {
                    let path = alg.asap(g, rootId, n => {
                        let {left, top} = g.node(n).pos;
                        return 1 + (left+top) / 10000;
                    });
                    Object.keys(path)
                        .map(k => {
                            path[k].id = k;
                            return path[k];
                        })
                        .sort((a, b) => a.time - b.time)
                        .forEach(p => {
                            seqMap[p.id] = pos++;
                        });
                });
                this.c.model.sequenceMap = seqMap;
            }
        }
        return this;
    }

    editRoot() {
        return this.p;
    }

    currEditNode() {
        return this.c;
    }

    dependencies() {
        return this.d;
    }
}
