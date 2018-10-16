import graphlib from 'graphlib';

export const Graph = graphlib.Graph;

const alg = {
    heads: g => {
        let results = [];
        let vs = graphlib.alg.components(g);
        vs.forEach(vs => {
            let heads = [];
            vs.forEach(v => {
                if(g.inEdges(v).length == 0) heads.push(v);
            });
            if(heads.length > 0) results.push(heads);
        });
        return results;
    },

    asap: (g, source, weight=() => 1, isPartial=false) => {
        let result  = {};
        let traversal = v => {
            let predecessors = g.predecessors(v);
            let maxWeight = predecessors.reduce((c, p) => {
                let pT = result[p] ? result[p].time : -1;
                return Math.max(pT, c);
            }, -1);
            result[v] = (predecessors.length > 0) ? {time: maxWeight + weight(v)} : {time: weight(v)}
            g.successors(v).forEach(c => traversal(c));
        };
        if(isPartial) {
            traversal(source);
        } else {
            let heads = alg.heads(g);
            heads.filter(vs => vs.includes(source))
                .forEach(vs => {
                    vs.forEach(v => result[v] = {time: weight(v)});
                    vs.forEach(v => traversal(v));
                });
        }
        return result;
    },
}

export const extAlg = Object.assign({}, graphlib.alg, alg);

export const json = graphlib.json;
