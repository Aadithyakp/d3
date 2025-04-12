// Fetch weather data and create Sankey diagram
const apiKey = "861b1e7090c4485794c235547250904";
const city = "London"; 
const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;

// Fetch weather data
fetch(weatherApiUrl)
    .then(response => response.json())
    .then(data => {
        updateWeatherInfo(data);
        createSankeyDiagram(data);
    })
    .catch(error => console.error("Error fetching weather data:", error));

function updateWeatherInfo(data) {
    const { current, location } = data;
    document.querySelector("#weather-info").innerHTML = `
        <h2>Weather in ${location.name}, ${location.country}</h2>
        <p>Temperature: ${current.temp_c}°C</p>
        <p>Condition: ${current.condition.text}</p>
        <p>Air Quality Index: ${current.air_quality["us-epa-index"]}</p>
    `;
}

function createSankeyDiagram(data) {
    // Set up dimensions
    const width = document.getElementById('sankey-container').clientWidth - 40;
    const height = document.getElementById('sankey-container').clientHeight - 40;

    // Create SVG
    const svg = d3.select("#sankey-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create Sankey generator
    const sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 6]]);

    // Prepare data for Sankey diagram
    const { current } = data;
    const sankeyData = {
        nodes: [
            { name: "Temperature" },
            { name: "Wind" },
            { name: "Air Quality" },
            { name: "Comfort Level" },
            { name: "Health Impact" },
            { name: "Overall Weather" }
        ],
        links: [
            { source: 0, target: 3, value: Math.abs(current.temp_c) },
            { source: 0, target: 4, value: Math.abs(current.temp_c) / 2 },
            { source: 1, target: 3, value: current.wind_kph },
            { source: 1, target: 5, value: current.wind_kph / 2 },
            { source: 2, target: 4, value: current.air_quality["us-epa-index"] * 10 },
            { source: 2, target: 5, value: current.air_quality["us-epa-index"] * 5 },
            { source: 3, target: 5, value: Math.abs(current.temp_c) + current.wind_kph },
            { source: 4, target: 5, value: current.air_quality["us-epa-index"] * 8 }
        ]
    };

    // Generate Sankey layout
    const { nodes, links } = sankey(sankeyData);

    // Add links
    const link = svg.append("g")
        .selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .style("stroke-width", d => Math.max(1, d.width));

    // Add nodes
    const node = svg.append("g")
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Add rectangles for nodes
    node.append("rect")
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .style("fill", d => d3.schemeCategory10[nodes.indexOf(d) % 10])
        .style("stroke", "#000");

    // Add labels
    node.append("text")
        .attr("x", d => (d.x0 < width / 2) ? 6 + (d.x1 - d.x0) : -6)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => (d.x0 < width / 2) ? "start" : "end")
        .text(d => d.name)
        .style("fill", "#000")
        .style("font-size", "10px");

    // Add tooltips
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    link
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Flow value: ${Math.round(d.value)}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}
