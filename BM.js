// // input Example
// visibleNodes = [
// 	{id:'v1',biasWeight:0,state:1},
// 	{id:'v2',biasWeight:0,state:1}
// ];

// edges = [
// 	{nodes:new Set(['v1','v2']),weight:1}
// ]

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
// default to [] for all these parameters
function BM(g,visibleNodes,hiddenNodes=[],edges=[],showBias=false){
	var self = this;
	self.data = {visibleNodes:visibleNodes,
		hiddenNodes:hiddenNodes,
		edges: edges,
		showBias:showBias};
	self.g = g;
	self.init = function(){
		self.data.map = {};
		self.data.nodes = [];
		self.data.visibleNodes.forEach(function(node){
			self.data.map[node.id] = node;
		});
		self.data.hiddenNodes.forEach(function(node){
			self.data.map[node.id] = node;
		});
		self.data.mapKeys = shuffle(Object.keys(self.data.map));

		var addConnections = function(node){
			node.connected = [];
			edges.forEach(function(edge){
				if(edge.nodes.has(node.id)){
					var connectedNodeId = [...edge.nodes].filter(x=>x!=node.id)[0];
					node.connected.push({node:self.data.map[connectedNodeId],
						weight:edge.weight})
				}
			})
		}
		self.data.visibleNodes.forEach(addConnections);
		self.data.hiddenNodes.forEach(addConnections);

		// visualization part
		var visParams = {
			'r':10,
			'biasR':5,
			'biasGap':50,
			'hGap':80, // horizontal gap
			'vGap':70, // vertical gap
			'fill':'black',
			'edgeStroke':'grey',
			'edgeStrokeWidth':2,
			'circleStroke':'grey',
			'circleStrokeWidth':2
		}
		self.visParams = visParams;
		// precompute exact positions of nodes because we want to 
		// draw edges first.
		self.data.visibleNodes.forEach(function(node,i){
			node.cx = i*visParams.hGap;
			node.cy = visParams.vGap;
		});
		self.data.hiddenNodes.forEach(function(node,i){
			node.cx = i*visParams.hGap+visParams.hGap/2;
			node.cy = 0;
		});
		self.edges = self.g.selectAll('.edge')
						.data(self.data.edges).enter()
						.append('line')
						.attr('x1',function(d){
							var nodeId = [...d.nodes][0];
							console.log(nodeId,self.data.map);
							return self.data.map[nodeId].cx;
						})
						.attr('y1',function(d){
							var nodeId = [...d.nodes][0];
							return self.data.map[nodeId].cy;
						})
						.attr('x2',function(d){
							var nodeId = [...d.nodes][1];
							return self.data.map[nodeId].cx;
						})
						.attr('y2',function(d){
							var nodeId = [...d.nodes][1];
							return self.data.map[nodeId].cy;
						})
						.attr('stroke',visParams.edgeStroke)
						.attr('stroke-width',visParams.edgeStrokeWidth);
		
		var getTextPosition = function(d){
			var node1 = self.data.map[[...d.nodes][0]],
			node2 = self.data.map[[...d.nodes][1]],
			x1 = node1.cx,
			y1 = node1.cy,
			x2 = node2.cx,
			y2 = node2.cy;
			if(Math.abs(y1-y2)<0.1){
				return {x:(x1+x2)/2,y:(y1+5),anchor:'middle',
				baseline:'hanging'}
			}else{
				return {x:((x1+x2)/2+5),y:(y1+y2)/2,anchor:'start',
				baseline:'middle'}
			}
		}
		self.edgeTexts = self.g.selectAll('.edgeText')
						.data(self.data.edges).enter()
						.append('text')
						.text(function(d){return d.weight;})
						.attr('x',function(d){return getTextPosition(d).x;})
						.attr('y',function(d){return getTextPosition(d).y;})
						.attr('text-anchor',
							function(d){return getTextPosition(d).anchor})
						.attr('alignment-baseline',
							function(d){return getTextPosition(d).baseline});

		if(showBias){
			var drawBiasEdges = function(nodes,isVisible){
				var classStr = isVisible?'visibleBiasEdge':'hiddenBiasEdge';
				self.g.selectAll(classStr)
					.data(nodes).enter()
					.append('line')
					.attr('x1',function(d){return d.cx;})
					.attr('y1',function(d){return d.cy;})
					.attr('x2',function(d){return d.cx;})
					.attr('y2',function(d){
						if(isVisible)
							return d.cy + visParams.biasGap;
						else
							return d.cy - visParams.biasGap
					})
					.attr('stroke',visParams.edgeStroke)
					.attr('stroke-width',visParams.edgeStrokeWidth);
			}
			drawBiasEdges(self.data.visibleNodes,true);
			drawBiasEdges(self.data.hiddenNodes,false);

			var addWeightText = function(nodes,isVisible){
				var classStr = isVisible?'visibleBiasWeight':'hiddenBiasWeight';
				self.g.selectAll(classStr)
					.data(nodes).enter()
					.append('text')
					.attr('x',function(d){return d.cx+5;})
					.attr('y',function(d){
						var biasY;
						if(isVisible)
							biasY =  d.cy + visParams.biasGap;
						else
							biasY =  d.cy - visParams.biasGap
						return (d.cy+biasY)/2;
					})
					.attr('alignment-baseline','middle')
					.text(function(d){return d.biasWeight});
			}
			addWeightText(self.data.visibleNodes,true);
			addWeightText(self.data.hiddenNodes,false);
		}
		var drawNodes = function(nodes,isVisible){
			var classStr = isVisible?'.visible':'.hidden';
			var selector =  self.g.selectAll(classStr)
					.data(nodes).enter()
					.append('circle')
					.attr('r',visParams.r)
					.attr('cx',function(d){return d.cx;})
					.attr('cy',function(d){return d.cy;})
					.attr('fill',function(d){
						if(d.state==0) return 'white';
						else return visParams.fill;
					})
					.attr('stroke',visParams.circleStroke)
					.attr('stroke-width',visParams.circleStrokeWidth);
			return selector;
		}
		self.visibleNodes = drawNodes(visibleNodes,true);
		self.hiddenNodes = drawNodes(hiddenNodes,false);
		
		if(showBias){
			var drawBiasNodes = function(nodes,isVisible){
				var classStr = isVisible?'vBiasNode':'hBiasNode';
				self.g.selectAll(classStr)
					.data(nodes).enter()
					.append('circle')
					.attr('r',visParams.biasR)
					.attr('cx',function(d){return d.cx})
					.attr('cy',function(d){
						if(isVisible) return d.cy + visParams.biasGap;
						else return d.cy - visParams.biasGap;
					})
			}
			drawBiasNodes(visibleNodes,true);
			drawBiasNodes(hiddenNodes,false);
		}
	};
	self.init();
	self.getStateString = function(){
		var states = [];
		self.data.visibleNodes.forEach(function(node){
			states.push(node.state);
		});
		self.data.hiddenNodes.forEach(function(node){
			states.push(node.state);
		});
		return states.join(',');	
	}
	self.printStates = function(){
		var states = [];
		self.data.visibleNodes.forEach(function(node){
			states.push(Number(node.state));
		});
		self.data.hiddenNodes.forEach(function(node){
			states.push(Number(node.state));
		});
		return states.join(',');
	}

	var updateStateFuns = {
		'1':function(node){
			var energy = { false:0,
				true : -(node.biasWeight+
				node.connected.reduce(function(pre,curr){
					return pre + curr.node.state*curr.weight;
				},0))
			}
			var currentEnergy = energy[Boolean(node.state)];
			var nextEnergy = energy[!node.state];
			var deltaEnergy = nextEnergy - currentEnergy;
			// console.log('node: ', node.id,',',deltaEnergy,energy)
			// console.log('previous: ',self.printStates());
			if(deltaEnergy<0) node.state = !node.state;
			else{
				var chance =  1/(1+Math.exp(deltaEnergy));
				var standard = Math.random();
				// console.log('transition: ',chance,',',standard);
				if(chance > standard) node.state = !node.state;
			}
		},
		'2':function(node){
			var energy = { false:0,
				true : -(node.biasWeight+
				node.connected.reduce(function(pre,curr){
					return pre + curr.node.state*curr.weight;
				},0))
			}
			var deltaEnergy = energy[true] - energy[false];
			// console.log('node: ', node.id,',',deltaEnergy,energy)
			// console.log('previous: ',self.printStates());
			var chance =  1/(1+Math.exp(deltaEnergy));
			var standard = Math.random();
			// console.log('transition: ',chance,',',standard);
			if(chance>standard) node.state = true;
			else node.state = false;
			// console.log('after: ',self.printStates());
		}
	}
	
	self.step = function(sample=false){
		// console.log('----------------------------------------');
		//update rule
		// sequential update
		var stateString;
		var updateState = updateStateFuns['2'];
		// // random update
		// var keys = shuffle(self.data.mapKeys);
		// keys.forEach(function(nodeId,i){
		// 	updateState(self.data.map[nodeId]);
		// 	if(sample && i==1){
		// 		stateString = self.getStateString() + keys[2];
		// 	}
		// })

		self.data.visibleNodes.forEach(updateState);
		self.data.hiddenNodes.forEach(updateState);
		self.visibleNodes.data(self.data.visibleNodes)
		.attr('fill',function(d){
			if(d.state==0) return 'white';
			else return self.visParams.fill;
		});
		self.hiddenNodes.data(self.data.hiddenNodes)
		.attr('fill',function(d){
			if(d.state==0) return 'white';
			else return self.visParams.fill;
		});
		return stateString;
	};
	self.start = function(){
		self.intervalID = setInterval(self.step,100);
	};
	self.stop = function(){clearInterval(self.intervalID)};
	return self;
}