let redWineVis,
  whiteWineVis,
    redWine,
    whiteWine


let promises = [

  d3.csv("data/winequality-red.csv"),
  d3.csv("data/winequality-white.csv")

];

Promise.all(promises)
  .then( function(data){ createVis(data)})
  .catch( function (err){console.log(err)} );


function createVis(data){
  redWine = data[0];
  whiteWine = data[1];


  redWineVis = new RadarVis("#bottom-wine", redWine, false, "Red Wines")
  whiteWineVis = new RadarVis("#top-wine", whiteWine, true, "White Wines")

};


function onSelectionChange(){


    redWineVis.wrangleData();
    whiteWineVis.wrangleData();

}
