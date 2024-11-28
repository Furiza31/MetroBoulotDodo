import * as d3 from "d3";
import { LineType, MetroDataType } from "src/types/MetroDataType";

export class GraphService {
  private window: Window;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private radius = 5;
  private strokeWidth = 3;

  constructor(
    graphContainer: HTMLElement,
    window: Window,
    subway: MetroDataType,
    subwayLines: LineType[]
  ) {
    this.window = window;
    this.svg = d3.select(graphContainer).append("svg");
    this.g = this.svg.append("g");
    this.init();
    this.draw(subway, subwayLines);
  }

  private init() {
    this.svg
      .attr("width", this.window.innerWidth)
      .attr("height", this.window.innerHeight)
      .attr(
        "viewBox",
        `0 0 ${this.window.innerWidth} ${this.window.innerHeight}`
      )
      .style("cursor", "move");

    const zoom = d3
      .zoom()
      .extent([
        [0, 0],
        [this.window.innerWidth, this.window.innerHeight],
      ])
      .scaleExtent([1, 8])
      .on("zoom", this.zoomed.bind(this));

    // @ts-ignore
    this.svg.call(zoom);
  }

  private draw(subway: MetroDataType, subwayLines: LineType[]) {
    this.drawLines(subwayLines);
    this.drawStations(subway.nodes);
  }

  private drawLines(subwayLines: LineType[]) {
    this.g
      .selectAll("line")
      .data(subwayLines)
      .enter()
      .append("line")
      .attr("x1", (line) => line.coords.start.x)
      .attr("y1", (line) => line.coords.start.y)
      .attr("x2", (line) => line.coords.end.x)
      .attr("y2", (line) => line.coords.end.y)
      .attr("stroke", (line) => line.color)
      .attr("stroke-width", this.strokeWidth);
  }

  private drawStations(stationsData: MetroDataType["nodes"]) {
    const stations = this.g
      .selectAll("circle")
      .data(stationsData)
      .enter()
      .append("circle")
      .attr("cx", (station) => station.x)
      .attr("cy", (station) => station.y)
      .attr("r", this.radius)
      .attr("fill", (station) => station.color)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("cursor", "pointer");

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
}
