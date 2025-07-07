

const CONFIG = {
  sourceEndpoint: {
    endpoint: 'Dot',
    paintStyle: {
      stroke: '#000',
      fill: 'transparent',
      radius: 4,
      strokeWidth: 1
    },
    isTarget: true,
    dragOptions: {},
    overlays: []
  },
  targetEndpoint: {
    endpoint: 'Dot',
    paintStyle: { fill: '#7AB02C', radius: 5 },
    hoverPaintStyle: {
      fill: '#216477',
      stroke: '#216477'
    },
    maxConnections: -1,
    dropOptions: { hoverClass: 'hover', activeClass: 'active' },
    isSource: true,
    connector: ['Flowchart',
    {
      stub: [10, 20],
      gap: 10,
      cornerRadius: 10,
      alwaysRespectStubs: true
    }],
    connectorStyle: {
      strokeWidth: 2,
      stroke: '#61B7CF',
      joinstyle: 'round',
      outlineStroke: 'white',
      outlineWidth: 2
    },
    connectorHoverStyle: {
      strokeWidth: 3,
      stroke: '#216477',
      outlineWidth: 5,
      outlineStroke: 'white'
    },
    overlays: []
  }
};

export default CONFIG;
