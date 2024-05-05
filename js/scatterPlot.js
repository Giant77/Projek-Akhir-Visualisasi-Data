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
    // dropdown option
    const allGroup = [
        "Proteins X Calories",
        "Fat X Calories",
        "Carbohydrate X Calories",
        "Fat X Proteins",
        "Carbohydrate X Proteins",
        "Carbohydrate X Fat",
    ];

    const scale = {
        calories: "cal",
        proteins: "gr",
        fat: "gr",
        carbohydrate: "gr",
    };

    console.log(scale);

    // add the options to the button
    d3.select("#select-scatter-plot")
        .selectAll("myOptions")
        .data(allGroup)
        .enter()
        .append("option")
        .text((d) => d) // text showed in the menu
        .attr("value", (d) => d.toLowerCase()); // corresponding value returned by the button

    // Add X axis
    const x = d3.scaleLinear().domain([0, 0]).range([0, width]);
    svg.append("g")
        .attr("class", "x-axis") // give class to both axis, to be able to call it later and modify it
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .attr("opacity", "0");

    // Add Y axis
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => +d.proteins + 10)])
        .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y)).attr("class", "y-axis");

    // Add dots
    const dot = svg
        .append("g")
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
    x.domain([0, d3.max(data, (d) => +d.calories + 10)]);
    svg.select(".x-axis")
        .transition()
        .duration(2000)
        .attr("opacity", "1")
        .call(d3.axisBottom(x));

    // animation for dots
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
    var xLabel = svg
        .append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 25) // Adjust this value for position
        .text("Calories");

    // Add Y axis label
    var yLabel = svg
        .append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 28) // Adjust this value for position
        .text("Proteins");

    var xScale = svg
        .append("text")
        .attr("class", "plot-title")
        .attr("text-anchor", "middle")
        .attr("x", width + 10)
        .attr("y", height + 30)
        .text("cal");

    var yScale = svg
        .append("text")
        .attr("class", "plot-title")
        .attr("text-anchor", "middle")
        .attr("x", -43)
        .attr("y", 10)
        .text("gr");

    // When the button is changed, run the function
    d3.select("#select-scatter-plot").on("change", function (event, d) {
        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value");

        // run the updateChart function with this selected option
        update(selectedOption);
    });

    // func to update the scatter plot
    function update(selectedOption) {
        const option = selectedOption.split(" x "); // split the option into the column used

        // Create new data with the selection
        const dataFilter = data.map(function (d) {
            return { attrX: d[option[1]], attrY: d[option[0]] };
        });

        // update the domain
        y.domain([0, d3.max(data, (d) => +d[option[0]] + 10)]);
        x.domain([0, d3.max(data, (d) => +d[option[1]] + 10)]);

        // update the axis
        svg.select(".y-axis").transition().duration(1000).call(d3.axisLeft(y));

        svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x));

        // new dots
        dot.data(dataFilter)
            .transition()
            .duration(1000)
            .attr("cx", (d) => x(+d.attrX))
            .attr("cy", (d) => y(+d.attrY));

        // update label on x and y axis
        yLabel.text(option[0]);
        xLabel.text(option[1]);

        // update scale on x and y axis
        yScale.text(scale[option[0]]);
        xScale.text(scale[option[1]]);
    }
});
