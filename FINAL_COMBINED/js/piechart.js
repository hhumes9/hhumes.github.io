/* * * * * * * * * * * * * *
*         MapVis         *
* * * * * * * * * * * * * */


class PieChart {

    // constructor method to initialize Timeline object
    constructor(parentElement, wordData, varietyData, geoData, countryData) {
        this.parentElement = parentElement;
        this.wordData = wordData;
        this.varietyData = varietyData;
        this.geoData = geoData;
        this.countryData = countryData;
        this.displayData = [];
        this.circleColors = ['#b2182b','#d6604d','#f4a582','#fddbc7'];

        // call initVis method
        this.initVis()
    }

    initVis(){
        let vis = this;

        // margin conventions
        vis.margin = {top: 50, right: 50, bottom: 10, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Where it's Made")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');

        // pie chart setup
        vis.pieChartGroup = vis.svg
            .append('g')
            .attr('class', 'pie-chart')
            .attr("transform", "translate(" + vis.width / 3 + "," + vis.height / 1.8 + ")");

        // define inner and outer radius
        let outerRadius = vis.width / 3;
        let innerRadius = 0;

        // Ordinal color scale (10 default colors)
        vis.color = d3.scaleOrdinal().range(d3.schemeTableau10).domain([0.01,1])


        // define pie layout
        vis.pie = d3.pie()
            .value(function(d){
                return d.value
            });

        // set up your path generator
        vis.arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        // call next method in pipeline
        this.wrangleData();
    }

    // wrangleData method
    wrangleData(){
        let vis = this

        let tempData = vis.wordData.filter(function (d) {return d.variety == selectedVariety})

        let priceSum = 0;
        let ratingSum = 0;
        let sum = 0;

        tempData.forEach( entry => {
            priceSum += +entry['price'];
            ratingSum += +entry['points'];
            sum ++;
        });

        document.getElementById("price").innerHTML = priceSum/sum;
        document.getElementById("rating").innerHTML = ratingSum/sum;

        let tempCountryData = vis.countryData.filter(function (d) {return d.variety == selectedVariety})

        vis.pieData = []
        tempCountryData.forEach(d => {
            vis.pieData.push({
                country: d.country,
                color: vis.color(d.percent),
                value: d.percent
            })
        })

        vis.displayData = []
        vis.displayData = vis.pieData.sort((a,b) => {return b['value'] - a['value']})

        vis.updateVis()


    }

    // updateVis method
    updateVis() {
        let vis = this;
        var percentFormatter = d3.format(".0%")

        //add title
        vis.svg.selectAll(".percent").remove()

        vis.svg.append('g')
            .append('text')
            .attr("class", "percent")
            .text(percentFormatter(vis.displayData[0].value) + " of all " + selectedVariety + " wines are grown in " + vis.displayData[0].country)
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // Draw arcs
        // Bind data
        let arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.pieData))

        // Append paths
        arcs.enter()
            .append("path")
            .merge(arcs)
            .attr("d", vis.arc)
            .attr("class", "arc")
            .style("fill", d => d.data.color)
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(173,222,255,0.62)');
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px; color: black">
                         <h3>${d.data.country}<h3>
                         <h4>${percentFormatter(d.data.value)}</h4>

                     </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .style("fill", d => d.data.color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        arcs.exit().remove();

        // Add one dot in the legend for each name.
        let dots = vis.svg.selectAll(".mydots")
            .data(vis.displayData)

        dots.enter()
            .append("circle")
            .attr("class", "mydots")
            .merge(dots)
            .attr("cx", vis.width/1.25)
            .attr("cy", function(d,i){ return 50 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", d => d.color)

        dots.exit().remove()

        // Add one dot in the legend for each name.
        let dotLabels= vis.svg.selectAll(".dotlabels")
            .data(vis.displayData)

        dotLabels.enter()
            .append("text")
            .attr("class", "dotlabels")
            .merge(dotLabels)
            .text(function(d){ return d.country})
            .attr("x", vis.width/1.2)
            .attr("y", function(d,i){ return 50 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

        dotLabels.exit().remove()
    }
}