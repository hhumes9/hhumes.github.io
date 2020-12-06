

class MapVis {

    constructor(parentElement, geoData, wineData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.wineData = wineData;

        this.parseDate = d3.timeParse("%Y");

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 0, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .text('World Map')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // create projection
        vis.projection =  d3.geoNaturalEarth1()
            .translate([vis.width / 2 - 30, vis.height / 2 + 30])
            .scale(220)

        // geo generator
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // convert topojson into geojson
        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features

        // get rid of antarctica
        let antarcIdx = vis.world.findIndex((item, i) => item.properties.name === "Antarctica")
      //  console.log(antarcIdx)

        vis.world.splice(antarcIdx, 1)

      //  console.log('vis.world', vis.world)

        // draw countries
        vis.countries = vis.svg.selectAll(".map-country")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'map-country')
            .attr("d", vis.path)
            .style("stroke", "black")
            .style("fill", "grey")
            .style("stroke-width", "1")

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "toolTip")

        // color scale
        vis.colorScale = d3.scaleLinear()
         //   .range(["#FFEFEA", "#7f0000"]);

        // legend

        let legendWidth = 150

        vis.xScale = d3.scaleLinear()
            .range([0, legendWidth])


        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)


        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 2.8 / 4}, ${vis.height -100})`)


        // append defs to svg
        let defs = vis.svg.append("defs");

        // append a linearGradient element to the defs
        let linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");


        // set the color for the start (0%)
        vis.linearStart = linearGradient.append("stop")
            .attr("offset", "0%")
      //      .attr("stop-color", "#FFF"); //light blue

        // set the color for the end (100%)
        vis.linearEnd = linearGradient.append("stop")
            .attr("offset", "100%")
      //      .attr("stop-color", "#428A8D"); //dark blue

        // draw the rectangle and fill with gradient
        vis.legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", 10)
            .attr("y", -10)
            .style("fill", "url(#linear-gradient)");


        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;


        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];

        // if there is a region selected
        if (selectedTimeRange.length !== 0){

            // iterate over all rows the csv (dataFill)
            vis.wineData.forEach( row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0].getTime() <= vis.parseDate(row.year).getTime() && vis.parseDate(row.year).getTime() <= selectedTimeRange[1].getTime() ){
                    filteredData.push(row);
                }
            });
        } else {
            filteredData = vis.wineData;
        }

        vis.tradeDataByCountry = Array.from(d3.rollup(filteredData, v=> Object.fromEntries(["value_thousand_USD", "quantity_metric_tons"].map(col => [col, d3.sum(v, d => +d[col])])), d =>d[trade_flow]),
            ([key, value]) => ({key, value}))

      //  console.log('tradedatabycountry', tradeDataByCountry)


        vis.countryInfo = []

        // check if geoData countries are in tradecountries, then get info from helpers

        vis.world.forEach(country => {
            let mapName = country.properties.name

            let tradeRow = vis.tradeDataByCountry.find(x=>x.key === mapName)
         //   console.log('traderow', tradeRow)
            if (typeof tradeRow == 'undefined') {

                let tradeName = nameConverter.getTradeName(mapName)
             //   console.log('tradename', tradeName)

                if (tradeName !== false) {

                    let mapTradeRow = vis.tradeDataByCountry.find(x=>x.key === tradeName)
                 //   console.log('maptraderow', mapTradeRow)

                    if (typeof mapTradeRow != 'undefined') {
                        vis.countryInfo.push(
                            {
                                country: mapName,
                                valueTrade: mapTradeRow.value['value_thousand_USD'] * 1000,
                                quantityTrade: mapTradeRow.value['quantity_metric_tons']
                            }
                        )
                    }

                }

            } else {
                vis.countryInfo.push(
                    {
                        country: mapName,
                        valueTrade: tradeRow.value['value_thousand_USD'] * 1000,
                        quantityTrade: tradeRow.value['quantity_metric_tons']
                    }
                )
            }

        })


        vis.countryInfo.sort((a,b) => (a.country > b.country) ? 1 : -1)

     //   console.log('final data structure for myMapVis', vis.countryInfo)



        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        // get object from countryInfo
        let getObject = function(d) {
            let n = vis.countryInfo.find(x=> x.country === d.properties.name)
            if (typeof n !== 'undefined') {
                return n;
            } else {
              //  console.log(d.properties.name)
                return false;
            }
        }

        //#e1f5fe
        //#FFEFEA

        if (trade_flow === 'import_country') {
            vis.colorScale.range(["white", "#01579b"])
            vis.linearStart.attr("stop-color", "white")
            vis.linearEnd.attr("stop-color", "#01579b")

        } else {
            vis.colorScale.range(["white", "#7f0000"])
            vis.linearStart.attr("stop-color", "white")
            vis.linearEnd.attr("stop-color", "#7f0000")
        }

        vis.colorScale.domain([0, d3.max(vis.countryInfo, d=>d[selectedCategory])])
        vis.xScale.domain([0, d3.max(vis.countryInfo, d=>d[selectedCategory])])
        vis.xAxis.tickValues([0, d3.max(vis.countryInfo, d=>d[selectedCategory])])


        vis.xAxis.tickFormat(d=> d===0 ? d3.format(".0f")(d) : d3.format(".3s")(d))


        vis.legend.call(vis.xAxis)

        // title format
        if (trade_flow === 'import_country') {
            if (selectedCategory === 'valueTrade') {
                vis.title.text("Wine importing countries by value (USD)")
            } else {
                vis.title.text("Wine importing countries by quantity (metric tons)")
            }
        } else {
            if (selectedCategory === 'valueTrade') {
                vis.title.text("Wine exporting countries by value (USD)")
            } else {
                vis.title.text("Wine exporting countries by quantity (metric tons)")
            }
        }


        vis.countries
            .style("fill", function(d) {
                if (getObject(d) !== false) {
                    return vis.colorScale(getObject(d)[selectedCategory])
                }
                else {
                    return "white"
                }
            })
            .on('mouseover', function(event, d){

                if (getObject(d) !== false) {

                    // send to brush vis
                    let tradeRow = vis.tradeDataByCountry.find(x=>x.key === d.properties.name)
                    if (typeof tradeRow == 'undefined') {
                        selectedCountry = nameConverter.getTradeName(d.properties.name);

                    } else {
                        selectedCountry = d.properties.name
                    }
                    myBrushVis.wrangleDataResponsive();


                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .attr('stroke', 'black')
                        .style('fill', '#722f37')


                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div id="toolTip">
                             <h5>${getObject(d).country}<h5>
                             <p> 
                                Trade Value (USD): ${"$" + d3.format(".3s")(getObject(d).valueTrade)}<br>
                                Trade Quantity (metric tons): ${d3.format(".3s")(getObject(d).quantityTrade)}
                             </p>    
                         </div>`);
                }

            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .style("fill", function(d) {
                        if (getObject(d) !== false) {
                            return vis.colorScale(getObject(d)[selectedCategory])
                        } else {
                            return "white"
                        }
                    })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })



    }


}