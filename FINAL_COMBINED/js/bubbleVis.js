

class BubbleVis {

    constructor(parentElement, wineData) {
        this.parentElement = parentElement;
        this.wineData = wineData;

        this.initVis()

    }

    initVis() {

        let vis = this;

        vis.margin = {top: 500, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // vis.svg.append("defs")
        //     .append("pattern")
        //     .attr("id", "bgimg")
        //     .attr("width", "8")
        //     .attr("height", "8")
        //     .attr("patternUnits", "objectBoundingBox")
        //     .append("image")
        //     .attr("x", "0")
        //     .attr("y", "0")
        //     .attr("width", "150")
        //     .attr("height", "100")
        //     .attr("xlink:href", "img/plank1.png")

        vis.tiers = vis.svg.append('g')
            .attr('class', 'tier-labels')



        vis.colorScale = ['#3c1361', '#52307c', '#663a82', '#7c5295', '#b491c8', '#bca0dc']

        // vis.colorScale = ['#bca0dc', '#b491c8', '#7c5295', '#663a82', '#52307c', '#3c1361']

        let spacing = vis.width / 6
        vis.xCenter = []

        vis.colorScale.forEach((d,i) => {
            vis.xCenter.push(i*spacing + spacing/2)
        })

        vis.xCenter = vis.xCenter.reverse()

        console.log('spacing', vis.xCenter)

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "toolTip")


        // vis.numNodes = 350;
        // vis.nodes = d3.range(vis.numNodes).map(function(d, i) {
        //     return {
        //         radius: Math.random() * 20,
        //         category: i % 6
        //     }
        // });
        //
        // vis.simulation = d3.forceSimulation(vis.nodes)
        //     .force('charge', d3.forceManyBody().strength(5))
        //
        //
        //     .force('x', d3.forceX().x(function(d) {
        //         return vis.xCenter[d.category];
        //     }))
        //     .force('collision', d3.forceCollide().radius(function(d) {
        //         return d.radius;
        //     }))
        //     .on('tick', ticked);
        //
        // function ticked() {
        //     let u = d3.select('svg g')
        //         .selectAll('circle')
        //         .data(vis.nodes);
        //
        //     u.enter()
        //         .append('circle')
        //         .attr('r', function(d) {
        //             return d.radius;
        //         })
        //         .style('fill', function(d) {
        //             return vis.colorScale[d.category];
        //         })
        //         .merge(u)
        //         .attr('cx', function(d) {
        //             return d.x;
        //         })
        //         .attr('cy', function(d) {
        //             return d.y;
        //         })
        //
        //     u.exit().remove();
        // }




       vis.wrangleData()

    }

    wrangleData() {
        let vis = this;


        console.log('wineData', vis.wineData)

        vis.wineByTier = d3.groups(vis.wineData, d=>d['price_tier'])
        vis.wineByTierVariety = d3.groups(vis.wineData, d=> d['price_tier'], d=> d['variety'])


        console.log('wineByTier', vis.wineByTier)
        console.log('wineByTierVariety', vis.wineByTierVariety)

        vis.preprocessedData = []
        vis.wineByTierVariety.forEach( (tier, i) => {

            let totalWinesPerTier = vis.wineByTier[i][1].length

            tier[1].sort((a,b) => {return b[1].length - a[1].length})

            let topVarieties = tier[1].slice(0,20)

            console.log('tier', topVarieties)

            topVarieties.forEach((variety) => {
                vis.preprocessedData.push(
                    {
                        tier: tier[0],
                        tierIdx: i,
                        variety: variety[0],
                        numberWines: variety[1].length,
                        varietyFrequency: variety[1].length / totalWinesPerTier,
                        avgPrice: d3.mean(variety[1], d=> d.price),
                        avgQuality: d3.mean(variety[1], d=> d.points)
                    }
                )
            })

        })


        console.log('processed', vis.preprocessedData)


        vis.updateData()
    }

    updateData() {
        let vis = this;


        vis.simulation = d3.forceSimulation(vis.preprocessedData)
            .force('charge', d3.forceManyBody().strength(5))
            .force('x', d3.forceX().x(d => vis.xCenter[d.tierIdx]))
            .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.numberWines / 6) + 10))
            // .force('collision', d3.forceCollide().radius(Math.random() * 20))
            .on('tick', ticked)

        function ticked() {
            let bubbles = d3.select('#bubbleDiv svg g')
                .selectAll('circle')
                .data(vis.preprocessedData);

            bubbles.enter()
                .append('circle')
                .attr('r', d => Math.sqrt(d.numberWines / 6) + 10)

                .style('fill', d => vis.colorScale[d.tierIdx])
                .merge(bubbles)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)


            // tooltip
            bubbles.on('mouseover', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', '#9c9463')
                    .style('fill', '#d6d96a')

                // console.log(this)


                // info to include: tier, variety, frequency of variety within tier
                // avg price of variety within tier

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div id="toolTip">
                         <h5>${d.variety}<h5>
                         <p> 
                            Price Tier: ${d.tier}<br>
                            Variety Frequency: ${d3.format(".2%")(d.varietyFrequency)}<br>
                            Avg price: ${d3.format("$.2f")(d.avgPrice)}<br>
                            Avg quality score: ${d3.format(".2f")(d.avgQuality)}
                         </p>    
                     </div>`);
            })
                .on('mouseout', function (event, d) {
                    d3.select(this)
                        .attr('stroke-width', '0px')
                        .style("fill", d => vis.colorScale[d.tierIdx])

                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                })


            bubbles.exit().remove();


    }



        vis.tiers.selectAll("image")
            .data(vis.wineByTier)
            .enter().append("image")
            .attr("x", (d,i) => vis.xCenter[i] - 75)
            .attr("y", "-380")
            .attr("xlink:href", (d,i) => "img/plank" + i % 4 + ".png")
            .attr("width", "150")
            .attr("height", "100")



        vis.tiers.selectAll("text")
            .data(vis.wineByTier)
            .enter().append("text")
            .attr("x", (d,i) => vis.xCenter[i])
            .attr("y", "-380")
            .style("text-anchor", "middle")
            .text(d=> d[0])
            .append("tspan")
            .attr("x", (d,i) => vis.xCenter[i])
            .attr("y", "-360")
            .text(d=> {
                if (d[0]==="Value") {
                    return "< $10"
                } else if (d[0]==="Popular Premium") {
                    return "$10 - $20"
                } else if (d[0]==="Super Premium") {
                    return "$20 - $50"
                } else if (d[0]==="Luxury") {
                    return "$50 - $100"
                } else if (d[0]==="Super Luxury") {
                    return "$100 - $200"
                } else {
                    return "> $200"
                }
            })



    }





}