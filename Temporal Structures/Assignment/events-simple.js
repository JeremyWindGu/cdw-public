(async function() { 

// 0. 画布设置 // Canvas setup
  // 0.1 定义尺寸 // Define margins and size
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = 1200 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;
  // 0.2 创建元素 // Create SVG container
  const svg = d3.select('#d3-container-typhoon')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// 1. 数据加载与初步处理 // Load and preprocess data
  // 1.1 加载数据文件 // Load data file
  const response = await fetch('CH2024BST.txt');
  const rawText = await response.text();
  // 1.2 拆分文本数据 // Split raw text into lines
  const lines = rawText.trim().split('\n');
  const storms = [];
  let currentStorm = null;
  // 1.3 解析数据 // Parse storm and point data
    // 1.3.1 遇到以'66666'开头的行，代表新的台风记录开始 // Line starts with '66666' marks a new storm
  lines.forEach(line => {
    if (line.startsWith('66666')) {
      if (currentStorm) storms.push(currentStorm);
      const name = line.slice(35, 60).trim();
      currentStorm = { name, points: [] };
    // 1.3.2 非起始行则解析具体气象观测数据点 // Otherwise, parse point data
    } else if (currentStorm) {
      const dateStr = line.slice(0, 10);       // 日期 // Date string
      const category = parseInt(line.slice(11, 12), 10); // 台风等级 // Typhoon category
      const lat = parseInt(line.slice(13, 16), 10) / 10; // 纬度 // Latitude
      const lon = parseInt(line.slice(17, 21), 10) / 10; // 经度 // Longitude
      const pressure = parseInt(line.slice(22, 26), 10); // 气压 // Pressure
      const wind = parseInt(line.slice(32, 35), 10);     // 风速 // Wind speed
      // 将日期字符串转换为js Date对象 // Convert date string to JS Date
      const date = new Date(
        dateStr.slice(0, 4) + '-' +
        dateStr.slice(4, 6) + '-' +
        dateStr.slice(6, 8) + 'T' +
        dateStr.slice(8, 10) + ':00'
      );
      currentStorm.points.push({ date, lat, lon, pressure, wind, category });
    }
  });
  // 1.3.3 确保最后一个台风数据也被添加 // Push final storm
  if (currentStorm) storms.push(currentStorm);

// 2. 提取风速最大时的关键数据点 // Extract peak wind points for each storm
  const events = storms.map(storm => {
    const maxPoint = storm.points.reduce((a, b) => (a.wind > b.wind ? a : b));
    return {
      name: storm.name,
      date: maxPoint.date,
      wind: maxPoint.wind,
      pressure: maxPoint.pressure,
      lat: maxPoint.lat,
      lon: maxPoint.lon,
      category: maxPoint.category
    };
  });

// 3. 创建比例尺 // Create scales
  // 3.1 时间比例尺 // Time scale
  const timeScale = d3.scaleTime()
    .domain(d3.extent(events, d => d.date))
    .range([0, width]);

  // 3.2 纬度比例尺 // Latitude scale
  const latScale = d3.scaleLinear()
    .domain(d3.extent(events, d => d.lat))
    .range([height - 50, 50]);

  // 3.3 颜色比例尺 // Pressure-to-color scale
  const colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain(d3.extent(events, d => d.pressure));

  // 3.4 风速大小比例尺 // Wind-to-size scale
  const windSizeScale = d3.scaleSqrt()
    .domain(d3.extent(events, d => d.wind))
    .range([4, 16]);

// 4. 绘制坐标轴 // Draw axes
  // 4.1 创建时间轴 // Time axis (x-axis)
  const xAxis = d3.axisBottom(timeScale).tickFormat(d3.timeFormat('%b %d'));
  svg.append('g')
    .attr('transform', `translate(0, ${height - 50})`)
    .call(xAxis);

  // 4.2 x轴标题 // x-axis title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .text('Typhoon Peak Dates (2024)');

  // 4.3 创建纬度轴 // Latitude axis (y-axis)
  const yAxis = d3.axisLeft(latScale).ticks(6);
  svg.append('g').call(yAxis);

  // 4.4 y轴标题 // y-axis title
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -40)
    .attr('text-anchor', 'middle')
    .text('Latitude (°N)');

  // 4.5 绘制折线轨迹（每个台风一条线，颜色随气压变化） // Draw storm track as lines, color represents pressure
  storms.forEach(storm => {
    for (let i = 0; i < storm.points.length - 1; i++) {
      const p1 = storm.points[i];
      const p2 = storm.points[i + 1];

      svg.append('line')
        .attr('x1', timeScale(p1.date))
        .attr('y1', latScale(p1.lat))
        .attr('x2', timeScale(p2.date))
        .attr('y2', latScale(p2.lat))
        .attr('stroke', colorScale(p1.pressure)) // 使用p1的气压 // Use pressure of p1
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.8);
    }
  });

// 5. 绘制数据点 // Draw peak wind data points
  svg.selectAll('circle')
    .data(events)
    .enter()
    .append('circle')
    .attr('cx', d => timeScale(d.date))       // x // Time
    .attr('cy', d => latScale(d.lat))         // y // Latitude
    .attr('r', d => windSizeScale(d.wind))    // 半径 // Radius by wind
    .attr('fill', d => colorScale(d.pressure))// 着色 // Fill by pressure
    .style('opacity', 0.7)                    // 透明度 // Semi-transparent
    .attr('stroke', '#ddd')                  // 描边 // Light border
    .attr('stroke-width', 1.5)               // 描边宽度 // Border width

    // 鼠标悬停提示 // Tooltip on hover
    .on('mouseover', function(event, d) {
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(`
        <strong>${d.name}</strong><br>
        Date: ${d3.timeFormat('%Y-%m-%d %H:%M')(d.date)}<br>
        Wind: ${d.wind} m/s<br>
        Pressure: ${d.pressure} hPa<br>
        Lat/Lon: ${d.lat}, ${d.lon}<br>
        Category: ${d.category}
      `)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 20) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition().duration(200).style('opacity', 0);
    });

  // 添加台风等级数字标签 // Add typhoon category label
  svg.selectAll('.typhoon-label')
    .data(events)
    .enter()
    .append('text')
    .attr('class', 'typhoon-label')
    .attr('x', d => timeScale(d.date))
    .attr('y', d => latScale(d.lat) + 4)      // 文字垂直微调使其居中 // Vertical adjust
    .attr('text-anchor', 'middle')            // 水平居中对齐 // Centered text
    .style('fill', '#fff')                    // 文字颜色为白色 // White text
    .style('font-size', '10px')               // 文字字号 // Font size
    .style('pointer-events', 'none')          // 避免文字阻挡鼠标事件 // Ignore pointer
    .text(d => d.category);                   // 显示台风等级数字 // Show category

// 6. 创建并初始化工具提示元素（隐藏状态） // Initialize hidden tooltip
  const tooltip = d3.select('#d3-container-typhoon')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')            // 绝对定位，方便跟随鼠标 // Absolute position
    .style('background', '#000')              // 黑色背景 // Background black
    .style('color', '#fff')                   // 白色字体 // White text
    .style('padding', '8px 12px')             // 内边距 // Padding
    .style('border-radius', '5px')            // 圆角边框 // Border radius
    .style('font-size', '12px')               // 字号 // Font size
    .style('opacity', 0);                     // 初始完全透明（隐藏） // Hidden by default

})();