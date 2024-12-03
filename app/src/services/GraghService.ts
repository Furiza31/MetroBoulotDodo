import * as d3 from "d3";
import {
  LineType,
  MetroDataType,
  Node,
  PathType,
} from "src/types/MetroDataType";

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
    const drawnLines = new Set<string>();

    this.g
      .selectAll("line")
      .data(
        subwayLines.filter((line) => {
          const lineKey = `${line.coords.start.x},${line.coords.start.y}-${line.coords.end.x},${line.coords.end.y}`;
          const reverseKey = `${line.coords.end.x},${line.coords.end.y}-${line.coords.start.x},${line.coords.start.y}`;

          if (drawnLines.has(lineKey) || drawnLines.has(reverseKey)) {
            return false;
          }

          drawnLines.add(lineKey);
          return true;
        })
      )
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
    const drawnCoordinates = new Set<string>();

    this.g
      .selectAll("circle")
      .data(
        stationsData.filter((station) => {
          const coordKey = `${station.x},${station.y}`;
          if (drawnCoordinates.has(coordKey)) {
            return false;
          }
          drawnCoordinates.add(coordKey);
          return true;
        })
      )
      .enter()
      .append("circle")
      .attr("cx", (station) => station.x * this.scaleFactor)
      .attr("cy", (station) => station.y * this.scaleFactor)
      .attr("r", this.radius)
      .attr("fill", (station) => station.color)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("data-id", (station) => station.id);

    this.drawStationNames(stationsData);
  }

  private zoomed({ transform }: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    this.g.attr("transform", transform.toString());
  }

  public setStartStation(stationId: number) {
    const station = this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .data()
      .find((d) => d.id === stationId);

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
      .attr("fill", (d) =>
        d.id === this.end?.id || d.id === stationId ? "red" : d.color
      );
  }

  public setEndStation(stationId: number) {
    const endStation = this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .data()
      .find((d) => d.id === stationId);

    if (!endStation) {
      console.error("Station not found");
      return;
    }

    this.end = endStation;

    this.center();

    this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .transition()
      .duration(500)
      .attr("fill", (d) =>
        d.id === this.start?.id || d.id === stationId ? "red" : d.color
      );
  }

  private centerBetweenStations(start: Node, end: Node) {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    const zoomFactor =
      Math.min(
        this.window.innerWidth / (distance * this.scaleFactor),
        this.window.innerHeight / (distance * this.scaleFactor)
      ) - 7;

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
    const zoomScale = 2;

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

  public highlightPath(path: PathType) {
    this.g
      .selectAll<SVGCircleElement, Node>("circle")
      .transition()
      .duration(500)
      .attr("fill", (d) =>
        path.nodes.some((node) => node.id === d.id) ? "red" : d.color
      );

    this.g
      .selectAll<SVGLineElement, LineType>("line")
      .transition()
      .duration(500)
      .attr("stroke", (line) =>
        path.lines.some((pathLine) => this.isSameLine(pathLine, line))
          ? "red"
          : line.color
      );
  }

  private isSameLine(line1: LineType, line2: LineType): boolean {
    const isDirectMatch =
      line1.coords.start.x === line2.coords.start.x &&
      line1.coords.start.y === line2.coords.start.y &&
      line1.coords.end.x === line2.coords.end.x &&
      line1.coords.end.y === line2.coords.end.y;

    const isReverseMatch =
      line1.coords.start.x === line2.coords.end.x &&
      line1.coords.start.y === line2.coords.end.y &&
      line1.coords.end.x === line2.coords.start.x &&
      line1.coords.end.y === line2.coords.start.y;

    return isDirectMatch || isReverseMatch;
  }
}
