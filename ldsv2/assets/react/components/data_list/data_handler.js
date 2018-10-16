import {isNumber, isString} from 'js/util';
import {SortDir} from './types';

export default class DataHandler {

    constructor (d) {
        this.d = d;
        this.ascCompare = (oA, oB, key) => {
            let vA = oA[key];
            let vB = oB[key];
            if(isNumber(vA) && isNumber(vB)) {
                return vA - vB;
            } else {
                if(isString(vA) && isString(vB)) {
                    vA = vA.toUpperCase();
                    vB = vB.toUpperCase();
                }
                if(vA < vB)
                    return -1;
                else if(vA > vB)
                    return 1;
                else
                    return 0;
            }
        };
        this.descCompare = (oA, oB, key) => this.ascCompare(oA, oB, key) * -1;
    }

    filterDataCol(key, val, meta) {
        if(this.d.length > 0) {
            this.d = this.d.filter(d => d[key] == val);
        }
        return this;
    }

    sortDataCol(col, dir, meta) {
        if(this.d.length > 0) {
            this.d = this.d.slice();
            let key = meta[col].key;
            let compare = dir == SortDir.ASC ? this.ascCompare : this.descCompare;
            this.d.sort((oA, oB) => compare(oA, oB, key));
        }
        return this;
    }

    pageData(page, itemNum) {
        let startIdx = (page - 1) * itemNum;
        let endIdx = page * itemNum -1;
        this.d = this.d.filter((d, i) => startIdx <= i && endIdx >= i);
        return this;
    }

    searchData(keywords, meta) {
        if(keywords && (keywords = keywords.trim())) {
            let regex = new RegExp(keywords.escapeRegExp(), 'i')
            this.d = this.d.filter(item =>{
                let keys = meta.filter(m => m.searchable)
                               .map(m => m.key);
                return keys.reduce((c, k) => {
                    let val = item[k];
                    val = val && Array.isArray(val) ? val.toString() : val;
                    return c || (val && val.search(regex) != -1)
                }, false);
            });
        }
        return this;
    }

    filterOptions(meta) {
        let keys = meta.filter(m => m.filterable)
                       .map(m => m.key);
        let opts = {};
        keys.forEach(k => {
            let vals = {};
            this.d.forEach(d => {
                if(d[k]) vals[d[k]] = d[k];
            });
            opts[k] = Object.keys(vals);
        })
        return opts;
    }

    data() {
        return this.d;
    }
}
