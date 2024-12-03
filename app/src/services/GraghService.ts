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
  private start: Node | null = null;
  private end: Node | null = null;
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
    this.g
      .selectAll("circle")
      .data(stationsData)
      .enter()
      .append("circle")
      .attr("cx", (station) => station.x * this.scaleFactor)
      .attr("cy", (station) => station.y * this.scaleFactor)
      .attr("r", this.radius)
      .attr("fill", (station) => station.color)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    this.drawStationNames(stationsData);
  }

  private zoomed({ transform }: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    this.g.attr("transform", transform.toString());
  }

  public setStartStation(stationIndex: number) {
    const station = this.g.selectAll<SVGCircleElement, Node>("circle").data()[
      stationIndex
    ];
    if (!station) {
      console.error("Station not found");
      return;
    }

    this.start = station;

    this.center();

    this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .transition()
      .duration(500)
      .attr("r", (_, i) =>
        i === this.end?.id || i === stationIndex ? this.radius * 2 : this.radius
      )
      .attr("fill", (d, i) =>
        i === this.end?.id || i === stationIndex ? "red" : d.color
      );
  }

  public setEndStation(stationIndex: number) {
    const endStation = this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .data()[stationIndex];
    if (!endStation) {
      console.error("Second station not found");
      return;
    }

    this.end = endStation;

    this.center();

    this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .transition()
      .duration(500)
      .attr("r", (_, i) =>
        i === this.start?.id || i === stationIndex
          ? this.radius * 2
          : this.radius
      )
      .attr("fill", (d, i) =>
        i === this.start?.id || i === stationIndex ? "red" : d.color
      );
  }

  private centerBetweenStations(start: Node, end: Node) {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
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
  }

  private centerOnStation(station: Node) {
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
  }

  private center() {
    if (!this.start && this.end) {
      this.centerOnStation(this.end);
      return;
    }
    if (this.start && !this.end) {
      this.centerOnStation(this.start);
      return;
    }
    if (this.start && this.end && this.start === this.end) {
      this.centerOnStation(this.start);
      return;
    }
    if (this.start && this.end) {
      this.centerBetweenStations(this.start, this.end);
    }
  }
}
