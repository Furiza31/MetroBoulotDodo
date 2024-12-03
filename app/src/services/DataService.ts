import {
  LineType,
  MetroDataType,
  Node,
  PathType,
} from "src/types/MetroDataType";

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

  public findPath(start: number, end: number): PathType {
    // exmple complexe de la destination entre Europe et Monceau avec un changement à Villiers
    return {
      lines: [
        {
          id: `${103}_${366}`,
          coords: {
            start: {
              x: 353,
              y: 367,
            },
            end: {
              x: 328,
              y: 342,
            },
          },
          color: "#66CC66",
        },
        {
          id: `${366}_${204}`,
          coords: {
            start: {
              x: 328,
              y: 342,
            },
            end: {
              x: 304,
              y: 364,
            },
          },
          color: "#0055FF",
        },
      ],
      nodes: [
        {
          id: 103,
          name: "Europe",
          line: "3",
          isTerminus: false,
          connection: 0,
          color: "#66CC66",
          x: 353,
          y: 367,
          edges: [
            {
              to: 327,
              time: 44,
            },
            {
              to: 367,
              time: 30,
            },
          ],
        },
        {
          id: 366,
          name: "Villiers",
          line: "2",
          isTerminus: false,
          connection: 0,
          color: "#0055FF",
          x: 328,
          y: 342,
          edges: [
            {
              to: 204,
              time: 51,
            },
            {
              to: 302,
              time: 53,
            },
            {
              to: 367,
              time: 180,
            },
          ],
        },
        {
          id: 204,
          name: "Monceau",
          line: "2",
          isTerminus: false,
          connection: 0,
          color: "#0055FF",
          x: 304,
          y: 364,
          edges: [
            {
              to: 85,
              time: 47,
            },
            {
              to: 366,
              time: 51,
            },
          ],
        },
      ],
      time: 30 + 51,
    };
  }
}

export const dataService = DataService.getInstance();
