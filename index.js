function InteractiveParticles(canvas, args){
    var that = this;
    this.canvas = canvas;
    this.args = args;
    this.density = 12;
    this.produceDistance = 1;
    this.baseRadius = 2.377;
    this.reactionSensitivity = 1;
    this.particleRecessSpeed = 0.15;
    this.canvasPadding = 30
    this.ignoreColors = [];
    this.particles = [];
    this.mouse = {
        x: -1000,
        y: -1000,
        down: false
    };
    this.animation = null;
    this.context = null;
    this.bgImage = null;
    this.bgCanvas = null;
    this.bgContext = null;
    this.bgContextPixelData = null;
  
    for (var key in args) {
      this[key] = args[key];
    }
  
    this.add = function() {
        // Set up the visual canvas
        that.context = that.canvas.getContext('2d', { alpha: true });
  
        // this.context.globalCompositeOperation = "lighter";
        if(that.size.length){
          that.canvas.width = that.size[0] + (that.canvasPadding*2);
          that.canvas.height = that.size[1] + (that.canvasPadding*2);
        }else{
          that.canvas.width = that.canvas.clientWidth + (that.canvasPadding*2);
          that.canvas.height = that.canvas.clientHeight + (that.canvasPadding*2);
        }
  
        that.canvas.style.display = 'block'
        that.canvas.addEventListener('mousemove', that.pointerMove, false);
        that.canvas.addEventListener('mouseout', that.pointerOut, false);
        that.canvas.addEventListener('touchstart', that.pointerMove, false);
        that.canvas.addEventListener('ontouchend', that.pointerOut, false);
  
        window.onresize = function(event) {
          if(that.size.length){
            that.canvas.width = that.size[0];
            that.canvas.height = that.size[1];
          }else{
            that.canvas.width = that.canvas.clientWidth;
            that.canvas.height = that.canvas.clientHeight;
          }
          that.onWindowResize();
        }
  
        // Load initial input image
        that.getImageData(that.image);
    };
  
    this.makeParticles = function() {
        // remove the current particles
        that.particles = [];
        var width, height, i, j;
        var colors = that.bgContextPixelData.data;
  
        for (i = 0; i < that.canvas.height; i += that.density) {
  
            for (j = 0; j < that.canvas.width; j += that.density) {
  
  
                var pixelPosition = (j + i * that.bgContextPixelData.width) * 4;
  
                // Ignore colors
                var ignoreColor = false;
                if(that.ignoreColors.length){
                    for (var ckey in that.ignoreColors){
                        if (colors[pixelPosition] == that.ignoreColors[ckey][0] && (colors[pixelPosition + 1]) == that.ignoreColors[ckey][1] && (colors[pixelPosition + 2]) == that.ignoreColors[ckey][2]) {
                            ignoreColor = true;
                        }
                    }
                    if(ignoreColor) continue;
                }
  
                var color = 'rgba(' + colors[pixelPosition] + ',' + colors[pixelPosition + 1] + ',' + colors[pixelPosition + 2] + ',' + '1)';
                that.particles.push({
                    x: j,
                    y: i,
                    originalX: j,
                    originalY: i,
                    color: color
                });
            }
        }
    };
  
    this.updateparticles = function() {
  
        var i, currentPoint, theta, distance;
  
        for (i = 0; i < that.particles.length; i++) {
  
            currentPoint = that.particles[i];
  
            theta = Math.atan2(currentPoint.y - that.mouse.y, currentPoint.x - that.mouse.x);
  
            if (that.mouse.down) {
                distance = that.reactionSensitivity * 200 / Math.sqrt((that.mouse.x - currentPoint.x) * (that.mouse.x - currentPoint.x) +
                    (that.mouse.y - currentPoint.y) * (that.mouse.y - currentPoint.y));
            } else {
                distance = that.reactionSensitivity * 100 / Math.sqrt((that.mouse.x - currentPoint.x) * (that.mouse.x - currentPoint.x) +
                    (that.mouse.y - currentPoint.y) * (that.mouse.y - currentPoint.y));
            }
  
  
            currentPoint.x += Math.cos(theta) * distance + (currentPoint.originalX - currentPoint.x) * that.particleRecessSpeed;
            currentPoint.y += Math.sin(theta) * distance + (currentPoint.originalY - currentPoint.y) * that.particleRecessSpeed;
  
        }
    };
  
    this.produceparticles = function() {
  
        var i, currentPoint;
  
        for (i = 0; i < that.particles.length; i++) {
  
            currentPoint = that.particles[i];
  
            // produce the dot.
            that.context.fillStyle = currentPoint.color;
            that.context.strokeStyle = currentPoint.color;
  
            that.context.beginPath();
            that.context.arc(currentPoint.x, currentPoint.y, that.baseRadius, 0, Math.PI * 2, true);
            that.context.closePath();
            that.context.fill();
  
        }
    };
  
    this.produce = function() {
        that.animation = requestAnimationFrame(function() {
            that.produce()
        });
  
        that.remove();
        that.updateparticles();
        that.produceparticles();
  
    };
  
    this.remove = function() {
      that.canvas.width = that.canvas.width;
    };
  
    // The filereader has loaded the image... add it to image object to be producen
    this.getImageData = function(data) {
  
      that.bgImage = new Image;
      that.bgImage.src = data;
  
      that.bgImage.onload = function() {
  
      //this
          that.produceInteractiveParticles();
      }
    };
  
    // Image is loaded... produce to bg canvas
    this.produceInteractiveParticles = function() {
  
      that.bgCanvas = document.createElement('canvas');
      that.bgCanvas.width = that.canvas.width;
      that.bgCanvas.height = that.canvas.height;
  
        var newWidth, newHeight;
  
        // // If the image is too big for the screen... scale it down.
        // if (this.bgImage.width > this.bgCanvas.width - this.canvasPadding || this.bgImage.height > this.bgCanvas.height - this.canvasPadding) {
        //     var maxRatio = Math.max(this.bgImage.width / (this.bgCanvas.width - this.canvasPadding), this.bgImage.height / (this.bgCanvas.height - this.canvasPadding));
        //     newWidth = this.bgImage.width / maxRatio;
        //     newHeight = this.bgImage.height / maxRatio;
        // } else {
            newWidth = that.bgImage.width;
            newHeight = that.bgImage.height;
        // }
  
        // produce to background canvas
        that.bgContext = that.bgCanvas.getContext('2d', { alpha: false });
        that.bgContext.drawImage(that.bgImage, Math.round((that.canvas.width - newWidth) / 2), Math.round((that.canvas.height - newHeight) / 2), Math.round(newWidth), Math.round(newHeight));
        that.bgContextPixelData = that.bgContext.getImageData(0, 0, Math.round(that.bgCanvas.width), Math.round(that.bgCanvas.height));
  
        that.makeParticles();
        that.produce();
    };
  
    this.pointerMove = function(event) {
        that.mouse.x = event.offsetX || (event.layerX - that.canvas.offsetLeft);
        that.mouse.y = event.offsetY || (event.layerY - that.canvas.offsetTop);
    };
  
    this.pointerOut = function(event) {
        that.mouse.x = -1000;
        that.mouse.y = -1000;
        that.mouse.down = false;
    };
  
    // Resize and reproduce the canvas.
    this.onWindowResize = function() {
        cancelAnimationFrame(that.animation);
        that.produceInteractiveParticles();
    };
  
    this.add(this.canvas, this.args);
  }
  
  (function() {
    var dots = new InteractiveParticles(document.getElementById('dots'), {
      size: [690,130],
      density: 5,
      baseRadius: 1,
      ignoreColors: [
        [0,0,0]
      ],
      // image: "https://blog.codepen.io/wp-content/uploads/2012/06/Button-Fill-White-Large.png",
      image: " data:image/png;base64,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"
    });
  })();