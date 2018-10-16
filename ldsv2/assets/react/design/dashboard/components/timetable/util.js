import moment from 'moment';

export const convertComposite = (userPatts, ids) => {
    return ids.map(id => {
        let comp;
        let root = userPatts.filter(({patt}) => {
            let p = patt.first(n => n.model.id == id);
            if(p) {
                comp = p;
                return true;
            }
            return false;
        });
        if(root.length > 0) {
            root = root[0].patt;
            let duration = comp.all(n => true)
                .reduce((c, n) => n.model.duration ? n.model.duration+c : c, 0);
            return {
                unit: root.model.fullname ? root.model.fullname : root.model.subType,
                duration,
            };
        } else {
            return null;
        }
    })
    .filter(u => u);
};

export const rearrangeActivities = data => {
    for(let i=0; i<data.length; i++) {
        data[i].nextPre = [];
        if(i<data.length-1) data[i].nextPre = data[i+1].pre;
    }
    data.forEach(d => {
        d.activities = d.in.concat(d.post).concat(d.nextPre);
        delete d.pre;
        delete d.in;
        delete d.post;
        delete d.nextPre;
    });
    return data;
};

export const calcWeekGroups = data => {
    data.forEach(d => {
        let day = d.date.day();
        day = day >= 1 ? 1 : -6;
        d.startWeekDay = moment(d.date).day(day).hour(0).minute(0).second(0).millisecond(0);
        d.endWeekDay = moment(d.startWeekDay).day(8).millisecond(-1);
    });
    return data;
}

export const mergeWeekGroups = data => {
    let currWeekDay = null;
    let newData = [];
    data.forEach(d => {
        if(currWeekDay == null || currWeekDay.diff(d.startWeekDay) != 0) {
            currWeekDay = d.startWeekDay;
            newData.push({
                startWeekDay: d.startWeekDay,
                endWeekDay: d.endWeekDay,
                date: d.date,
                activities: d.activities,
            })
        } else {
            newData[newData.length-1].activities = newData[newData.length-1].activities.concat(d.activities);
        }
    });
    return newData;
};

export const mergeActivities = data => {
    data.forEach(d => {
        let unit = null;
        let newActivities = [];
        d.activities.forEach(s => {
            if(unit != s.unit) {
                unit = s.unit;
                newActivities.push(s);
            } else {
                newActivities[newActivities.length-1].duration += s.duration;
            }
        });
        d.activities = newActivities;
    });
    return data;
};

export const calcBreakPoint = data => {
    let weekGroups = [];
    let nextWeekDay;

    if(data.length >= 1) {
        nextWeekDay = moment(data[0].startWeekDay).day(8);
        weekGroups.push({
            startWeekDay: data[0].startWeekDay,
            endWeekDay: data[0].endWeekDay,
        });
    }

    if(data.length > 1) {
        let i=1;
        do {
            let d = data[i];
            if(nextWeekDay.diff(d.startWeekDay) != 0) {
                weekGroups.push({
                    breakPoint: true,
                    startWeekDay: moment(nextWeekDay),
                    endWeekDay: moment(d.startWeekDay).millisecond(-1),
                });
            }
            nextWeekDay = moment(d.startWeekDay).day(8);
            weekGroups.push({
                startWeekDay: d.startWeekDay,
                endWeekDay: d.endWeekDay,
            });
        } while(++i < data.length);
    }
    return weekGroups;
};

export const calcTotalDuration = (data, totalDuration={unitGroup: {}, dateGroup: {}, weekGroup: {}, total: 0}) => {
    let {unitGroup, dateGroup, weekGroup, total} = totalDuration;
    data.forEach(d => {
        let subTotal = 0;
        d.activities.forEach(a => {
            if(!unitGroup[a.unit]) unitGroup[a.unit] = 0;
            unitGroup[a.unit] += a.duration;
            subTotal += a.duration;
        });

        let date = d.date ? d.date.format('D MMM') : 'lastDate';
        if(!dateGroup[date]) dateGroup[date] = 0;
        dateGroup[date] += subTotal;

        let startWeekDay = d.startWeekDay ? d.startWeekDay.format('D MMM') : 'lastWeek';
        if(!weekGroup[startWeekDay]) weekGroup[startWeekDay] = 0;
        weekGroup[startWeekDay] += subTotal;

        total += subTotal;
    });
    return {
        unitGroup,
        dateGroup,
        weekGroup,
        total,
    };
};
