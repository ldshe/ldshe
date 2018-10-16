import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, Redirect} from 'react-router-dom';
import {Config} from 'js/util';
import AppContext from 'react/app/design/context/app';
import {loadPatternCollectionList,
        copyPatternCollection, copyCuratedPatternCollection, importPatternCollection as importPattern,
        removePatternCollection, removeCuratedPatternCollection,
        loadPatternCollectionConfig, configurePatternCollection,
        contributePatternCollection, reviewPatternCollection,
        loadEmbeddedGroupList} from 'react/app/design/actions';
import {StateName, ListType} from './types';
import {jumpNextPage, jumpBackPage, jumpToPage, toggleSortColumn, searchContent, clearFilter, filterContent, changeItemNum,
        reset, switchList, setEditCollection, resetSettings} from './actions';
import MyPatternList from './components/my_pattern_list';
import CuratorPatternList from './components/curator_pattern_list';
import PendingPatternList from './components/pending_pattern_list';
import SharedPatternList from './components/shared_pattern_list';

class PatternList extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.listType != nextProps.initListType) {
            return {
                listType: nextProps.initListType || ListType.MY,
                switchList: true,
            };
        }
        if(prevState.loadedNum != nextProps.list.loadedNum) {
            return {
                isLoading: false,
                loadedNum: nextProps.list.loadedNum,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.onLoad = this.onLoad.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.renderControl = this.renderControl.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderList = this.renderList.bind(this);
        this.state = {
            isLoading: false,
            isCreate: false,
            listType: props.initListType || ListType.MY,
            switchList: false,
            loadedNum: 0,
        }
    }

    componentDidMount() {
        const {initListType} = this.props;
        const {handleSwitchList} = this.props;
        let listType = initListType || ListType.MY;
        handleSwitchList(listType);
        this.onLoad(listType);
    }

    componentDidUpdate() {
        const {listType, switchList} = this.state;
        if(switchList) {
            const {handleSwitchList} = this.props;
            handleSwitchList(listType);
            this.onLoad(listType);
            this.setState({switchList: false});
            return;
        }
    }

    componentWillUnmount() {
        const {reset} = this.props;
        reset();
    }

    onLoad(type) {
        const {loadPatternList} = this.props;
        this.setState({isLoading: true});
        loadPatternList(type);
    }

    onCreate(e) {
        e.preventDefault();
        this.setState({isCreate: true});
    }

    handleRefresh(type) {
        const {loadPatternList} = this.props;
        this.setState({isLoading: true});
        loadPatternList(type);
    }

    renderControl() {
        const {currListType} = this.props.list;
        if(currListType == ListType.MY) {
            return (
                <nav className="navbar">
                    <form className="navbar-form navbar-right">
                        <button type="button" className="btn btn-sm btn-primary pull-right" onClick={this.onCreate}>
                            <i className="fa fa-plus"></i>
                            {' New Pattern'}
                        </button>
                    </form>
                </nav>
            );
        } else {
            return null;
        }
    }

    renderLoading() {
        return (
            <div className="pc">
                {this.renderControl()}
                <div className="loading">
                    <i className="fa fa-spinner fa-spin fa-2x fa-fw"></i>
                </div>
            </div>
        );
    }

    renderList(getAlertify) {
        const {list} = this.props;
        const {handleFilter, handleClearFilter, handleChangeItemNum, handleSearch,
               handleSort, handleNext, handleBack, handleJumpTo,
               handleCopy, handleCuratedCopy, handleImport,
               handleDelete, handleCuratedDelete, loadPatternList,
               setEditCollection, resetSettings, loadPatternConfig, loadGroupList, configurePattern, contributePattern, reviewPattern} = this.props;
        const {currListType} = list;

        let props = {
            list,
            handleFilter,
            handleClearFilter,
            handleChangeItemNum,
            handleSearch,
            handleRefresh: this.handleRefresh,
            handleSort,
            handleNext,
            handleBack,
            handleJumpTo,
            handleCopy,
            handleCuratedCopy,
            handleImport,
            handleDelete,
            handleCuratedDelete,
            loadPatternList,
            setEditCollection,
            resetSettings,
            loadPatternConfig,
            loadGroupList,
            configurePattern,
            contributePattern,
            reviewPattern,
            getAlertify,
        };
        return (
            <div className="pc">
                {this.renderControl()}
                {(() => {
                    switch(currListType) {
                        case ListType.MY:
                        return <MyPatternList {...props}/>;

                        case ListType.GROUP:
                        return <SharedPatternList {...props}/>;

                        case ListType.CURATOR:
                        return <CuratorPatternList {...props}/>;

                        case ListType.PENDING_REQUESTS:
                        return <PendingPatternList {...props}/>;

                        default:
                        return <SharedPatternList {...props}/>;
                    }
                })()}
            </div>
        );
    }

    render() {
        const {isCreate, isLoading} = this.state;
        const {currListType} = this.props.list;
        if(isCreate) {
            return <Redirect to="/pattern/create"/>;
        } else {
            let title = "";
            switch(currListType) {
                case ListType.MY:
                    title = 'My Patterns'; break;
                case ListType.GROUP:
                    title = null; break;
                case ListType.CURATOR:
                    title = 'Public Patterns'; break;
                case ListType.PUBLIC:
                    title = 'Public Patterns'; break;
                case ListType.OTHERS:
                    title = 'Shared Patterns'; break;
                case ListType.PENDING_REQUESTS:
                    title = 'Contributed Patterns'; break;
            }
            return (
                <AppContext.Consumer>
                    {({getAlertify}) => (
                        <div>
                            {title ? <h3>{title}</h3> : null}
                            {isLoading ?
                            this.renderLoading() :
                            this.renderList(getAlertify)}
                        </div>
                    )}
                </AppContext.Consumer>
            );
        }
    }
}

const mapStateToProps = state => ({
    list: Config.get(state, StateName.PATTERN_LIST),
});

const mapDispatchToProps = dispatch => ({
    loadPatternList: type => dispatch(loadPatternCollectionList(type)),
    loadGroupList: () => dispatch(loadEmbeddedGroupList()),
    handleNext: () => dispatch(jumpNextPage()),
    handleBack: () => dispatch(jumpBackPage()),
    handleJumpTo: page => dispatch(jumpToPage(page)),
    handleSort: idx => dispatch(toggleSortColumn(idx)),
    handleSearch: keywords => dispatch(searchContent(keywords)),
    handleFilter: (key, value) => dispatch(filterContent(key, value)),
    handleClearFilter: () => dispatch(clearFilter()),
    handleChangeItemNum: itemNum => dispatch(changeItemNum(itemNum)),
    handleCopy: id => dispatch(copyPatternCollection(id)),
    handleCuratedCopy: id => dispatch(copyCuratedPatternCollection(id)),
    handleImport: id => dispatch(importPattern(id)),
    handleDelete: id => dispatch(removePatternCollection(id)),
    handleCuratedDelete: id => dispatch(removeCuratedPatternCollection(id)),
    reset: () => dispatch(reset()),
    handleSwitchList: listType => dispatch(switchList(listType)),
    setEditCollection: id => dispatch(setEditCollection(id)),
    resetSettings: () => dispatch(resetSettings()),
    loadPatternConfig: id => dispatch(loadPatternCollectionConfig(id)),
    configurePattern: (id, data) => dispatch(configurePatternCollection(id, data)),
    contributePattern: id => dispatch(contributePatternCollection(id)),
    reviewPattern: (id, status) => dispatch(reviewPatternCollection(id, status)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PatternList);
