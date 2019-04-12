/* Define global constants */
const JSONURL="https://raw.githubusercontent.com/ilixandr/iwannaweb.ro/master/projects/rawdata/GDP-data.json"
const ANIMATIONDURATION = 250
const NOANIMATIONDURATION = 0
const OPACITYVALUE = 0.85
const width = 825
const height = 500
const padding = 100

/* Define helper functions */
const getGDPValues = (dataset) => {
  let GDPValues = [];
  for (let i = 0; i < dataset.length; i++) {
    GDPValues.push(dataset[i][1]);
  }
  const valueScale = d3.scaleLinear()
                       .domain([0, d3.max(GDPValues)])
                       .range([0, height]);
  let scaledGDPValues = [];
  scaledGDPValues = GDPValues.map((d) => valueScale(d));
  let objGDPValues = {"scaledGDPValues": scaledGDPValues, "GDPValues": GDPValues};
  return objGDPValues;
}
const quarterFromNumbers = (number) => {
  switch(number) {
    case "01": return "Q1";
    case "04": return "Q2";
    case "07": return "Q3";
    default: return "Q4";
  }
}
const getGDPYears = (dataset) => {
  let GDPYears = [];
  let nGDPYears = [];
  for (let i = 0; i < dataset.length; i++) {
    GDPYears.push(dataset[i][0].slice(0, 4) + " " + quarterFromNumbers(dataset[i][0].slice(5, 7)));
    nGDPYears.push(dataset[i][0]);
  }
  let objGDPYears = {"GDPYears": GDPYears, "nGDPYears": nGDPYears};
  return objGDPYears;
}

/* Define the main svg and tooltip components*/
const graph = d3.select("#container")
                       .append("svg")
                       .attr("width", width + padding)
                       .attr("height", height + padding);
const tooltip = d3.select("#tooltip");
const overlay = d3.select(".overlay");

/* Read from JSON here, using promise (.then) */
d3.json(JSONURL).then(function(dataset) {
  let GDPValues = getGDPValues(dataset.data).scaledGDPValues;
  let nGDPValues = getGDPValues(dataset.data).GDPValues;
  let GDPYears = getGDPYears(dataset.data).GDPYears;
  let nGDPYears = getGDPYears(dataset.data).nGDPYears;
  /* n in nGDPValues and nGDPYears stands for normal */
  graph.append("text")
    .attr("transform", "rotate(270)")
    .attr("x", 0 - height / 2 - padding)
    .attr("y", 70)
    .text("Gross Domestic Product [$ Billions]")
    .attr("font-weight", "300");
  let timeMin = new Date(d3.min(nGDPYears, (d) => d));
  let timeMax = new Date(d3.max(nGDPYears, (d) => d));
  /*
  statement below fixes [User Story #10]
  */
  timeMax.setMonth(timeMax.getMonth() + 3);
  /* now that [User Story #10] test passes, let's plot the axes */
  const xAxisScale = d3.scaleTime()
                       .domain([timeMin, timeMax])
                       .range([0, width]);
  const yAxisScale = d3.scaleLinear()
                       .domain([0, d3.max(nGDPValues, (d) => d)])
                       .range([height, 0]);
  const xAxis = d3.axisBottom(xAxisScale);
  const yAxis = d3.axisLeft(yAxisScale);
  graph.append("g")
       .attr("transform", "translate(" + padding / 2 + "," + (height + padding / 2) +")").call(xAxis).attr("id", "x-axis");
  graph.append("g")
       .attr("transform", "translate(" + padding / 2 + ", " + padding / 2 + ")").call(yAxis).attr("id", "y-axis");
  graph.selectAll("rect")
         .data(GDPValues)
         .enter()
         .append("rect")
         .attr("x", (d,i) => padding / 2 + i * width / 275)
         .attr("y", (d) => padding / 2 + height - d)
         .attr("width", width / 275)
         .attr("height", (d) => d)
         .attr("class", "bar")
         .attr("data-date", (d, i) => dataset.data[i][0])
         .attr("data-gdp", (d, i) => dataset.data[i][1])
         .on("mouseover", (d, i) => {
    overlay.transition()
        .duration(NOANIMATIONDURATION)
        .style("height", d + "px")
        .style("width", width / 275 + "px")
        .style("opacity", OPACITYVALUE)
        .style("left", (width / 2 + 27 + padding + i * width / 275) + "px")
        .style("top", 2 * padding + height - 28 - d + "px");
      tooltip.transition()
        .duration(ANIMATIONDURATION)
        .style("opacity", OPACITYVALUE);
      tooltip.html(GDPYears[i] + "<br>" + "$" + nGDPValues[i] + " Billions")
        .attr("data-date", dataset.data[i][0])
        .style("left", (width / 2 + padding + i * width / 275) + "px")
        .style("top", height + "px")
        .style("z-index", 3);
  })
  .on("mouseout", () => {
      tooltip.transition()
        .duration(ANIMATIONDURATION)
        .style("opacity", 0);
      overlay.transition()
        .duration(ANIMATIONDURATION)
        .style("opacity", 0);
  });
});