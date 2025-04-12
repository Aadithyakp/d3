const apiKey = "861b1e7090c4485794c235547250904";
const city = "London"; 
const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;

fetch(weatherApiUrl)
  .then(response => response.json())
  .then(data => {
    const airQuality = data.current.air_quality;
    const temperature = data.current.temp_c;
    const humidity = data.current.humidity;
    const co = airQuality.co;
    const no2 = airQuality.no2;
    const o3 = airQuality.o3;

    function updateWeatherInfo(data) {
      const { current, location } = data;
      document.querySelector("#weather-info").innerHTML = `
          <h2>Weather in ${location.name}, ${location.country}</h2>
          <p>Temperature: ${current.temp_c}°C</p>
          <p>Condition: ${current.condition.text}</p>
          <p>Air Quality Index: ${current.air_quality["us-epa-index"]}</p>
      `;
    }

    updateWeatherInfo(data);

    const bubbleData = [
      { component: 'Temperature', value: temperature },
      { component: 'Humidity', value: humidity },
      { component: 'CO', value: co },
      { component: 'NO2', value: no2 },
      { component: 'O3', value: o3 }
    ];

    const width = 600, height = 400;
    const svg = d3.select('#stacked-chart').append('svg')
      .attr('width', width)
      .attr('height', height);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'rgba(0, 0, 0, 0.7)')
      .style('color', 'white')
      .style('padding', '5px')
      .style('border-radius', '3px')
      .style('visibility', 'hidden');

    let currentY = 50; // Initial top padding

    // Precompute radii
    bubbleData.forEach(d => {
      d.r = Math.sqrt(d.value) * 2;
    });

    // Create bubbles stacked vertically
    svg.selectAll('circle')
      .data(bubbleData)
      .enter().append('circle')
      .attr('cx', width / 2)
      .attr('cy', (d, i) => {
        if (i > 0) {
          currentY += bubbleData[i - 1].r * 2 + 15; // previous radius + padding
        }
        d.cy = currentY + d.r; // final position
        return d.cy;
      })
      .attr('r', d => d.r)
      .attr('fill', (d) => {
        if (d.component === 'Temperature') return 'orange';
        if (d.component === 'Humidity') return 'blue';
        if (d.component === 'CO') return 'green';
        if (d.component === 'NO2') return 'red';
        return 'purple';
      })
      .attr('opacity', 0.75)
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(200).style('visibility', 'visible');
        tooltip.html(`
          <strong>${d.component}</strong>: ${d.value}<br>
          Temperature: ${temperature}°C<br>
          Humidity: ${humidity}%<br>
          CO: ${co}<br>
          NO2: ${no2}<br>
          O3: ${o3}
        `)
        .style('left', (event.pageX + 5) + 'px')
        .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 5) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(500).style('visibility', 'hidden');
      });

    // Add labels on top of bubbles
    svg.selectAll('text')
      .data(bubbleData)
      .enter().append('text')
      .attr('x', width / 2)
      .attr('y', d => d.cy + d.r + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-weight', 'bold')
      .text(d => d.component);
  });
