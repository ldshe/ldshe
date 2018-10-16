const connectorStyle = {
    stroke: '#111',
    strokeWidth: 2,
};

const hoverPaintStyle = {
    fill: '#216477',
    strokeWidth: 2,
    stroke: '#216477',
    outlineWidth: 1,
    outlineStroke: '#eb703c'
};

const connectorHoverStyle = {
    stroke: '#216477',
    strokeWidth: 2,
};

export default {
    connectionOverlays: [[
        'PlainArrow', {location: 1, visible: true, width: 10, length: 10},
    ]],

    basicType: {
        connector: 'StateMachine',
        paintStyle: {strokeStyle: '#216477', lineWidth: 4},
        hoverPaintStyle: {strokeStyle: 'blue'},
        overlays: ['PlainArrow'],
    },

    sourceParams: {
        isSource: true,
        endpoint: 'Dot',
        maxConnections: -1,
        connector: ['Flowchart', {stub: [5, 5], gap: 8, cornerRadius: 5, alwaysRespectStubs: true}],
        paintStyle: {fill: '#666', radius: 7},
        connectorStyle,
        hoverPaintStyle,
        connectorHoverStyle,
    },

    targetParams: {
        isTarget: true,
        endpoint: 'Dot',
        maxConnections: -1,
        dropOptions: {hoverClass: 'hover', activeClass: 'active'},
        paintStyle: {fill: '#7ab02c', radius: 7},
        hoverPaintStyle,
    },
};
