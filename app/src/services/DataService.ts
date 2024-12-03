import { LineType, MetroDataType, Node } from "src/types/MetroDataType";

class DataService {
  private static instance: DataService; // Static instance of the class
  private datas: MetroDataType;
  private lines: LineType[];
  private maxSearchResults = 10;

  // Private constructor to prevent instantiation from outside
  private constructor() {
    this.datas = { nodes: [] };
    this.lines = [];
  }

  // Static method to get the singleton instance
  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
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
              id: `${node.id}_${edge.to}`,
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

  public searchStation(search: string): Node[] {
    if (this.datas.nodes.length === 0) {
      return [];
    }
    if (search === "") {
      return [];
    }
    const nodes = this.datas.nodes.filter((node) =>
      node.name.toLowerCase().includes(search.toLowerCase())
    );
    return nodes.slice(0, this.maxSearchResults);
  }

  public findPath(
    start: number,
    end: number
  ): {
    lines: LineType[];
    distance: number;
    nodes: Node[];
    time: number;
  } {
    return {
      lines: [],
      distance: 0,
      nodes: [],
      time: 0,
    };
  }
}

export const dataService = DataService.getInstance();
