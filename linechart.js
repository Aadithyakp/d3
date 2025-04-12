// line.js
const apiKey = "861b1e7090c4485794c235547250904";
const city = "London"; 
const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;

fetch(weatherApiUrl)
  .then(response => response.json())
  .then(data => {
    const airQuality = data.current.air_quality;
    const temperature = data.current.temp_c;  // Temperature in Celsius
    const humidity = data.current.humidity;  // Humidity percentage

    function updateWeatherInfo(data) {
      const { current, location } = data;
      document.querySelector("#weather-info").innerHTML = `
          <h2>Weather in ${location.name}, ${location.country}</h2>
          <p>Temperature: ${current.temp_c}°C</p>
          <p>Condition: ${current.condition.text}</p>
          <p>Air Quality Index: ${current.air_quality["us-epa-index"]}</p>
      `;
    }

    // Update weather info on the page
    updateWeatherInfo(data);

    // Data for line chart: air quality components (CO, NO2, O3) + temperature and humidity
    const lineData = [
      { component: 'Temperature', value: temperature },
      { component: 'Humidity', value: humidity },
      { component: 'CO', value: airQuality.co },
      { component: 'NO2', value: airQuality.no2 },
      { component: 'O3', value: airQuality.o3 }
    ];

    // Set up dimensions for the line chart
    const width = 500, height = 400, margin = 30;

    const svg = d3.select('#line-chart').append('svg')
      .attr('width', width)
      .attr('height', height);

    // Set scales for the axes
    const xScale = d3.scaleBand().domain(lineData.map(d => d.component)).range([margin, width - margin]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, d3.max(lineData, d => d.value)]).range([height - margin, margin]);

    // Create line generator for the line chart
    const line = d3.line()
      .x(d => xScale(d.component) + xScale.bandwidth() / 2)  // Adjust to center the points
      .y(d => yScale(d.value));

    // Create the line path
    svg.append('path')
      .data([lineData])
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 2);

    // Create circles at each point on the line
    svg.selectAll('.dot')
      .data(lineData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.component) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.value))
      .attr('r', 5)
      .attr('fill', (d) => {
        // Different colors for different components
        if (d.component === 'Temperature') return 'orange';
        if (d.component === 'Humidity') return 'blue';
        if (d.component === 'CO') return 'green';
        if (d.component === 'NO2') return 'red';
        return 'purple'; // default for O3
      })
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(200).style('visibility', 'visible');
        tooltip.html(`${d.component}: ${d.value}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(500).style('visibility', 'hidden');
      });

    // Add axes to the chart
    svg.append('g').attr('transform', `translate(0,${height - margin})`).call(d3.axisBottom(xScale));
    svg.append('g').attr('transform', `translate(${margin}, 0)`).call(d3.axisLeft(yScale));

    // Tooltip setup for displaying values on hover
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'rgba(0, 0, 0, 0.7)')
      .style('color', 'white')
      .style('padding', '5px')
      .style('border-radius', '3px')
      .style('visibility', 'hidden');
  });
