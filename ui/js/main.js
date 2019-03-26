class Main {
  constructor() {
    console.info('[Main] constructor');
    this.canvas = null;
    this.mainApp = null;
    this.links = [];
    this.swimUrl = `ws://${document.location.hostname}:${document.location.port}`;
    this.facePredictions = [];
    this.catPredictions = [];
    this.gauges = [];
    this.camMenuElement = null;
    this.currentMood = "neutral";
    this.ledMode = "blueeyes";

    this.gauges['facePredictions'] = new PerfGauge("chartsWrapper", "Face Predictions Per Second", this.swimUrl, '/predictions/face', 'fps', 'fpsHistory', "#004868");
    this.gauges['catPredictions'] = new PerfGauge("chartsWrapper", "Cat Predictions Per Second", this.swimUrl, '/predictions/cat', 'fps', 'fpsHistory', '#004868');
    this.gauges['swimMsgIo'] = new PerfGauge("chartsWrapper", "Swim Message I/O Per Second", this.swimUrl, '/introspection', 'message', 'messages', '#0076A9');
    this.gauges['cpuRate'] = new PerfGauge("chartsWrapper", "Host CPU Usage %", this.swimUrl, '/introspection', 'cpuUsage', 'cpuUsageHistory', '#0076A9');
  }

  start(canvas) {
    console.info('[Main] start');
    this.canvas = canvas;
    this.mainApp = new swim.HtmlAppView(document.getElementById("contentWrapper"));
    this.camMenuElement = document.getElementById('cameraMenu');
    document.getElementById('menuButton').onclick = this.toggleMenu.bind(this);
    document.getElementById('ledStateButton').onclick = this.setLedState.bind(this);
    document.getElementById('setMoodButton').onclick = this.setMood.bind(this);
    for (let key in this.gauges) {
      this.gauges[key].start();
    }

    swim.downlinkValue()
      .hostUri(this.swimUrl)
      .nodeUri('/predictions/face')
      .laneUri('latest')
      .didSet((newValue) => {
        const valueArr = eval(newValue.value);
        if (valueArr) {
          this.facePredictions = valueArr;
        } else {
          this.facePredictions = [];
        }
      })
      .open();

    swim.downlinkValue()
      .hostUri(this.swimUrl)
      .nodeUri('/predictions/cat')
      .laneUri('latest')
      .didSet((newValue) => {
        const valueArr = eval(newValue.value);
        if (valueArr) {
          this.catPredictions = valueArr;
        } else {
          this.catPredictions = [];
        }
      })
      .open();


    swim.downlinkValue()
      .hostUri(this.swimUrl)
      .nodeUri('/robotState')
      .laneUri('ledMode')
      .didSet((newValue) => {
        this.ledMode = newValue.value;
        document.getElementById('ledStateSelect').value = this.ledMode;        
      })
      .open();      

    swim.downlinkValue()
      .hostUri(this.swimUrl)
      .nodeUri('/robotState')
      .laneUri('mood')
      .didSet((newValue) => {
        this.onMoodChange(newValue);
      })
      .open();          
    window.requestAnimationFrame(this.updateCanvas.bind(this));
  }

  updateCanvas() {
    this.clearCanvas(this.canvas);
    this.updateFaceBoundingBoxes(this.canvas, this.facePredictions, "Human");
    this.updateFaceBoundingBoxes(this.canvas, this.catPredictions, "Cat!😸🐱");
    window.requestAnimationFrame(this.updateCanvas.bind(this));
  }

  clearCanvas(canvas) {
    // Store the current transformation matrix
    canvas.save();

    // Use the identity matrix while clearing the canvas
    canvas.setTransform(1, 0, 0, 1, 0, 0);
    canvas.clearRect(0, 0, 1280, 720);

    // Restore the transform
    canvas.restore();
  }

  updateFaceBoundingBoxes(canvas, data, labelText) {
    if (!data || data.length === 0) return;
    for (const face of data) {

      const scale = 2;
      const x1 = face.x1 * scale;
      const y1 = face.y1 * scale;
      const x2 = face.x2 * scale;
      const y2 = face.y2 * scale;

      this.drawBox(canvas, x1, y1, x2, y2, 3, "#004868");
      this.drawLabel(canvas, x1, y1, ((x2 - x1) < 100) ? (x2 - x1) : 100, -20, labelText, "#ffffff", "#004868");
      if (face.eyes.length > 0) {
        for (const eye of face.eyes) {
          const eyeX1 = x1 + (eye.x1 * scale);
          const eyeY1 = y1 + (eye.y1 * scale);
          const eyeX2 = eyeX1 + (eye.width * scale);
          const eyeY2 = eyeY1 + (eye.height * scale);
          this.drawBox(canvas, eyeX1, eyeY1, eyeX2, eyeY2, 3, "#00ff00");
          this.drawLabel(canvas, eyeX1, eyeY1, ((eyeX2 - eyeX1) < 100) ? (eyeX2 - eyeX1) : 100, -20, "Eye", "#000000", "#00FF00");
        }
      }
    }
  }

  drawLabel(canvas, x1, y1, x2, y2, labelText, color = "#ffffff", bgColor = "#000000") {
    canvas.fillStyle = bgColor;
    canvas.fillRect(x1, y1, x2, y2);

    canvas.fillStyle = color;
    canvas.font = "10px Orbitron";
    canvas.fillText(labelText, x1 + 3, y1 - 7);

  }

  drawBox(canvas, x1, y1, x2, y2, size = 1, color = "#ffffff") {
    canvas.strokeStyle = color;
    canvas.lineWidth = size;
    canvas.beginPath();
    canvas.moveTo(x1, y1);
    canvas.lineTo(x1, y2);
    canvas.lineTo(x2, y2);
    canvas.lineTo(x2, y1);
    canvas.lineTo(x1, y1);
    canvas.stroke();
  }

  drawLine(canvas, x1, y1, x2, y2, size = 1, color = "#ffffff") {
    canvas.strokeStyle = color;
    canvas.lineWidth = size;
    canvas.beginPath();
    canvas.moveTo(x1, y1);
    canvas.lineTo(x2, y2);
    canvas.stroke();
  }

  toggleMenu() {
    if(this.camMenuElement.className === "closed") {
      this.camMenuElement.className = "open";
    } else {
      this.camMenuElement.className = "closed";
    }

  }

  setLedState() {
    const selectElem = document.getElementById('ledStateSelect');
    const newState = selectElem.options[selectElem.selectedIndex].value;
    swim.command(this.swimUrl, '/robotState', `setLedMode`,  newState);
  }

  setMood() {
    const selectElem = document.getElementById('moodSelect');
    const newState = selectElem.options[selectElem.selectedIndex].value;
    swim.command(this.swimUrl, '/robotState', `setMood`,  newState);
  }

  onMoodChange(newMood) {
    if(newMood !== this.currentMood) {
      // console.info('new mood', newMood);
      this.currentMood = newMood.value
      document.getElementById('moodSelect').value = this.currentMood;
      let newColor = "#004868";
      switch(this.currentMood) {
        case "happy":
          newColor = "#76c51f";
          break;
        case "neutral":
          newColor = "#0076A9";
          break;
        case "angry":
          newColor = "#aa0000";
          break;
      }
      for(let key in this.gauges) {

        this.gauges[key].setMainColor(newColor)
      }
      // console.info('new mood', newMood);
    }
  }

}