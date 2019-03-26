class PerfGauge {

    constructor(parentElementId, titleText, swimUrl, nodeUri, statLaneUri, historyLaneUri, bgColor = "#FF0000", fontColor) {
        this.parentElementId = parentElementId;
        this.titleText = titleText;
        this.swimUrl = swimUrl
        this.app = null;
        this.nodeUri = nodeUri;
        this.statLaneUri = statLaneUri;
        this.historyLaneUri = historyLaneUri;
        this.links = [];
        this.bgColor = bgColor;
        this.fontColor = fontColor;

        this.chart = null;
        this.plot = null;
        this.title = null;
        this.parentElement = null;
        this.mainElement = null;
        this.chartElement = null;
        this.chartCanvas = null;
        this.statsElement = null;
        this.titleElement = null;


        this.initialize();
    }

    initialize() {
        this.parentElement = document.getElementById(this.parentElementId);
        this.mainElement = document.createElement('div');
        this.mainElement.className = "chartBox";

        this.chartElement = document.createElement('div');
        this.chartElement.className = "chart";
        this.app = new swim.HtmlAppView(this.chartElement);

        this.statsElement = document.createElement('div');
        this.statsElement.className = "stat";
        if (this.bgColor) {
            this.statsElement.style.color = this.bgColor;
        }

        this.titleElement = document.createElement('h3');
        this.titleElement.innerHTML = this.titleText;
        if (this.bgColor) {
            this.titleElement.style.backgroundColor = this.bgColor;
        }
        if (this.fontColor) {
            this.titleElement.style.color = this.fontColor;
        }

        this.mainElement.appendChild(this.titleElement);
        this.mainElement.appendChild(this.chartElement);
        this.mainElement.appendChild(this.statsElement);

    }

    start() {

        this.parentElement.appendChild(this.mainElement);
        this.chartElement = this.app.append("div");
        this.chartCanvas = this.chartElement.append("canvas");

        this.chart = new swim.ChartView()
            .bottomAxis("time")
            .leftAxis("linear")
            .topGutter(0)
            .rightGutter(0)
            .bottomGutter(0)
            .leftGutter(0);
        this.chartCanvas.append(this.chart);

        this.chart.leftAxis().insertTick({
            value: 0.5,
            tickLabel: "0.5",
            gridLineColor: '#989898',
            gridLineWidth: 1,
        });

        this.plot = new swim.LineGraphView()
            .stroke(this.bgColor)
            .strokeWidth(0);

        this.chart.addPlot(this.plot);

        this.openLinks();
    }

    stop() {
        this.closeLinks()
        this.parentElement.removeChild(this.mainElement);
    }

    setMainColor(newColor) {
        // console.info('[perfGauge] new color', newColor)
        this.bgColor = newColor;
        this.statsElement.style.color = this.bgColor;
        this.titleElement.style.backgroundColor = this.bgColor;
        this.plot.stroke(this.bgColor);
    }

    openLinks() {
        this.links['historyLink'] = swim.downlinkMap()
            .hostUri(this.swimUrl)
            .nodeUri(this.nodeUri)
            .laneUri(this.historyLaneUri)
            .didUpdate((key, newValue) => {
                if (newValue) {
                    if (newValue && newValue.value) {
                        this.plot.insertDatum({
                            x: key.value,
                            y: newValue.value,
                            opacity: 1
                        });
                    }
                    if (newValue.get('rate').value) {
                        this.plot.insertDatum({
                            x: key.value,
                            y: newValue.get('rate').value,
                            opacity: 1
                        });

                    }

                }                
            })
            .didRemove((key) => {
                this.plot.removeDatum(key.value);
            })
            .open();

        this.links['statsLink'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(this.nodeUri)
            .laneUri(this.statLaneUri)
            .didSet((newValue) => {
                if (newValue) {
                    if (newValue && newValue.value) {
                        this.statsElement.innerText = newValue.value.toPrecision(2);
                    }
                    if (newValue.get('rate').value) {
                        this.statsElement.innerText = newValue.get('rate').value;
                    }

                }
            })
            .open();
    }

    closeLinks() {
        for (let key in this.links) {
            this.links[key].close();
        }
    }

}