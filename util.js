// this script depends on BM.js

function Sampler(svg,bm,startX,startY,layoutParams){
	var counter = 0;
	if(!layoutParams){
		var xMargin = 150,
		yMargin = 100,
		n = 3
		adjustX = 35
		adjustY = -15; // number of samples each row
	}else{
		var xMargin = layoutParams.xMargin,
		yMargin = layoutParams.yMargin,
		n = layoutParams.n,
		adjustX = layoutParams.adjustX; // number of samples each row
	}
		
	
	this.sample = function(){
		if(counter==0){
			svg.append('line')
		.attr('x1',startX+xMargin-adjustX)
		.attr('y1',startY-adjustY)
		.attr('x2',startX+xMargin-adjustX)
		.attr('y2',svg.attr('height'))
		.attr('stroke','grey')
		.attr('stroke-width',2);
	svg.append('line')
		.attr('x1',startX+xMargin*2-adjustX)
		.attr('y1',startY-adjustY)
		.attr('x2',startX+xMargin*2-adjustX)
		.attr('y2',svg.attr('height'))
		.attr('stroke','grey')
		.attr('stroke-width',2);
		}
		var currentX = startX+xMargin*(counter%n);
		var currentY = startY+Math.floor(counter/n)*yMargin
		var g= svg.append('g')
		.attr('transform','translate('+currentX+','+currentY+')');
		new BM(g,bm.data.visibleNodes,
			// no hidden units
			[],
			[],
			false);
		counter+=1;
	}
	return this;
}