import { MetroDataType } from "src/types/DataType";
import { LineType } from "src/types/LineType";

export class DataService {
  private datas: MetroDataType;
  private lines: LineType[];

  constructor() {
    this.datas = { nodes: [] };
    this.lines = [];
  }

  public async getMetroData(): Promise<MetroDataType> {
    if (this.datas.nodes.length > 0) {
      return this.datas;
    }
    const response = await fetch("/metro.json");
    this.datas = await response.json();
    return this.datas;
  }

  public async getMetroLines(): Promise<LineType[]> {
    if (this.lines.length > 0) {
      return this.lines;
    }
    if (this.datas.nodes.length === 0) {
      await this.getMetroData();
    }
    this.datas.nodes.forEach((node) => {
      if (node.edges) {
        node.edges.forEach((edge) => {
          const start = this.getNodeCoords(node.id);
          const end = this.getNodeCoords(edge.to);
          if (start && end) {
            this.lines.push({
              latLngs: [start, end],
              color: node.color,
            });
          }
        });
      }
    });
    return this.lines;
  }

  private getNodeCoords(id: number) {
    const node = this.datas.nodes.find((n) => n.id === id);
    if (node) {
      return [node.latitude, node.longitude];
    }
    return null;
  }
}
