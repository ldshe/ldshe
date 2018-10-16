let latestTouchTap = {
    time: 0,
    target: null,
};

module.exports = {
    getProps: selector => {
        let $el = $(selector);
        let attrs = $el.get(0).attributes;
        let props = {};
        $(attrs).each((i, attr) => props[attr.name] = attr.value);
        return props;
    },

    isNumber: n => !isNaN(parseFloat(n)) && isFinite(n),

    isSafari: () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent),

    isString: s => typeof s === "string",

    isEmail: e => {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(e);
    },

    isDblTouchTap: e => {
        const dblTouchTapMaxDelay = 300;
        const touchTap = {
          time: new Date().getTime(),
          target: e.currentTarget,
      };
        let isFastDblTouchTap = touchTap.target === latestTouchTap.target &&
                                touchTap.time - latestTouchTap.time < dblTouchTapMaxDelay;
        latestTouchTap = touchTap;
        return isFastDblTouchTap;
    },

    caseInsensitiveSort: arr => {
        return arr.sort((a ,b) => {
            let vA = a.toUpperCase();
            let vB = b.toUpperCase();
            if (vA < vB) return -1;
            if (vA > vB) return 1;
            return 0;
        });
    },

    formatSize: (bytes, unit) => {
    	let units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    	let idx = units.indexOf(unit);
    	if(idx == -1) return undefined;

        let l = Math.min(idx, Math.log(bytes) / Math.LN2 / 10 | 0);
        return bytes / Math.pow(1024, l);
    },

    Config: {
        get: function(obj, literalKeys) {
            if(!literalKeys) return obj;
            let keys = literalKeys.split('.');
            return keys.reduce((o, k) => (o && o[k]) || {} , obj);
        },

        prefixType: function(obj, prefix) {
            let prefixed = {};
            Object.keys(obj)
                  .map(k => prefixed[k] = prefix + obj[k]);
            return prefixed;
        }
    },
}
