/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// need: tooltip, legend, selector for import/export, value/quantity, brushing for different years




// init global variables & switches
let myMapVis,
    myBrushVis,
    myBubbleVis,
    redWineVis,
    whiteWineVis,
    redWineData,
    whiteWineData,
    myWordCloud,
    myPieChart,
    myBarChart;


let selectedTimeRange = [];
let selectedCountry = '';

// Convert string to numerical when necessary
var rowConverter = function(d) {
    return {
        variety: d.variety,
        country: d.country,
        points: parseFloat(d.points),
        price: parseFloat(d.price),
        province: d.province,
        region: d["region_1"],
        title: d.title,
        winery: d.winery,
        count: parseFloat(d.n),
        word: d.word,
        year: parseFloat(d.year),
        value: d.points/d.price
    };
}
var rowConverter2 = function(d) {
    return {
        variety: d.variety,
        location: d.location,
        percent: parseFloat(d.percent)
    };
}

var rowConverter3 = function(d) {
    return {
        country: d.country,
        percent: parseFloat(d.percent),
        variety: d.variety
    };
}

var rowConverter4 = function(d) {
    return {
        variety: d.variety,
        country: d.country,
        points: parseFloat(d.points),
        price: parseFloat(d.price),
        province: d.province,
        region: d["region_1"],
        title: d.title,
        winery: d.winery,
        value: parseFloat(d.value),
        description: d.description,
        taster: d["taster_name"]
    };
}

// load data using promises
let promises = [
   // d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json"),
    d3.csv("data/wine_trade_2018.csv"),
    d3.csv("data/wine_trade_full.csv"),
    d3.csv("data/wine_magazine.csv"),
    d3.csv("data/winequality-red.csv"),
    d3.csv("data/winequality-white.csv"),
    d3.csv("data/winemag_count.csv", rowConverter), //6
    d3.csv("data/winemag_variety.csv", rowConverter2), //7
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"), //8
    d3.csv("data/winemag_country.csv", rowConverter3), //9
    d3.csv("data/winemag_reccs.csv", rowConverter4) //10
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    let geoData = dataArray[0]
    let wineData = dataArray[1]
    let wineDataFull = dataArray[2]
    let bubbleData = dataArray[3]


    wineData.forEach(function(d) {
        d.year = +d.year
    })
    wineDataFull.forEach(function(d) {
        d.year = +d.year
    })

    bubbleData.forEach(d=> {
        d.points = +d.points;
        d.price = +d.price;
    })



    // log data
    console.log('check out the data', wineData);

    let MyEventHandler = {};

    // init map
    myMapVis = new MapVis('mapDiv', geoData, wineDataFull);

    // init brush
    myBrushVis = new BrushVis('brushDiv', geoData, wineDataFull, MyEventHandler);

    // when 'selectionChanged' is triggered, specified function is called
    $(MyEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd) {
        myBrushVis.onSelectionChanged(rangeStart, rangeEnd)
    });


    // init matrix

    myBubbleVis = new BubbleVis('bubbleDiv', bubbleData)


    // Add HRadar visualization
    redWine = dataArray[4]
    whiteWine = dataArray[5]

    redWineVis = new RadarVis("#bottom-wine", redWine, false, "Red Wines", "#red-legend")
    whiteWineVis = new RadarVis("#top-wine", whiteWine, true, "White Wines", "#white-legend")

    // init word cloud
    myWordCloud = new WordCloud('wordcloudDiv', dataArray[6]);

    // init map chart
    myPieChart = new PieChart('pieDiv', dataArray[6], dataArray[7], dataArray[8], dataArray[9]);

    // init barchart
    myBarChart = new BarChart('barDiv', dataArray[10]);

}


// category select

// let trade_flow = 'export_country';
// let selectedCategory = 'valueTrade';

let trade_flow = $('#flowSelector').val();
let selectedCategory = $('#metricSelector').val();

function categoryChange() {
    trade_flow = $('#flowSelector').val();
    selectedCategory = $('#metricSelector').val();
    myMapVis.wrangleData();
    myBrushVis.wrangleDataStatic();

}

function onSelectionChange(){

    redWineVis.wrangleData();
    whiteWineVis.wrangleData();

}

let selectedVariety = $('#categorySelector').val();

function varietyChange() {
    selectedVariety = $('#categorySelector').val();
    myWordCloud.wrangleData(); // maybe you need to change this slightly depending on the name of your MapVis instance
    myPieChart.wrangleData()
    myBarChart.wrangleData();
}

