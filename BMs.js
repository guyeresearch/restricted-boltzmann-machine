var deepCopy = function(obj){
	return JSON.parse(JSON.stringify(obj));
}
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
function BMs(visibleNodes,hiddenNodes,edges,n){
	var self = this;
	self.bms = [];
	for(var i in d3.range(n)){
		console.log(i)
		var g = d3.select(document.createElement('g'))
		var copiedEdges = deepCopy(edges);
		copiedEdges.forEach(function(edge){
			edge.nodes = new Set(edge.nodes);
		});
		self.bms.push(new BM(g,deepCopy(visibleNodes),
			deepCopy(hiddenNodes),copiedEdges));
	}
	self.run = function(){
		self.previousStates = [];
		for(var i in d3.range(1000)){
			console.log(i);
			self.bms.forEach(function(bm,j){
				if(i==9999){
					self.previousStates.push(bm.step(true));
				}else{
					bm.step();
				}
			});
		}
		self.currrentStates = self.getStateStrings();
	}
	self.test = function(){
		var frequency = {},
		count = 0;
		self.currrentStates.forEach(function(state,i){
			if(state=='1,1,1'){
				count += 1;
				var previousState = self.previousStates[i];
				if(!(previousState in frequency)){
					frequency[previousState] = 0
				}
				frequency[previousState] += 1;
			}
		})
		// for(var key in frequency){
		// 	frequency[key] = frequency[key]/count;
		// }
		return [frequency,count]
	}
	self.getStateStrings = function(){
		var stateStrings = []
		self.bms.forEach(function(bm){
			var states = [];
			bm.data.visibleNodes.forEach(function(node){
				states.push(node.state);
			});
			bm.data.hiddenNodes.forEach(function(node){
				states.push(node.state);
			});
			var statesStr = states.join(',');	
			stateStrings.push(statesStr);
		})
		return stateStrings;
	}
	self.sample = function(){
		var frequency = {}
		self.bms.forEach(function(bm){
			var states = [];
			bm.data.visibleNodes.forEach(function(node){
				states.push(node.state);
			});
			bm.data.hiddenNodes.forEach(function(node){
				states.push(node.state);
			});
			var statesStr = states.join(',');
			if(!(statesStr in frequency)){
				frequency[statesStr] = 0
			}
			frequency[statesStr] += 1;
		});
		for(var key in frequency){
			frequency[key] = frequency[key]/n;
		}
		return frequency;
	}
	return self;
}