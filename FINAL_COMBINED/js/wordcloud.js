/* * * * * * * * * * * * * *
*      class WordCloud        *
* * * * * * * * * * * * * */


class WordCloud {

    constructor(parentElement, wordData) {
        this.parentElement = parentElement;
        this.wordData = wordData;
        this.displayData = [];

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 50, right: 20, bottom: 30, left: 70};
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
            .text("Flavor Profile")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');

        // Scales
        vis.size = d3.scaleLinear()
            .range([40,80])
            .domain(d3.extent(vis.wordData, d => d.count))


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
        vis.displayData = vis.wordData
        vis.displayData = vis.displayData.filter(function (d) {return d.variety == selectedVariety})

        vis.size
            .domain(d3.extent(vis.displayData, d => d.count))

        vis.updateVis()

    }

    updateVis(){
        let vis = this;
        // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
        // Wordcloud features that are different from one word to the other must be here
        vis.layout = d3.layout.cloud()
            .size([vis.width, vis.height])
            .words(vis.displayData.map(function(d) { return {text: d.word, size:vis.size(d.count)}; }))
            .padding(5)        //space between words
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .fontSize(d => d.size)      // font size of words
            // This function takes the output of 'layout' above and draw the words
            // Wordcloud features that are THE SAME from one word to the other can be here

        vis.layout
            .on("end", function (words) {
                vis.svg.selectAll(".words").remove()
                vis.cloud = vis.svg
                    .append("g")
                    .attr("transform", "translate(" + vis.layout.size()[0] / 2 + "," + vis.layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter()
                vis.cloud.append("text")
                    .attr("class", "words")
                    .merge(vis.cloud)
                    .style("font-size", function(d) { return d.size + "px"; })
                    .style("fill", "#690013")
                    .attr("text-anchor", "middle")
                    .style("font-family", "Times New Roman")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; });
                vis.cloud.exit().remove();
            })
            .start();




    }



}