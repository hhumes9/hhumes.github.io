/* main JS file */



class RadarVis {


  constructor(_parentElement, _data, _top, title, legendElement) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.top = _top
    this.displayData = [];
    this.title = title;
    this.legendElement = legendElement
    this.initVis();
  }

  initVis(){
    let vis = this;

    vis.w = $(vis.parentElement).width() -200;
    vis.h = $(vis.parentElement).width() -200;

    vis.legendheight = $(vis.legendElement).height();
    vis.legendwidth = $(vis.legendElement).width();

    console.log(vis.legendElement)

    vis.legendSvg = d3.select(vis.legendElement)
        .append("svg")
        .attr('class', 'legend')
        .attr("width", vis.legendwidth)
        .attr("height", vis.legendheight)



      vis.wrangleData()
  }



wrangleData(){

    let vis = this;


  vis.displayData = vis.data

  if (vis.top){
    vis.displayData.sort((a,b) => {return b.quality - a.quality})
  } else {
    vis.displayData.sort((a,b) => {return a.quality - b.quality})
  }

  vis.wines3 = vis.data.filter((wine => wine.quality == 3));
  vis.wines4 = vis.data.filter((wine => wine.quality == 4));
  vis.wines5 = vis.data.filter((wine => wine.quality == 5));
  vis.wines6 = vis.data.filter((wine => wine.quality == 6));
  vis.wines7 = vis.data.filter((wine => wine.quality == 7));
  vis.wines8 = vis.data.filter((wine => wine.quality == 8));

    vis.wines = [];
    vis.legend =[];

    if (document.getElementById("quality3").checked == true){
        vis.wines.push(vis.wines3)
        vis.legend.push(3)
    }
    if (document.getElementById("quality4").checked == true){
        vis.wines.push(vis.wines4)
        vis.legend.push(4)
    }
    if (document.getElementById("quality5").checked == true){
        vis.wines.push(vis.wines5)
        vis.legend.push(5)
    }
    if (document.getElementById("quality6").checked == true){
        vis.wines.push(vis.wines6)
        vis.legend.push(6)
    }
    if (document.getElementById("quality7").checked == true){
        vis.wines.push(vis.wines7)
        vis.legend.push(7)
    }
    if (document.getElementById("quality8").checked == true){
        vis.wines.push(vis.wines8)
        vis.legend.push(8)
    }

  vis.qualityData =[];

  vis.wines.forEach(winedata=> {
        function avg(data, attr){
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
                    sum = +(sum) + +((data[i][attr]));
                }
            let average = (sum/data.length) - 4
            return average
        }


      vis.qualityData.push({
          Quality: avg(winedata, "quality"),
          alcohol: avg(winedata, "alcohol"),
          pH: avg(winedata, "pH"),
          density: avg(winedata, "density"),
          resSugar: avg(winedata, "residual sugar"),
          volAcid: avg(winedata, "volatile acidity"),
          fixAcid: avg(winedata, "fixed acidity"),
          citAcid: avg(winedata, "citric acid"),
          chlorides: avg(winedata, "chlorides"),
          totSulfur: avg(winedata, "total sulfur dioxide"),
          freeSulfur: avg(winedata, "free sulfur dioxide"),
          sulphates: avg(winedata, "sulphates")
      })
  })

    vis.finalData= [];

    vis.wines.forEach(winedata => {
        vis.finalData.push([])
        }
    )

    let i = 0;
    vis.qualityData.forEach(wine => {
        if (document.getElementById("attribute1").checked == true){
            vis.finalData[i].push({axis: "Alcohol", value: (wine.alcohol) })
        }
        if (document.getElementById("attribute2").checked == true) {
            vis.finalData[i].push({axis: "pH", value: (wine.pH)})
        }
        if (document.getElementById("attribute3").checked == true) {
            vis.finalData[i].push({axis: "Density", value: (wine.density)})
        }
        if (document.getElementById("attribute4").checked == true) {
            vis.finalData[i].push({axis: "Residual Sugar", value: wine.resSugar})
        }
        if (document.getElementById("attribute5").checked == true) {
            vis.finalData[i].push({axis: "Volatile Acidity", value: wine.volAcid})
        }
        if (document.getElementById("attribute6").checked == true) {
            vis.finalData[i].push({axis: "Fixed Acidity", value: wine.fixAcid})
        }
        if (document.getElementById("attribute7").checked == true) {
            vis.finalData[i].push({axis: "Citric Acid", value: wine.citAcid})
        }
        if (document.getElementById("attribute8").checked == true) {
            vis.finalData[i].push({axis: "Chlorides", value: wine.chlorides })
        }
        if (document.getElementById("attribute9").checked == true) {
            vis.finalData[i].push({axis: "Free Sulfur Dioxide", value: wine.freeSulfur})
        }
        if (document.getElementById("attribute10").checked == true) {
            vis.finalData[i].push({axis: "Total Sulfur Dioxide", value: wine.totSulfur})
        }
        if (document.getElementById("attribute11").checked == true) {
            vis.finalData[i].push({axis: "Sulphates", value: wine.sulphates})
        }
        i++;
    })

    console.log(vis.finalData)
    vis.updateVis()

};




updateVis () {
  let vis = this;

  vis.color = d3.scaleOrdinal(d3.schemeReds[6]);

  if (vis.data == whiteWine){
      vis.color = d3.scaleOrdinal(d3.schemeGreens[6]);
  }

  vis.mycfg = {
    w: vis.w,
    h: vis.h,
    maxValue: 2,
    levels: 4,
    ExtraWidthX: 300,
      title: vis.title,
      color: vis.color
  }

  //Call function to draw the Radar chart
  RadarChart.draw(vis.parentElement, vis.finalData, vis.mycfg);

  //Add in the legend



    vis.key = vis.legendSvg.selectAll(".legend")
        .data(vis.legend);

    vis.keylabels = vis.legendSvg.selectAll(".legendtext")
        .data(vis.legend);

    vis.key.enter()
        .append( "g")
        .append("rect")
        .attr("class", "legend")
        .merge(vis.key)
        .attr("fill", function(d, i) {
            return vis.color(i)
        })
        .attr("x", function(d, i) {
            return i * vis.legendwidth/8 + 10;
        } )
        .attr("y", 0)
        .attr("height", 10)
        .attr("width", vis.legendwidth/8 );

    vis.key.exit().remove();

    vis.keylabels.exit().remove();
    vis.keylabels.enter()
        .append("g")
        .append("text")
        .attr("class", "legend-text")
        .style("fill", "white")
        .text(d =>{
            return d
        }
            )
        .attr('y', 30)
        .attr("x", function(d, i) {
        return i * vis.legendwidth/8 + 10 +5;
    } );



}


};
