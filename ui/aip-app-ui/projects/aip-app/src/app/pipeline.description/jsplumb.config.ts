//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

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
