  var sketch3 = function(p) {
  var canvasWidth = 800;
  var canvasHeight = 600;
  var zoom = 1;
  var offsetX = 0;
  var offsetY = 0;
  var isDragging = false;
  var lastMouseX, lastMouseY;
  var canvas;

  let linePaths = [];
  let lineThickness = 16;
  let spacing = 20;

  p.setup = function() {
    canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container-3');
    generateNonOverlappingLines();
  };

  function generateNonOverlappingLines() {
    let cols = p.width / spacing;
    let rows = p.height / spacing;
    let used = Array(p.floor(cols)).fill().map(() => Array(p.floor(rows)).fill(false));

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (used[x][y]) continue;
        let angle = p.random([0, p.HALF_PI, p.PI, p.PI + p.HALF_PI]);
        let len = p.floor(p.random(2, 5));

        let path = [];
        let dx = p.cos(angle);
        let dy = p.sin(angle);
        let valid = true;

        for (let i = 0; i < len; i++) {
          let cx = x + dx * i;
          let cy = y + dy * i;
          if (
            cx < 0 || cy < 0 || cx >= cols || cy >= rows ||
            used[p.floor(cx)][p.floor(cy)]
          ) {
            valid = false;
            break;
          }
          path.push([cx, cy]);
        }

        if (valid) {
          for (let [cx, cy] of path) {
            used[p.floor(cx)][p.floor(cy)] = true;
          }
          linePaths.push(path.map(([cx, cy]) => [cx * spacing + spacing / 2, cy * spacing + spacing / 2]));
        }
      }
    }
  }

  p.draw = function() {
    p.background(240);
    p.translate(p.width / 2 + offsetX, p.height / 2 + offsetY);
    p.scale(zoom);
    p.translate(-p.width / 2, -p.height / 2);

    drawGrid();
    drawLinePattern();
  };

  function drawGrid() {
    p.stroke(200);
    p.strokeWeight(1);
    let step = 40;
    for (let x = 0; x <= p.width; x += step) {
      p.line(x, 0, x, p.height);
    }
    for (let y = 0; y <= p.height; y += step) {
      p.line(0, y, p.width, y);
    }
  }

  function drawLinePattern() {
    p.noFill();
    p.stroke(50);
    p.strokeWeight(lineThickness);
    for (let path of linePaths) {
      p.beginShape();
      for (let [x, y] of path) {
        p.vertex(x, y);
      }
      p.endShape();
    }
  }

  p.mouseWheel = function(event) {
    if (canvas && canvas.elt.matches(':hover')) {
      var zoomFactor = 1.05;
      if (event.delta > 0) {
        zoom /= zoomFactor;
      } else {
        zoom *= zoomFactor;
      }
      zoom = p.constrain(zoom, 0.2, 5);
      return false;
    }
  };

  p.mousePressed = function() {
    if (
      canvas && canvas.elt.matches(':hover') &&
      p.mouseButton === p.LEFT &&
      p.mouseX >= 0 && p.mouseX <= p.width &&
      p.mouseY >= 0 && p.mouseY <= p.height
    ) {
      isDragging = true;
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
    }
  };

  p.mouseDragged = function() {
    if (isDragging && canvas && canvas.elt.matches(':hover')) {
      offsetX += p.mouseX - lastMouseX;
      offsetY += p.mouseY - lastMouseY;
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
    }
  };

  p.mouseReleased = function() {
    isDragging = false;
  };
};

var myp5_3 = new p5(sketch3, 'canvas-container-3');