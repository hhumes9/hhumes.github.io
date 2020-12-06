/* * * * * * * * * * * * * *
*      class BarChart        *
* * * * * * * * * * * * * */


class BarChart {

    constructor(parentElement, reccsData) {
        this.parentElement = parentElement;
        this.reccsData = reccsData;
        this.displayData = [];

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 50, right: 20, bottom: 30, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Top Wines by Value (Rating/Price)")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])

        vis.x = d3.scaleBand()
            .range([0, vis.width]).padding(0.2)

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickValues([]);

        // vis.svg.append("g")
        //     .attr("class", "y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')

        // vis.svg.append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 0 - vis.margin.left/1.5)
        //     .attr("x",0 - (vis.height / 2))
        //     .attr("dy", "1em")
        //     .style("text-anchor", "middle")
        //     .attr("class", "label")
        //     .attr("font-size", "10px")
        //     .text("Rating (out of 100)")


        this.wrangleData();
    }

    wrangleData(){
        let vis = this;
        // vis.wordData.forEach( d => {
        //     vis.displayData.push(
        //         {
        //             word: d.word,
        //             size: vis.size(d.count),
        //             variety: d.variety,
        //             country: d.country,
        //             points: d.points,
        //             price: d.price,
        //             province: d.province,
        //             region: d.region,
        //             title: d.title,
        //             winery: d.winery
        //         }
        //     )}
        //
        // )
        vis.displayData = [];
        vis.topTenData = [];
        console.log(selectedVariety)
        vis.displayData = vis.reccsData.filter(function (d) {return d.variety == selectedVariety})
        vis.displayData.sort((a,b) => {return b['value'] - a['value']})
        vis.topTenData = vis.displayData.slice(0, 10)
        console.log(vis.topTenData)
        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        const max_value = d3.max(vis.topTenData, d=> d.points);
        vis.y.domain([0, max_value]);
        vis.x.domain(vis.topTenData.map(d => d.title));
        // Create bars on bar chart
        let bars = vis.svg.selectAll("image")
            .data(vis.topTenData);

        bars.enter()
            .append("svg:image")
            .attr("xlink:href", "https://img.pngio.com/wine-bottle-png-free-download-fourjayorg-wine-bottles-png-1295_4000.png")
            .attr("class", "bar")
            .merge(bars)
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr('stroke', 'black')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px; color: black">
                         <h4>${d.title}<h4>
                         <p> Price ($): ${d.price}</p>
                         <p> Rating: ${d.points}/100</p>
                         <p> Origin: ${d.province}, ${d.country}</p>
                         <p> Description: ${d.description}</p>
                     </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .style("stroke", "#002837")
                    .attr('stroke-width', '0px')

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .attr("x", (d, i) => vis.width/10*i)
            // .attr("y", d =>  vis.y(d.points))
            .attr("y", 0)
            .attr("width", vis.width/10)
            // .attr("height", d => vis.height- vis.y(d.points));
            .attr("height", vis.height);

        bars.exit().remove();

        function wrap(text, width) {
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
        }

        // let labelsName = vis.svg.selectAll(".label-name")
        //     .data(vis.topTenData)
        //
        // labelsName.enter().append("text")
        //     .attr("class", "label-name")
        //     .merge(labelsName)
        //     .text(d => d.winery)
        //     .attr("x", (d, i) => vis.width/10*(i+1)-vis.width/20)
        //     .attr("y", vis.height/1.6)
        //     .attr("dy", "0em")
        //     .attr("font-family", "sans-serif")
        //     .attr("text-anchor", "middle")
        //     .attr("font-size", "10px")
        //
        // labelsName.exit().remove()

        let labelsYear = vis.svg.selectAll(".label-year")
            .data(vis.topTenData)

        labelsYear.enter().append("text")
            .attr("class", "label-year")
            .merge(labelsYear)
            .text(d => "$" + d.price)
            .attr("x", (d, i) => vis.width/10*(i+1)-vis.width/20)
            .attr("y", vis.height/1.6)
            .attr("dy", "1em")
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")

        labelsYear.exit().remove()
        // Update the y-axis
        // vis.svg.select(".y-axis")
        //     .call(vis.yAxis);

        // Update the x-axis
        vis.svg.select(".x-axis")
            .call(vis.xAxis)

    }



}