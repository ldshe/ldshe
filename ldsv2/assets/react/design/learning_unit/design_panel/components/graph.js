import classnames from 'classnames';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import jsplumb from 'jsplumb/dist/js/jsplumb';
import {Graph, extAlg as alg, json} from 'js/graphlib';
import EditContext from 'react/app/design/context/edit';
import {GraphType, PatternType} from '../types';
import PatternNode from './pattern_node';

const jsPlumb = jsplumb.jsPlumb;

let ref = {};

export const graph = () => {
    return ref.jsPlumb;
}

export default class GraphComponent extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.selectedChildId != nextProps.selectedChildId) {
            return {
                selectedChildId: nextProps.selectedChildId,
            };
        }
        return null;
    }

    get settings() {
        return this.props.graphSettings;
    }

    constructor(props, context) {
        super(props, context);
        this.setZoom = this.setZoom.bind(this);
        this.registerEvents = this.registerEvents.bind(this);
        this.unregisterEvents = this.unregisterEvents.bind(this);
        this.isEditable = this.isEditable.bind(this);
        this.onNodeSelected = this.onNodeSelected.bind(this);
        this.onNodeDeselected = this.onNodeDeselected.bind(this);
        this.handleBeforeDrop = this.handleBeforeDrop.bind(this);
        this.handleConnection = this.handleConnection.bind(this);
        this.handleConnectionDetached = this.handleConnectionDetached.bind(this);
        this.changeLevel = this.changeLevel.bind(this);
        this.renderGraph = this.renderGraph.bind(this);
        this.renderEndpoints = this.renderEndpoints.bind(this);
        this.renderConnections = this.renderConnections.bind(this);
        this.renderNodes = this.renderNodes.bind(this);
        this.state = {
            selectedChildId: props.selectedChildId || null,
        };
    }

    componentDidMount() {
        const {dragOptions, connectionOverlays, basicType} = this.settings;
        let container = ReactDOM.findDOMNode(this.container);

        jsPlumb.ready(() => {
            let settings = {
                DragOptions: dragOptions,
                ConnectionOverlays: connectionOverlays,
            };
            jsPlumb.setContainer(container);
            this.instance = jsPlumb.getInstance(settings);
            this.instance.registerConnectionType('basic', basicType);
            this.registerEvents();
            this.renderGraph();
            ref.jsPlumb = this.instance;
        });
    }

    componentDidUpdate() {
        if(this.instance) {
            this.renderGraph();
        }
    }

    componentWillUnmount() {
        if(this.instance) {
            this.instance.reset();
        }
    }

    setZoom(scale) {
        if(this.instance) {
            this.instance.setZoom(scale);
        }
    }

    registerEvents() {
        this.instance.bind('beforeDrop', this.handleBeforeDrop);
        this.instance.bind('connection', this.handleConnection);
        this.instance.bind('connectionDetached', this.handleConnectionDetached);
    }

    unregisterEvents() {
        this.instance.unbind('beforeDrop');
        this.instance.unbind('connection');
        this.instance.unbind('connectionDetached');
    }

    isEditable() {
        const {type, currEditNode} = this.props;
        if(currEditNode) {
            if(type == GraphType.PATTERN_INSTANCE && !currEditNode.isRoot())
                return false;
            else
                return true;
        } else {
            return false;
        }
    }

    onNodeSelected(e, id) {
        e.stopPropagation();
        const {selectChild} = this.props;
        selectChild(id);
    }

    onNodeDeselected(e) {
        e.stopPropagation();
        const {selectChild} = this.props;
        selectChild(null);
    }

    handleBeforeDrop(info) {
        const {sourceId, targetId} = info;
        if(sourceId == targetId)
            return false;
        const {currEditNode} = this.props;
        if(currEditNode) {
            const {dependencies} = currEditNode.model;
            if(dependencies) {
                const {graph} = dependencies;
                let g = json.read(JSON.parse(JSON.stringify(graph)));
                g.setEdge(sourceId, targetId);
                return alg.isAcyclic(g);
            }
        }
        return true;
    }

    handleConnection(info, originalEvent) {
        if(!this.rendering) {
            this.unregisterEvents();
            const {updateConnection} = this.props;
            let conns = this.instance.getConnections();
            setTimeout(() => {
                updateConnection(conns);
                this.registerEvents();
            }, 100);
        }
    }

    handleConnectionDetached(info, originalEvent) {
        if(!this.rendering) {
            this.unregisterEvents();
            const {sourceId, targetId} = info;
            const {updateConnection} = this.props;
            let conns = this.instance.getConnections();
            conns = conns.filter(c => c.sourceId != sourceId || c.targetId != targetId);
            setTimeout(() => {
                updateConnection(conns);
                this.registerEvents();
            }, 100);
        }
    }

    changeLevel(id) {
        const {changeLevel} = this.props;
        changeLevel(id);

        this.setState({
            selectedChildId: null,
        });
    }

    renderGraph() {
        this.rendering = true;
        this.instance.deleteEveryConnection();
        this.instance.deleteEveryEndpoint();
        this.renderEndpoints();
        this.renderConnections();
        this.rendering = false;
    }

    renderEndpoints() {
        const {currEditNode} = this.props;
        const {sourceParams, targetParams} = this.settings;
        if(currEditNode) {
            return currEditNode.children.map(n => {
                const {id} = n.model;
                let top = this.instance.addEndpoint(id, {anchor: 'Top', uuid: 'Target-'+id}, targetParams);
                let bottom = this.instance.addEndpoint(id, {anchor: 'Bottom', uuid: 'Source-'+id}, sourceParams);
                if(!this.isEditable()) bottom.setEnabled(false);
            });
        }
    }

    renderConnections() {
        const {type, currEditNode} = this.props;
        if(currEditNode) {
            const {dependencies} = currEditNode.model;
            if(dependencies) {
                let g = json.read(dependencies.graph);
                g.edges().forEach(e => {
                    if(e.v) {
                        let c = this.instance.connect({
                            uuids: ['Source-'+e.v, 'Target-'+e.w],
                            detachable: this.isEditable(),
                        });
                        if(this.isEditable()) c.bind('click', (conn, originalEvent) => this.instance.deleteConnection(conn));
                    }
                });
            }
        }
    }

    renderNodes({isReadOnly, getAlertify}) {
        const {selectedChildId} = this.state;
        const {type, currEditNode, deletePattern, updatePosition} = this.props;
        if(currEditNode) {
            return currEditNode.children.map(n => {
                const {id} = n.model;
                let props = {
                    key: id,
                    node: n,
                    selectedChildId,
                    dependencies: currEditNode.model.dependencies,
                    sequence: currEditNode.model.sequenceMap[id],
                    removeable: this.isEditable(),
                    deletePattern,
                    updatePosition,
                    onNodeSelected: this.onNodeSelected,
                    changeLevel: this.changeLevel,
                    isReadOnly,
                    getAlertify,
                }
                return <PatternNode {...props}/>;
            });
        }
    }

    render() {
        return (
            <EditContext.Consumer>{
                ctx => (
                    <div ref={container => this.container = container} className="graph" onClick={this.onNodeDeselected}>
                        {this.renderNodes(ctx)}
                    </div>
                )
            }</EditContext.Consumer>
        );
    }
}
