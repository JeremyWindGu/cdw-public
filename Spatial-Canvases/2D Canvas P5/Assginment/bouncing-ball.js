var sketch2 = function(p) {
  var bars = [];
  var numBars = 20;
  var barWidth = 30;
  var barHeight = 80;
  var speedRange = [2, 6];
  
  // 字母频率模拟（从高到低）：
  // 来源于常见英语字母频率表
  var frequencyWeightedLetters = (
    'eeeeeeeeeeeeeeettttttttttaaaaaaaaaooooooooiiiiiiiinnnnnnnnssssssrrrrrr' +
    'hhhhhhdddddllllluuuumccyfwgpbvkjxqz'
  ).split('');

  var metalColors = [
  p.color(192, 192, 192, 180),   // 银色
  p.color(70, 70, 70, 180),      // 铁灰
  p.color(255, 215, 0, 180)      // 18K 金色
  ];

  p.setup = function() {
    var canvas = p.createCanvas(800, 400);
    canvas.parent('canvas-container-2');
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont('monospace');
    p.textSize(32);

    let spacing = p.width / numBars;

    for (let i = 0; i < numBars; i++) {
      let bar = {
        x: i * spacing + (spacing - barWidth) / 2,
        y: p.random(-p.height, 0),
        speed: p.random(speedRange[0], speedRange[1]),
        color: metalColors[p.floor(p.random(metalColors.length))],
        letter: randomLetter()
      };
      bars.push(bar);
    }
  };

  function drawMetalBar(x, y, w, h, baseColor) {
    // 1️⃣ 底色：去掉圆角
    p.noStroke();
    p.fill(baseColor);
    p.rect(x, y, w, h);  // 不再用圆角 → 增强金属块硬感

    // 2️⃣ 左侧斜面高光（模拟切边反光）
    let leftGrad = p.drawingContext.createLinearGradient(x, 0, x + w * 0.15, 0);
    leftGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
    p.drawingContext.fillStyle = leftGrad;
    p.rect(x, y, w * 0.15, h);

    // 3️⃣ 右侧斜面暗影（模拟立体阴面）
    let rightGrad = p.drawingContext.createLinearGradient(x + w * 0.85, 0, x + w, 0);
    rightGrad.addColorStop(0, 'rgba(0,0,0,0)');
    rightGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
    p.drawingContext.fillStyle = rightGrad;
    p.rect(x + w * 0.85, y, w * 0.15, h);

    // 4️⃣ 中央略亮主面（金属面反光）
    let centerGrad = p.drawingContext.createLinearGradient(x, y, x, y + h);
    centerGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    centerGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
    centerGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
    p.drawingContext.fillStyle = centerGrad;
    p.rect(x, y, w, h);

    // 5️⃣ 拉丝纹理（横向线条）
    p.stroke(255, 255, 255, 15);
    p.strokeWeight(0.5);
    for (let i = 0; i < h; i += 3) {
      let jitter = p.random(-0.5, 0.5);
      p.line(x + 2, y + i + jitter, x + w - 2, y + i + jitter);
    }

    p.noStroke(); // 恢复无描边
  }

  p.draw = function() {
    // 画金属背景（模拟水平拉丝金属板）
    p.background(180);  // 浅灰色打底

    // 加入横向拉丝纹理
    p.stroke(255, 255, 255, 15);
    p.strokeWeight(1);
    for (let i = 0; i < p.height; i += 2) {
      let jitter = p.random(-1, 1);
      p.line(0, i + jitter, p.width, i + jitter);
    }
    
    // 画轨道槽（每个 bar 对应一条竖直浅槽）
    for (let i = 0; i < bars.length; i++) {
      let trackX = bars[i].x + barWidth / 2;
      let grad = p.drawingContext.createLinearGradient(trackX, 0, trackX + barWidth, 0);
      grad.addColorStop(0, 'rgba(112, 112, 112, 0.5)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
      grad.addColorStop(1, 'rgba(131, 131, 131, 0.5)');

      p.drawingContext.fillStyle = grad;
      p.noStroke();
      p.rect(bars[i].x - 2, 0, barWidth + 4, p.height);
    }

    for (let i = 0; i < bars.length; i++) {
      let bar = bars[i];

      drawMetalBar(bar.x, bar.y, barWidth, barHeight, bar.color);
      // 模拟压凹雕刻效果：深色主字 + 高亮轮廓
      let cx = bar.x + barWidth / 2;
      let cy = bar.y + barHeight / 2;

      // 1️⃣ 黑色阴影微移（底部压凹感）
      p.fill(0, 100);
      p.text(bar.letter.toUpperCase(), cx + 1.5, cy + 1.5);

      // 2️⃣ 白色亮边微移（右上光反射边）
      p.fill(255, 200);
      p.text(bar.letter.toUpperCase(), cx - 1, cy - 1);

      // 3️⃣ 中间主字（灰色压感）
      p.fill(180);
      p.text(bar.letter.toUpperCase(), cx, cy);

      // 更新位置
      bar.y += bar.speed;

      if (bar.y > p.height) {
        bar.y = -barHeight;
        bar.speed = p.random(speedRange[0], speedRange[1]);
        bar.letter = randomLetter();  // 重新随机字母
      }
    }
  };

  function randomLetter() {
    // 从频率表中随机一个字母
    let index = p.floor(p.random(frequencyWeightedLetters.length));
    return frequencyWeightedLetters[index];
  }
};

var myp5_2 = new p5(sketch2, 'canvas-container-2');