import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {loadRecentDesignList, loadRecentSharedDesignList,
    loadRecentPatternCollectionList, loadRecentSharedPatternCollectionList,
    loadRecentGroupList} from 'react/app/front/actions';
import {StateName} from './types';
import MyDesignList from './components/my_design_list';
import SharedDesignList from './components/shared_design_list';
import MyPatternList from './components/my_pattern_list';
import SharedPatternList from './components/shared_pattern_list';
import MyGroupList from './components/my_group_list';

class RecentList extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        const {loadDesigns, loadSharedDesigns, loadPatterns, loadSharedPatterns, loadGroups} = this.props;
        loadDesigns();
        loadSharedDesigns();
        loadPatterns();
        loadSharedPatterns();
        loadGroups();
    }

    render() {
        const {designs, sharedDesigns, patterns, sharedPatterns, groups} = this.props.list;
        let els = [];
        if(designs.length > 0) els.push(<MyDesignList designs={designs}/>);
        if(patterns.length > 0) els.push(<MyPatternList patterns={patterns}/>);
        if(sharedDesigns.length > 0) els.push(<SharedDesignList designs={sharedDesigns}/>);
        if(sharedPatterns.length > 0) els.push(<SharedPatternList patterns={sharedPatterns}/>);
        if(groups.length > 0) els.push(<MyGroupList groups={groups}/>);
        let renderRow = (cols, i) => <div key={i} className="row">{cols.map((c, j) => <div key={i+j} className="col-md-6">{c}</div>)}</div>;
        let tmpEl;
        return (
            <div>{
                els.map((el, i) => {
                    if(i % 2 > 0 && i > 0) {
                        return renderRow([tmpEl, el], i-1);
                    } else {
                        if(els.length-1 == i)
                            return renderRow([el], i);
                        else
                            tmpEl = el;
                    }
                })
            }</div>
        );
    }
}

const mapStateToProps = state => ({
    list: Config.get(state, StateName.RECENT_LIST),
});

const mapDispatchToProps = dispatch => ({
    loadDesigns: () => dispatch(loadRecentDesignList()),
    loadSharedDesigns: () => dispatch(loadRecentSharedDesignList()),
    loadPatterns: () => dispatch(loadRecentPatternCollectionList()),
    loadSharedPatterns: () => dispatch(loadRecentSharedPatternCollectionList()),
    loadDesigns: () => dispatch(loadRecentDesignList()),
    loadGroups: () => dispatch(loadRecentGroupList()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RecentList);
