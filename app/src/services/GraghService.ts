import * as d3 from "d3";
import { LineType, MetroDataType, Node } from "src/types/MetroDataType";

export class GraphService {
  private window: Window;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private radius = 5;
  private strokeWidth = 3;
  private scaleFactor = 2;
  private zoomBehavior: d3.ZoomBehavior<Element, unknown>;
  private firstStation: Node | null = null;
  private secondStation: Node | null = null;
  private sidePanelSize = 350;

  constructor(
    graphContainer: HTMLElement,
    window: Window,
    subway: MetroDataType,
    subwayLines: LineType[]
  ) {
    this.window = window;
    this.svg = d3.select(graphContainer).append("svg");
    this.g = this.svg.append("g");
    this.zoomBehavior = d3.zoom();
    this.init();
    this.draw(subway, subwayLines);
  }

  private init() {
    this.svg
      .attr("width", this.window.innerWidth - this.sidePanelSize)
      .attr("height", this.window.innerHeight)
      .attr(
        "viewBox",
        `0 0 ${this.window.innerWidth - this.sidePanelSize} ${
          this.window.innerHeight
        }`
      )
      .style("cursor", "move");

    this.zoomBehavior
      .extent([
        [0, 0],
        [this.window.innerWidth, this.window.innerHeight],
      ])
      .scaleExtent([1, 8])
      .on("zoom", this.zoomed.bind(this));

    // @ts-ignore
    this.svg.call(this.zoomBehavior);
  }

  private draw(subway: MetroDataType, subwayLines: LineType[]) {
    this.drawLines(subwayLines);
    this.drawStations(subway.nodes);
  }

  private drawStationNames(subway: MetroDataType["nodes"]) {
    this.g
      .selectAll("text")
      .data(subway)
      .enter()
      .append("text")
      .attr("x", (station) => station.x * this.scaleFactor)
      .attr("y", (station) => (station.y + this.radius * 1) * this.scaleFactor)
      .text((station) => station.name)
      .attr("font-size", "7px")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle");
  }

  private drawLines(subwayLines: LineType[]) {
    this.g
      .selectAll("line")
      .data(subwayLines)
      .enter()
      .append("line")
      .attr("x1", (line) => line.coords.start.x * this.scaleFactor)
      .attr("y1", (line) => line.coords.start.y * this.scaleFactor)
      .attr("x2", (line) => line.coords.end.x * this.scaleFactor)
      .attr("y2", (line) => line.coords.end.y * this.scaleFactor)
      .attr("stroke", (line) => line.color)
      .attr("stroke-width", this.strokeWidth);
  }

  private drawStations(stationsData: MetroDataType["nodes"]) {
    const stations = this.g
      .selectAll("circle")
      .data(stationsData)
      .enter()
      .append("circle")
      .attr("cx", (station) => station.x * this.scaleFactor)
      .attr("cy", (station) => station.y * this.scaleFactor)
      .attr("r", this.radius)
      .attr("fill", (station) => station.color)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("cursor", "pointer");

    this.drawStationNames(stationsData);

    // @ts-ignore
    this.addHoverEffects(stations);
  }

  private addHoverEffects(
    stations: d3.Selection<SVGCircleElement, Node, SVGGElement, unknown>
  ) {
    stations
      .on("mouseover", (event) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", this.radius * 2);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", this.radius);
      });
  }

  private zoomed({ transform }: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    this.g.attr("transform", transform.toString());
  }

  public setFirstStation(stationIndex: number) {
    const station = this.g.selectAll<SVGCircleElement, Node>("circle").data()[
      stationIndex
    ];
    if (!station) {
      console.error("Station not found");
      return;
    }

    this.firstStation = station;

    const zoomScale = 3;

    const translateX =
      this.window.innerWidth / 2 -
      station.x * this.scaleFactor * zoomScale -
      this.sidePanelSize / 2;
    const translateY =
      this.window.innerHeight / 2 - station.y * this.scaleFactor * zoomScale;

    const transform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(zoomScale);

    this.svg.transition().duration(750).call(
      // @ts-ignore
      this.zoomBehavior.transform,
      transform
    );

    this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .transition()
      .duration(500)
      .attr("r", (_, i) => (i === stationIndex ? this.radius * 2 : this.radius))
      .attr("fill", (d, i) => (i === stationIndex ? "red" : d.color));
  }

  public setSecondStation(stationIndex: number) {
    const secondStation = this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .data()[stationIndex];
    if (!secondStation) {
      console.error("Second station not found");
      return;
    }

    if (!this.firstStation) {
      console.error("First station must be set before second station");
      return;
    }

    this.secondStation = secondStation;

    const centerX = (this.firstStation.x + secondStation.x) / 2;
    const centerY = (this.firstStation.y + secondStation.y) / 2;

    const distance = Math.sqrt(
      Math.pow(secondStation.x - this.firstStation.x, 2) +
        Math.pow(secondStation.y - this.firstStation.y, 2)
    );

    const zoomFactor = Math.min(
      this.window.innerWidth / (distance * this.scaleFactor),
      this.window.innerHeight / (distance * this.scaleFactor)
    );

    const zoomScale = Math.max(1, zoomFactor);

    const translateX =
      this.window.innerWidth / 2 -
      centerX * this.scaleFactor * zoomScale -
      this.sidePanelSize / 2;
    const translateY =
      this.window.innerHeight / 2 - centerY * this.scaleFactor * zoomScale;

    const transform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(zoomScale);

    this.svg.transition().duration(750).call(
      // @ts-ignore
      this.zoomBehavior.transform,
      transform
    );

    this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .transition()
      .duration(500)
      .attr("r", (_, i) =>
        i === this.firstStation?.id || i === stationIndex
          ? this.radius * 2
          : this.radius
      )
      .attr("fill", (d, i) =>
        i === this.firstStation?.id || i === stationIndex ? "red" : d.color
      );
  }
}
