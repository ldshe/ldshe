import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, Redirect} from 'react-router-dom';
import {Config} from 'js/util';
import AppContext from 'react/app/design/context/app';
import {changeEditTab, loadDesignList,
        copyDesign, copyCuratedDesign, importDesign, removeDesign, removeCuratedDesign,
        loadDesignConfig, configureDesign,
        contributeDesign, reviewDesign,
        loadEmbeddedGroupList} from 'react/app/design/actions';
import {StateName, ListType} from './types';
import {jumpNextPage, jumpBackPage, jumpToPage, toggleSortColumn, searchContent, clearFilter, filterContent, changeItemNum,
        reset, switchList, setEditCourse, resetSettings} from './actions';
import MyDesignList from './components/my_design_list';
import CuratorDesignList from './components/curator_design_list';
import PendingDesignList from './components/pending_design_list';
import SharedDesignList from './components/shared_design_list';

class DesignList extends Component {

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
        const {listType} = this.state;
        const {handleSwitchList} = this.props;
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
        const {loadDesignList} = this.props;
        this.setState({isLoading: true});
        loadDesignList(type);
    }

    onCreate(e) {
        e.preventDefault();
        this.setState({isCreate: true});
    }

    handleRefresh(type) {
        const {loadDesignList} = this.props;
        this.setState({isLoading: true});
        loadDesignList(type);
    }

    renderControl() {
        const {currListType} = this.props.list;
        if(currListType == ListType.MY) {
            return (
                <nav className="navbar">
                    <form className="navbar-form navbar-right">
                        <button type="button" className="btn btn-sm btn-primary pull-right" onClick={this.onCreate}>
                            <i className="fa fa-plus"></i>
                            {' New Design'}
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
            <div className="lc">
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
               handleSort, changeEditTab,
               handleNext, handleBack, handleJumpTo,
               handleCopy, handleCuratedCopy, handleImport, handleDelete, handleCuratedDelete, loadDesignList,
               setEditCourse, resetSettings, loadDesignConfig, loadGroupList, configureDesign, contributeDesign, reviewDesign} = this.props;
        const {currListType} = list;

        let props = {
            list,
            handleFilter,
            handleClearFilter,
            handleChangeItemNum,
            handleSearch,
            handleRefresh: this.handleRefresh,
            handleSort,
            changeEditTab,
            handleNext,
            handleBack,
            handleJumpTo,
            handleCopy,
            handleCuratedCopy,
            handleImport,
            handleDelete,
            handleCuratedDelete,
            loadDesignList,
            setEditCourse,
            resetSettings,
            loadDesignConfig,
            loadGroupList,
            configureDesign,
            contributeDesign,
            reviewDesign,
            getAlertify,
        }
        return (
            <div className="lc">
                {this.renderControl()}
                {(() => {
                    switch(currListType) {
                        case ListType.MY:
                        return <MyDesignList {...props}/>;

                        case ListType.GROUP:
                        return <SharedDesignList {...props}/>;

                        case ListType.CURATOR:
                        return <CuratorDesignList {...props}/>;

                        case ListType.PENDING_REQUESTS:
                        return <PendingDesignList {...props}/>;

                        default:
                        return <SharedDesignList {...props}/>;
                    }
                })()}
            </div>
        );
    }

    render() {
        const {isCreate, isLoading} = this.state;
        const {currListType} = this.props.list;
        if(isCreate)
            return <Redirect to="/create"/>;
        else {
            let title = "";
            switch(currListType) {
                case ListType.MY:
                    title = 'My Designs'; break;
                case ListType.GROUP:
                    title = null; break;
                case ListType.CURATOR:
                    title = 'Public Designs'; break;
                case ListType.PUBLIC:
                    title = 'Public Designs'; break;
                case ListType.OTHERS:
                    title = 'Shared Designs'; break;
                case ListType.PENDING_REQUESTS:
                    title = 'Contributed Designs'; break;
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
    list: Config.get(state, StateName.DESIGN_LIST),
});

const mapDispatchToProps = dispatch => ({
    loadDesignList: type => dispatch(loadDesignList(type)),
    loadGroupList: () => dispatch(loadEmbeddedGroupList()),
    handleNext: () => dispatch(jumpNextPage()),
    handleBack: () => dispatch(jumpBackPage()),
    handleJumpTo: page => dispatch(jumpToPage(page)),
    handleSort: idx => dispatch(toggleSortColumn(idx)),
    handleSearch: keywords => dispatch(searchContent(keywords)),
    handleFilter: (key, value) => dispatch(filterContent(key, value)),
    handleClearFilter: () => dispatch(clearFilter()),
    handleChangeItemNum: itemNum => dispatch(changeItemNum(itemNum)),
    changeEditTab: editTab => dispatch(changeEditTab(editTab)),
    handleCopy: id => dispatch(copyDesign(id)),
    handleCuratedCopy: id => dispatch(copyCuratedDesign(id)),
    handleImport: id => dispatch(importDesign(id)),
    handleDelete: id => dispatch(removeDesign(id)),
    handleCuratedDelete: id => dispatch(removeCuratedDesign(id)),
    reset: () => dispatch(reset()),
    handleSwitchList: listType => dispatch(switchList(listType)),
    setEditCourse: id => dispatch(setEditCourse(id)),
    resetSettings: () => dispatch(resetSettings()),
    loadDesignConfig: id => dispatch(loadDesignConfig(id)),
    configureDesign: (id, data) => dispatch(configureDesign(id, data)),
    contributeDesign: id => dispatch(contributeDesign(id)),
    reviewDesign: (id, status) => dispatch(reviewDesign(id, status)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DesignList);
