---
---

/**
 * Created by rensholmer on 12/08/15.
 */

var Vis;
Vis = function (type) {
	var updateArc; //function to update if data changes
    var updateTree; //function to update if data changes
	var updateNetwork; //function to update if data changes
	var nodeColours = {
		"al": {"color": "#084594", "altcolor": "#636363", "name": "Arabidopsis lyrata"}, //Brassicaceae, Brassicales, blue
		"at": {"color": "#2171b5", "altcolor": "#636363", "name": "Arabidopsis thaliana"}, //Brassicaceae, Brassicales, blue
		"ar": {"color": "#252525", "altcolor": "#636363", "name": "Amborella trichopoda"}, //Amborellaceae, Magnoliales, black
		"br": {"color": "#4292c6", "altcolor": "#636363", "name": "Brassica rapa"}, //Brassicaceae, Brassicales, blue
		"cp": {"color": "#6baed6", "altcolor": "#636363", "name": "Carica papaya"}, //Caricaceae, Brassicales, blue
		"fv": {"color": "#fcbba1", "altcolor": "#e6550d", "name": "Fragaria vesca"}, //Rosaceae, Rosales, red
		"gm": {"color": "#cb181d", "altcolor": "#e6550d", "name": "Glycine max"}, //Fabaceae, Fabales, red
		"gr": {"color": "#9ecae1", "altcolor": "#636363", "name": "Gossipium raimondii"}, //Malvaceae, Malvales, blue
		"mt": {"color": "#67000d", "altcolor": "#e6550d", "name": "Medicago truncatula"}, //Fabaceae, Fabales, red
		"pt": {"color": "#fc9272", "altcolor": "#e6550d", "name": "Populus trichocarpa"}, //Salicaceae, Malpighiales, red
		"sl": {"color": "#ffffb2", "altcolor": "#636363", "name": "Solanum lycopersicum"}, //Solanaceae, Solanales, yellow
		"st": {"color": "#fed976", "altcolor": "#636363", "name": "Solanum tuberosum"}, //Solanaceae, Solanales, yellow
		"ta": {"color": "#c6dbef", "altcolor": "#636363", "name": "Theobroma cacao"}, //Malvaceae, Malvales, blue
		"vv": {"color": "#4a1486", "altcolor": "#636363", "name": "Vitis vinifera"}, //Vitaceae, Vitales, purple
		"os": {"color": "#bae4b3", "altcolor": "#636363", "name": "Oryza sativa"}, //Poaceae, Poales, green
		"lj": {"color": "#a50f15", "altcolor": "#636363", "name": "Lotus japonicum"}, //Fabaceae, Fabales, red
		"rc": {"color": "#fb6a4a", "altcolor": "#e6550d", "name": "Ricinus communis"}, //Euphorbiaceae, Malpighiales, red
		"zm": {"color": "#238b45", "altcolor": "#636363", "name": "Zea mays"}, //Poaceae, Poales, green
		"ph": {"color": "#ef3b2c", "altcolor": "#e6550d", "name": "Phaseolus vulgaris"},//Fabaceae, Fabales, red
		"md": {"color": "#fee0d2", "altcolor": "#e6550d", "name": "Malus domestica"},// Rosaceae, Rosales, red
		"cr": {"color": "#ffffff", "altcolor": "#636363", "name": "Chlamydomonas reinhardtii"}
	};
    var linkedByIndex = {};
	var filterLinks; //function: filter links
	var filterNodes; //function: filter nodes
	var mapNodes; //function: create map with {node index: node object}
	var setupData; //function: sets up the data
	var setAttract; //function: sets attraction parameter for force layout
	var setColor; //function: sets node colors
	var setZoom; //function: sets zoom options
	var network; //function: main network plotting function
	var tree; //function: main tree plotting function
	var arc; //function: main arc plotting function
	var arctree; //function: combine tree + arc
	var stats; //function: calculates statistics
	var zoom = "zoom"; //to zoom or not to zoom
	var linksG; //links group
	var nodesG; //nodes group
	var links; //links
	var nodes; //nodes
	var force = d3.layout.force(); //enter star wars pun
	var width = 500; //maybe set dynamically?
	var height = 500; //maybe set dynamically?
	var attract = 50; //maybe set dynamically?
	var MCL = 0; //maybe set dynamically?
    var moving = true; //is the force moving or not?
    var tooltip = Tooltip("vis-tooltip", 230); //tooltip.js

    /*
    Network functions
     */
	network = function(selection,data){
		var vis;
		this.updateData = function(newData){
			allData = setupData(newData);
			link.remove();
			    node.remove();
			moving = true;
			return updateNetwork();
			/*
            var scale;
		    var zoomWidth;
		    var zoomHeight;
		    var statistics;
            allData = setupData(newData);
		    curNodesData = filterNodes(allData.nodes);
		    curLinksData = filterLinks(allData.links,curNodesData);
            statistics = stats(allData);
            scale = 6 / Math.sqrt(statistics['numNodes']) ;//0.4;
            zoomWidth = (width - scale * width)/2;
            zoomHeight = (height - scale * width)/2;
            vis.attr("transform","translate("+zoomWidth+","+zoomHeight+")scale("+scale+")");

            force.nodes(curNodesData);
            updateNodes();

            force.links(curLinksData);
            updateLinks();

            stats(allData);

            force.on("tick",forceTick);
            if (moving){
                force.start();
            }
            */
		};
		this.toggleZoom = function(newZoom) {
            force.stop();
            setZoom(newZoom);
            if (moving) {
                force.start();
            }
        };
		this.toggleAttraction = function(newAttract){
            attract = newAttract;
		    force.linkDistance(function (d) {
			    return 1 / d.block_score + (attract * 2)
            });
		};
		this.toggleMCL = function(newMCL){
			setMCL(newMCL);
		    updateNetwork();
		};
        this.toggleForce = function(newForce){
            if (newForce === "start"){
			    force.start();
			    moving = true;
		    } else {
			    force.stop();
			    moving = false;
		    }
        };
        console.log(data);
		allData = setupData(data);
		stats(allData);
		vis = d3.select(selection)
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.call(d3.behavior.zoom().on("zoom",function(){
				if (zoom === "zoom"){
					return redraw();
				} else {
					return null;
				}
			}))
			.append("g");
		linksG = vis.append("g").attr("id", "links");
    	nodesG = vis.append("g").attr("id", "nodes");
		force.size([width, height])
				.linkDistance(function(d) { return 1/d.block_score + attract})
				.charge(function(d){
					if ("block_score" in d) {
						return -50 - (attract * 3)
					} else {
						return -5 - (attract * 2)
					}
				})
				.friction(0.9);

		function redraw() {
			vis.attr("transform","translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
		}
		return updateNetwork();
        //return this
	};

	updateNetwork = function() {
		var scale;
		var zoomWidth;
		var zoomHeight;
		var statistics;
		curNodesData = filterNodes(allData.nodes);
		curLinksData = filterLinks(allData.links,curNodesData);
		statistics = stats(allData);
		scale = 6 / Math.sqrt(statistics['numNodes']) ;//0.4;
		zoomWidth = (width - scale * width)/2;
		zoomHeight = (height - scale * width)/2;
		//vis.attr("transform","translate("+zoomWidth+","+zoomHeight+")scale("+scale+")");

		force.nodes(curNodesData);
		updateNodes();

		force.links(curLinksData);
		updateLinks();

		stats(allData);

		force.on("tick",forceTick);
		if (moving){
			force.start();
		}
	};

    /*
    Tree functions
     */
	tree = function(selection,data) {
		var vis;
		height = data.nodes.length * 15;
		var newick = Newick.parse(data.tree); //must include Newick.js!
		var newickNodes = [];
		function buildNewickNodes(node, callback) {
			newickNodes.push(node);
			if (node.branchset) {
				for (var i=0; i < node.branchset.length; i++) {
					buildNewickNodes(node.branchset[i])
				}
			}
		}
		buildNewickNodes(newick)
		d3.phylogram.build(selection, newick, data);
		return updateTree();
	};

	updateTree = function () {
		//stuff
	};

    /*
    Arcplot functions
     */
    arc = function(selection,data){
        //stuff
    };

    updateArc = function () {
        //stuff
    };

    /*
    Stats
     */
	stats = function(data){
      var content;
      var margin = {top:20,right:20,bottom:30,left:60};
      var statsw = 500 - margin.left - margin.right;
      var statsh = 300 - margin.top - margin.bottom;
      var numNodes = 0;
      var numLinks = 0;
      var numClusters = 0;
      var nodesInClusters = 0;
      var clusterMap = {};
      var biggestCluster = 0;
      var statistics = {};
      var xvals = [];
      var yvals = [];
      var pairs = [];
      var scatter; //ski skapadap scatterplot
      var trendline;//the trendline
      var xscale = d3.scale.sqrt().range([0,statsw]);
      var xmap = function(d){ return xscale(d[0]);};
      var xaxis = d3.svg.axis().scale(xscale).orient("botom").ticks(5);
      var yscale = d3.scale.sqrt().range([statsh,0]);
      var ymap = function(d){ return yscale(d[1]);};
      var yaxis = d3.svg.axis().scale(yscale).orient("left").ticks(6);

      function leastSquares(xSeries, ySeries) { //from http://bl.ocks.org/benvandyke/8459843
          var reduceSumFunc = function(prev, cur) { return prev + cur; };
          var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
          var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;
          var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
              .reduce(reduceSumFunc);
          var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
              .reduce(reduceSumFunc);
          var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
              .reduce(reduceSumFunc);

          var slope = ssXY / ssXX;
          var intercept = yBar - (xBar * slope);
          var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

          return [slope, intercept, rSquare];
      }

      data.links.forEach(function(l){
          if ("block_score" in l){
              var source_cluster = l.source['clusters'][MCL];
              var target_cluster = l.target['clusters'][MCL];
              if (source_cluster > 0 && target_cluster > 0 && source_cluster === target_cluster){
                  numLinks += 1;
                  yvals.push(parseInt(l.block_score));
                  xvals.push(l.distance);
                  //pairs.push([l.block_score, l.distance])
                  pairs.push([l.distance, parseInt(l.block_score)])
              }
          }
	  });
      //xscale.domain([d3.min(xvals)-1,d3.max(xvals)+1]);
      xscale.domain([0,d3.max(xvals)+1]);
      yscale.domain([d3.min(yvals)-1,d3.max(yvals)+1]);
      console.log([d3.min(yvals),yscale(d3.min(yvals))]);
	  data.nodes.forEach(function(n){
          numNodes += 1;
          numClusters = Math.max(numClusters,n['clusters'][MCL]);
		  if (n['clusters'][MCL] > 0){
              nodesInClusters += 1;
              if (!(n['clusters'][MCL] in clusterMap)){
			       clusterMap[n['clusters'][MCL]] = 0
              }
			  clusterMap[n['clusters'][MCL]] += 1
          }
      });
      for (var key in clusterMap){
		  biggestCluster = Math.max(clusterMap[key],biggestCluster)
      }
      content = "<h3>Statistics</h3>";
      content += "<p># Nodes: "+numNodes+" ";
      content += "<p># Edges: "+numLinks+"</p>";
      content += "<p># Clusters: "+numClusters+"</p>";
      content += "<p># Nodes in clusters: "+nodesInClusters+"</p>";
      content += "<p>Biggest cluster: "+biggestCluster+"</p>";
      $("#numbers").html(content);
      //initialize plot
      d3.selectAll("#scatter svg").remove();
      scatter = d3.select("#scatter")
          .append("svg")
          .attr("width",statsw + margin.left + margin.right)
          .attr("height",statsh + margin.top + margin.bottom)
          .append("g")
          .attr("transform","translate("+ margin.left + "," + margin.top + ")");
      //prepare x
      scatter.append("g")
          .attr("class","axis")
          .attr("transform","translate(0,"+statsh+")")
          .call(xaxis)
          .append("text")
          .attr("class","label")
          .attr("x",statsw)
          .attr("y",-6)
          .style("text-anchor","end")
          .text("Distance");
      //prepare y
      scatter.append("g")
          .attr("class","axis")
          .call(yaxis)
          .append("text")
          .attr("class","label")
          .attr("transform","rotate(-90)")
          .attr("y",6)
          .attr("dy",".71em")
          .style("text-anchor","end")
          .text("block size");
      //start plotting dots
      scatter.selectAll(".dot")
          .data(pairs)
          .enter().append("circle")
          .attr("class","dot")
          .attr("r",3)
          .attr("cx",xmap)
          .attr("cy",ymap)
          .style("fill","red");

      //get regression data
      coeff = leastSquares(xvals,yvals);
      console.log(coeff);

      var x1 = d3.min(xvals);
      var x2 = d3.max(xvals);
      var y1 = x1 * coeff[0] + coeff[1];
      var y2 = x2 * coeff[0] + coeff[1];
      var trendData = [[x1,y1,x2,y2]];

      trendline = scatter.selectAll(".trendline")
          .data(trendData);
      trendline.enter()
			.append("line")
			.attr("class", "trendline")
			.attr("x1", function(d) { return xscale(d[0]); })
			.attr("y1", function(d) { return yscale(d[1]); })
			.attr("x2", function(d) { return xscale(d[2]); })
			.attr("y2", function(d) { return yscale(d[3]); })
			.attr("stroke", "black")
			.attr("stroke-width", 1);
      //display equation and r-square
      scatter.append("text")
          .text("eq: "+coeff[0]+"x + "+coeff[1])
          .attr("class","text-label")
          .attr("x",function(d){return xscale(x2) - 30})
          .attr("y",function(d){return yscale(d3.max(yvals)) - 30 });

      statistics['numNodes'] = numNodes;
      statistics['numLinks'] = numLinks;
      statistics['numCLusters'] = numClusters;
      statistics['nodesInClusters'] = nodesInClusters;
      statistics['biggestCluster'] = biggestCluster;
      return statistics
	};

    /*
    Generic functions
     */
	setZoom = function (newZoom) {
		zoom = newZoom;
		if (zoom === "zoom") {
			node.on("click", function () {
				return false
			})
		} else {
			node.call(force.drag)
		}
	};
	setColor = function (newColor) {
		col = newColor;
	};

	setupData = function (data) {
		var nodesMap;
		nodesMap = mapNodes(data.nodes);
		data.nodes.forEach(function (n) {
			var randomnumber;
			n.x = randomnumber = Math.floor(Math.random() * width);
			n.y = randomnumber = Math.floor(Math.random() * height);
		});
		data.links.forEach(function (l) {
			l.source = nodesMap.get(l.source);
			l.target = nodesMap.get(l.target);
			return linkedByIndex["" + l.source.id + "," + l.target.id] = 1;
		});
		return data;
	};
	mapNodes = function (nodes) {
		var nodesMap;
		nodesMap = d3.map();
		nodes.forEach(function (n) {
			return nodesMap.set(n.id, n);
		});
		return nodesMap;
	};
	filterNodes = function (allNodes) {
		//add filter in the future, this is now redundant
		var filteredNodes;
		filteredNodes = allNodes;
		return filteredNodes;
	};
	filterLinks = function (allLinks, curNodes) {
		//add filter in the future, this is now redundant
		curNodes = mapNodes(curNodes);
		return allLinks.filter(function (l) {
			if ("block_score" in l) {
				return curNodes.get(l.source.id) && curNodes.get(l.target.id);
			} else {
                return false
            }
		});
		//return allLinks
	};
    setMCL = function(newMCL){

    };

	if (type === "network") {
        console.log(network);
		return network
	} else if (type === "tree") {
		return tree
	}
};

/*
Clickable browser stuff
*/
$(window).load(function(){
    var zoom = true;
	var force = true;
	var attraction = true;
	var col = true;
	var mcl = true;
    var type = "network";
	var myVis = Vis(type);
    var dataFile = "{{ site.baseurl }}/json/{{ site.data.index[0].file }}";
    $(".stats-icon").click(function(){
        $(".scatter").toggleClass("inactive");
        $(".numbers").toggleClass("inactive")
    });
    $("#gene_select").on("change",function(d){
		dataFile = $(this).val();
		console.log(dataFile);
		return d3.json(dataFile, function(error,json) {
			if (error) return console.warn(error);
			return myVis.updateData(json);
		});
	});
    $("#vis_select").on("change",function(d){
		var type;
		type = $(this).val();
        myVis = Vis(type);
		d3.selectAll("svg").remove();
		d3.selectAll("#tooltip").remove();
		if (type === "network"){
			zoom = true;
			force = true;
			attraction = true;
			col = true;
			mcl = true;
			//myVis = Network();
		} else if (type === "arc"){
			zoom = false;
			force = false;
			attraction = false;
			col = true;
            mcl = true;
			//myVis = Arc();
		} else if (type === "tree"){
			zoom = false;
			force = false;
			attraction = false;
			col = true;
            mcl = false;
			//myVis = Tree();
		} else {
			console.log("Switching failed")
		}
		return d3.json(dataFile,function(error,json){
			if (error) return console.warn(error);
			return myVis("#vis",json)
		});
	});
    if (zoom) {
		d3.selectAll("#zoom_select a").on("click",function(d){
			var newZoom;
			newZoom = d3.select(this).attr("id");
			activate("zoom_select",newZoom);
			return myVis.toggleZoom(newZoom);
		});
	} else {
		deactivate("zoom_select")
	}

	if (color) {
		d3.selectAll("#color_select a").on("click",function(d){
			var newColor;
			newColor = d3.select(this).attr("id");
			activate("color_select",newColor);
			return myVis.toggleColor(newColor);
		});
	} else {
		deactivate("color_select")
	}

	if (force) {
		d3.selectAll("#force_select a").on("click",function(d){
			var newForce;
			newForce = d3.select(this).attr("id");
			activate("force_select",newForce);
			return myVis.toggleForce(newForce);
		});
	} else {
		deactivate("force_select")
	}

	if (attraction) {
		d3.selectAll("#attraction_select input").on("change",function(d){
			var newAttract;
			newAttract = document.getElementById("attraction_select_id").value;
			//document.getElementById("attraction_value").set("value",newAttract);
			//d3.selectAll("#" + group + " input").classed("not_use",false);
			return myVis.toggleAttraction(newAttract);
		});
	} else {
		d3.selectAll("#" + group + " input").classed("not_use",true);
	}
	d3.selectAll("#mcl_select input").on("change",function(d){
		var newMCL;
		newMCL = document.getElementById("mcl_select_id").value;
		return myVis.toggleMCL(newMCL);
	});

	return d3.json(dataFile, function(error,json) {
		if (error) return console.warn(error);
		return myVis("#vis",json);
	});
});

