const apiKey = "861b1e7090c4485794c235547250904";
const city = "London"; 
const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;

fetch(weatherApiUrl)
  .then(response => response.json())
  .then(data => {
    const airQuality = data.current.air_quality;
    const temperature = data.current.temp_c;  // Temperature in Celsius
    const condition = data.current.condition.text;  // Weather condition (e.g., Sunny, Cloudy)
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

    // Data for scatter plot: air quality components (CO, NO2, O3) + temperature and humidity
    const scatterData = [
      { component: 'Temperature', value: temperature },
      { component: 'Humidity', value: humidity },
      { component: 'CO', value: airQuality.co },
      { component: 'NO2', value: airQuality.no2 },
      { component: 'O3', value: airQuality.o3 }
    ];

    // Set up dimensions
    const width = 500, height = 400, margin = 30;

    // Create the SVG element
    const svg = d3.select('#scatter-chart').append('svg')
      .attr('width', width)
      .attr('height', height);

    // Set scales
    const xScale = d3.scaleBand().domain(scatterData.map(d => d.component)).range([margin, width - margin]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, d3.max(scatterData, d => d.value)]).range([height - margin, margin]);

    // Create circles for scatter plot
    svg.selectAll('circle')
      .data(scatterData)
      .enter().append('circle')
      .attr('cx', d => xScale(d.component) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.value))
      .attr('r', 10)
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

    // Add the axes to the chart
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
