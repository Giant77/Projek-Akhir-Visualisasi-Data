// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 60, left: 60 },
    width = window.innerWidth / 2 - margin.left - margin.right,
    height = window.innerHeight / 2 - margin.top - margin.bottom;
// append the svg object to the body of the page
const svg = d3
    .select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data
d3.csv("./data/nutrition.csv").then((data) => {
    // Add X axis
    const x = d3.scaleLinear().domain([0, 0]).range([0, width]);
    svg.append("g")
        .attr("class", "myXaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .attr("opacity", "0");

    // Add Y axis
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Add dots
    svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return x(d.calories);
        })
        .attr("cy", function (d) {
            return y(d.proteins);
        })
        .attr("r", 1.5)
        .style("fill", "#69b3a2");

    // new X axis
    x.domain([0, 1000]);
    svg.select(".myXaxis")
        .transition()
        .duration(2000)
        .attr("opacity", "1")
        .call(d3.axisBottom(x));

    // animation
    svg.selectAll("circle")
        .transition()
        .delay(function (d, i) {
            return i;
        }) // animation duration
        .duration(1000)
        .attr("cx", function (d) {
            return x(d.calories);
        })
        .attr("cy", function (d) {
            return y(d.proteins);
        });

    // Add X axis label
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 25) // Adjust this value for positioning
        .text("Calories");

    // Add Y axis label
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 28) // Adjust this value for positioning
        .text("Proteins");
});
