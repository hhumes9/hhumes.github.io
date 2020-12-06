    /* * * * * * * * * * * * * *
    *     class BrushVis       *
    * * * * * * * * * * * * * */


class BrushVis {

    constructor(parentElement, geoData, wineData, eventHandler) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.wineData = wineData;
        this.eventHandler = eventHandler

        this.displayData = [];
        this.parseDate = d3.timeParse("%Y");
        this.dateFormatter = d3.timeFormat("%Y");

        // call method initVis
        this.initVis();
    }

    // init brushVis
    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // clip path
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title brush-title')
            .append('text')
            .text('Trade Over Time')
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle');

        // init scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y")


        // init pathGroup
        vis.pathGroup = vis.svg.append('g').attr('class', 'pathGroup');

        // init path one (total trade)
        vis.pathOne = vis.pathGroup
            .append('path')
            .attr("class", "pathOne");

        // init path two (single country)
        vis.pathTwo = vis.pathGroup
            .append('path')
            .attr("class", "pathTwo");

        // init path generator CHECK THIS
        vis.area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function (d) {
                return vis.x(d.year);
            })
            .y0(vis.y(0))
            // .y1(function (d) {
            //     return vis.y(d[selectedCategory]);
            // });

        // init brushGroup:
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush");




        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])


        // Initial date range
        vis.onSelectionChanged(vis.parseDate(1996), vis.parseDate(2018));

        // init basic data processing
        vis.wrangleDataStatic();
    }

    // init basic data processing - prepares data for brush - done only once
    wrangleDataStatic() {
        let vis = this;

        // rearrange data structure and group by year
        let dataByYear = Array.from(d3.rollup(vis.wineData, v => Object.fromEntries(["value_thousand_USD", "quantity_metric_tons"].map(col => [col, d3.sum(v, d => +d[col])])), d => d['year']),
            ([key, value]) => ({key, value}))


        dataByYear.sort((a,b) => {return a.key - b.key})


        console.log(dataByYear)


        vis.preProcessedData = [];

        // iterate over each year
        dataByYear.forEach(year => {

            vis.preProcessedData.push(
                {
                    year: vis.parseDate(year.key),
                    valueTrade: year.value.value_thousand_USD,
                    quantityTrade: year.value.quantity_metric_tons
                }
            )
        });

        console.log(vis.preProcessedData)

       vis.wrangleDataResponsive();
       // vis.wrangleData();

    }

    // additional DataFiltering - only needed if we want to draw a second chart
    wrangleDataResponsive() {
        let vis = this;

        vis.filteredData = []

        // filter
        if (selectedCountry !== ''){
            console.log(selectedCountry)
            vis.wineData.forEach(row => {
                if (selectedCountry === row[trade_flow]){
                    vis.filteredData.push(row)
                }
            })
        }

        // rearrange data structure and group by year
        let dataByYear = Array.from(d3.rollup(vis.filteredData, v => Object.fromEntries(["value_thousand_USD", "quantity_metric_tons"].map(col => [col, d3.sum(v, d => +d[col])])), d => d['year']),
            ([key, value]) => ({key, value}))


        dataByYear.sort((a,b) => {return a.key - b.key})


        vis.dataPathTwo = [];

        // iterate over each year
        dataByYear.forEach(year => {

            vis.dataPathTwo.push(
                {
                    year: vis.parseDate(year.key),
                    valueTrade: year.value.value_thousand_USD,
                    quantityTrade: year.value.quantity_metric_tons
                }
            )
        });



        vis.wrangleData();
    }

    // wrangleData - gets called whenever a state is selected
    wrangleData() {
        let vis = this;

        // Update the visualization
        vis.updateVis();
    };

    // updateVis
    updateVis() {
        let vis = this;

        vis.area.y1(function (d) {
            return vis.y(d[selectedCategory]);
        })

        // update domains
        vis.x.domain(d3.extent(vis.preProcessedData, function (d) {
            return d.year
        }));
        // vis.y.domain(d3.extent(vis.preProcessedData, function (d) {
        //     return d[selectedCategory]
        // }));
        vis.y.domain([0, d3.max(vis.preProcessedData, d=> d[selectedCategory])])

        if (trade_flow === 'import_country') {
            if (selectedCategory === 'valueTrade') {
                vis.title.text("World wine imports (USD), highlighted: " + selectedCountry)
            } else {
                vis.title.text("World wine imports (metric tons), highlighted: " + selectedCountry)
            }
        } else {
            if (selectedCategory === 'valueTrade') {
                vis.title.text("World wine exports (USD), highlighted: " + selectedCountry)
            } else {
                vis.title.text("World wine exports (metric tons), highlighted: " + selectedCountry)
            }
        }



        // draw x & y axis
        vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x).ticks(23));
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5).tickFormat(d3.format(".3s")));


        // draw pathOne
        vis.pathOne.datum(vis.preProcessedData)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr("fill", "rgba(114,47,55,0.3)")
            .attr("stroke", "#722f37")
            .attr("clip-path", "url(#clip)");

        // draw pathTwo
        vis.pathTwo.datum(vis.dataPathTwo)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr('fill', trade_flow === 'import_country' ? "#01579b" : "#7f0000")
            .attr("stroke", trade_flow === 'import_country' ? "#01579b" : "#7f0000")
            .attr("clip-path", "url(#clip)");


        // one year
        let minSelectionSize = vis.width / 23;


        vis.brush
            .on("end", function (event) {
            //  console.log(event)

            if (event.selection[1] - event.selection[0] < minSelectionSize) {
                // selection is too small; animate back up to a more reasonable size
                let brushCenter = event.selection[0] + 0.5 * (event.selection[1] - event.selection[0]);
                vis.brushGroup.transition()
                    .duration(400)
                    .call(vis.brush.move, [
                        brushCenter - 0.51 * minSelectionSize,
                        brushCenter + 0.51 * minSelectionSize
                    ]);

            }
            selectedTimeRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
            console.log(selectedTimeRange);
            $(vis.eventHandler).trigger("selectionChanged", selectedTimeRange);
            myMapVis.wrangleData();

        });


        vis.brushGroup
            .call(vis.brush);

    }

    onSelectionChanged(selectionStart, selectionEnd) {
        let vis = this;

        d3.select("#time-period-min").text(vis.dateFormatter(selectionStart))
        d3.select("#time-period-max").text(vis.dateFormatter(selectionEnd))

    }

}