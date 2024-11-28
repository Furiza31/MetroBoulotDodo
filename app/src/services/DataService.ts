import { LineType, MetroDataType } from "src/types/MetroDataType";

class DataService {
  private datas: MetroDataType;
  private lines: LineType[];

  constructor() {
    this.datas = { nodes: [] };
    this.lines = [];
  }

  public async getSubwayData(): Promise<MetroDataType> {
    if (this.datas.nodes.length > 0) {
      return this.datas;
    }
    const response = await fetch("/metro.json");
    this.datas = await response.json();
    return this.datas;
  }

  public async getSubwayLines(): Promise<LineType[]> {
    if (this.lines.length > 0) {
      return this.lines;
    }
    if (this.datas.nodes.length === 0) {
      await this.getSubwayData();
    }
    this.datas.nodes.forEach((node) => {
      if (node.edges) {
        node.edges.forEach((edge) => {
          const start = this.getNodeCoords(node.id);
          const end = this.getNodeCoords(edge.to);
          if (start && end) {
            this.lines.push({
              id: node.id + edge.to,
              coords: {
                start: {
                  x: start[0],
                  y: start[1],
                },
                end: {
                  x: end[0],
                  y: end[1],
                },
              },
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
      return [node.x, node.y];
    }
    return null;
  }
}

export const dataService = new DataService();
