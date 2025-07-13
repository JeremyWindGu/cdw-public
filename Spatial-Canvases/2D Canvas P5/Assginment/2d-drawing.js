var sketchArt = function(p) {
  var canvasWidth = 800;
  var canvasHeight = 400;
  var gridSpacing = 40;

  let xScale = 0.02;
  let yScale = 0.02;
  let offset = 0;

  p.setup = function() {
    let canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container-1');
    p.noLoop();
  };

  p.draw = function() {
    p.background(255);

    drawDotNoiseGrid();
    drawGrid();
    drawPrimitives();
  };

  function drawGrid() {
    p.stroke(230);
    p.strokeWeight(1);
    for (let x = 0; x <= p.width; x += gridSpacing) {
      p.line(x, 0, x, p.height);
    }
    for (let y = 0; y <= p.height; y += gridSpacing) {
      p.line(0, y, p.width, y);
    }
  }

function drawPrimitives() {
  p.noStroke();
  const shapeCount = 60;

  for (let i = 0; i < shapeCount; i++) {
    let x = p.random(50, p.width - 50);
    let y = p.random(50, p.height - 50);
    let size = p.random(20, 100);
    let alpha = p.random(80, 200);
    let shapeType = p.floor(p.random(4));  // 0=rect, 1=ellipse, 2=triangle, 3=line

    // 随机颜色（柔和色调）
    let r = p.random(100, 255);
    let g = p.random(100, 255);
    let b = p.random(100, 255);
    let c = p.color(r, g, b, alpha);

    p.fill(c);
    p.stroke(c);
    p.strokeWeight(p.random(1, 3));

    // 使用 push/pop 允许旋转
    p.push();
    p.translate(x, y);
    p.rotate(p.random(p.TWO_PI));

    if (shapeType === 0) {
      // 矩形
      p.rect(0, 0, size, size * p.random(0.3, 1));
    } else if (shapeType === 1) {
      // 椭圆
      p.ellipse(0, 0, size, size * p.random(0.5, 1.2));
    } else if (shapeType === 2) {
      // 三角形
      let h = size * p.random(0.5, 1.2);
      p.triangle(
        -size / 2, h / 2,
          0, -h / 2,
          size / 2, h / 2
      );
    } else if (shapeType === 3) {
      // 线条（透明几何感）
      p.line(0, 0, size, 0);
    }

    p.pop();
  }
}


  function drawDotNoiseGrid() {
    p.noStroke();
    p.fill(0, 50);  // 半透明黑点

    let gap = 20;
    for (let x = gap / 2; x < canvasWidth; x += gap) {
      for (let y = gap / 2; y < canvasHeight; y += gap) {
        let noiseValue = p.noise((x + offset) * xScale, (y + offset) * yScale);
        let diameter = noiseValue * gap;
        p.circle(x, y, diameter);
      }
    }
  }
};

var myp5_art = new p5(sketchArt, 'canvas-container-1');