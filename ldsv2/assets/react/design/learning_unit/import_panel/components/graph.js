import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import jsplumb from 'jsplumb/dist/js/jsplumb';
import {Graph, extAlg as alg, json} from 'js/graphlib';
import graphSettings from 'react/design/learning_unit/design_panel/graph_settings';
import PatternNode from './pattern_node';

const jsPlumb = jsplumb.jsPlumb;

export default class GraphComponent extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderGraph = this.renderGraph.bind(this);
        this.renderEndpoints = this.renderEndpoints.bind(this);
        this.renderConnections = this.renderConnections.bind(this);
        this.renderNodes = this.renderNodes.bind(this);
    }

    componentDidMount() {
        const {dragOptions, connectionOverlays, basicType} = graphSettings;
        let container = ReactDOM.findDOMNode(this.container);

        jsPlumb.ready(() => {
            let settings = {
                DragOptions: dragOptions,
                ConnectionOverlays: connectionOverlays,
            };
            jsPlumb.setContainer(container);
            this.instance = jsPlumb.getInstance(settings);
            this.instance.registerConnectionType('basic', basicType);
            this.renderGraph();
        });
    }

    componentWillUnmount() {
        if(this.instance) {
            this.instance.reset();
        }
    }

    renderGraph() {
        this.renderEndpoints();
        this.renderConnections();
    }

    renderEndpoints() {
        const {node} = this.props;
        const {sourceParams, targetParams} = graphSettings;
        return node.children.map(n => {
            const {id} = n.model;
            let top = this.instance.addEndpoint(id, {anchor: 'Top', uuid: 'Target-'+id}, targetParams);
            let bottom = this.instance.addEndpoint(id, {anchor: 'Bottom', uuid: 'Source-'+id}, sourceParams);
            bottom.setEnabled(false);
        });
    }

    renderConnections() {
        const {node} = this.props;
        const {dependencies} = node.model;
        if(dependencies) {
            let g = json.read(dependencies.graph);
            g.edges().forEach(e => {
                if(e.v) {
                    let c = this.instance.connect({
                        uuids: ['Source-'+e.v, 'Target-'+e.w],
                        detachable: false,
                    });
                }
            });
        }
    }

    renderNodes() {
        const {node} = this.props;
        return node.children.map(n => {
            const {id} = n.model;
            let props = {
                key: id,
                node: n,
                dependencies: node.model.dependencies,
                sequence: node.model.sequenceMap[id],
            }
            return <PatternNode {...props}/>;
        });
    }

    render() {
        return (
            <div ref={container => this.container = container} className="graph">
                {this.renderNodes()}
            </div>
        );
    }
}
