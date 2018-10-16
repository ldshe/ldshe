import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Graph from './graph';

const panzoomPanCenter = $cont => {
    let gridWidth = $cont.width();
    let parentWidth = $cont.parent().width();
    let offsetX = (gridWidth - parentWidth) / -2;
    let matrix = $cont.panzoom('getMatrix');
    let offsetY = matrix[5];
    $cont.panzoom('pan', offsetX, offsetY, {silent: true});
}

export default class PatternPreview extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.loadedNum != nextProps.modal.loadedNum) {
            return {
                isLoading: false,
                loadedNum: nextProps.modal.loadedNum,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.onImexport = this.onImexport.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.state = {
            isLoading: true,
            loadedNum: props.modal.loadedNum,
        }
    }

    componentDidMount() {
        const {id, loadPreview} = this.props;
        loadPreview(id);
    }

    componentDidUpdate() {
        const {isLoading} = this.state;
        if(!isLoading) {
            let $grid = $(ReactDOM.findDOMNode(this.grid));
            $grid.panzoom();
            panzoomPanCenter($grid);
        }
    }

    componentWillUnmount() {
        let $grid = $(ReactDOM.findDOMNode(this.grid));
        $grid.panzoom('destroy');
    }

    onImexport(e, id) {
        e.preventDefault();
        const {imexportPattern, popPanel} = this.props;
        imexportPattern(id);
        popPanel();
    }

    renderLoading() {
        return (
            <div className="loading">
                <i className="fa fa-spinner fa-spin fa-2x fa-fw"></i>
            </div>
        );
    }

    renderContent() {
        const {id, imexportName, imexportBtnClsName} = this.props;
        const {previewPatt} = this.props.globalPattern;

        if(!previewPatt) return null;

        let btnCls = classnames('imexport btn btn-xs pull-right', imexportBtnClsName);
        let props = {
            node: previewPatt,
        };
        return (
            <div>
                <button type="button" className={btnCls} onClick={e => this.onImexport(e, id)}>{imexportName}</button>
                <div className="grid-wrapper">
                    <div ref={grid => this.grid = grid} className="grid">
                        <Graph {...props}/>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const {isLoading} = this.state;
        return (
            <div>{
                isLoading ?
                this.renderLoading() :
                this.renderContent()
            }</div>
        );
    }
}
