import {
  LineType,
  MetroDataType,
  Node,
  PathType,
} from "src/types/MetroDataType";

class DataService {
  private static instance: DataService;
  private datas: MetroDataType;
  private lines: LineType[];

  /**
   * Singleton class
   * @private
   * @constructor
   */
  private constructor() {
    this.datas = { nodes: [] };
    this.lines = [];
  }

  /**
   * Get the instance of the DataService
   * @returns {DataService} The instance of the DataService
   */
  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Get the subway data
   * @returns {Promise<MetroDataType>} The subway data
   */
  public async getSubwayData(): Promise<MetroDataType> {
    if (this.datas.nodes.length > 0) {
      return this.datas;
    }
    const response = await fetch("/metro.json");
    this.datas = await response.json();
    return this.datas;
  }

  /**
   * Get the subway lines
   * @returns {Promise<LineType[]>} The subway lines
   */
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

  /**
   * Get the coordinates of a node
   * @param id The id of the node
   * @returns {number[] | null} The coordinates of the node
   */
  private getNodeCoords(id: number) {
    const node = this.datas.nodes.find((n) => n.id === id);
    if (node) {
      return [node.x, node.y];
    }
    return null;
  }

  /**
   * Search for a station
   * @param search The search string
   * @returns {Node[]} The stations found
   */
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
    return nodes;
  }

  /**
   * Get shortest path between two stations using Dijkstra algorithm
   * @param start The id of the start station
   * @param end The id of the end station
   * @returns {PathType} The path between the two stations
   */
  public findPath(start: number, end: number): PathType {
    const djik = this.dijkstra(this.getAdjacentMatrix(), start);
    const path = this.getPath(djik[1], start, end);
    return this.getPathData(path);
    // exmple complexe de la destination entre Europe et Monceau avec un changement à Villiers
    //   return {
    //     lines: [
    //       {
    //         id: `${103}_${366}`,
    //         coords: {
    //           start: {
    //             x: 353,
    //             y: 367,
    //           },
    //           end: {
    //             x: 328,
    //             y: 342,
    //           },
    //         },
    //         color: "#66CC66",
    //       },
    //       {
    //         id: `${366}_${204}`,
    //         coords: {
    //           start: {
    //             x: 328,
    //             y: 342,
    //           },
    //           end: {
    //             x: 304,
    //             y: 364,
    //           },
    //         },
    //         color: "#0055FF",
    //       },
    //     ],
    //     nodes: [
    //       {
    //         id: 103,
    //         name: "Europe",
    //         line: "3",
    //         isTerminus: false,
    //         connection: 0,
    //         color: "#66CC66",
    //         x: 353,
    //         y: 367,
    //         edges: [
    //           {
    //             to: 327,
    //             time: 44,
    //           },
    //           {
    //             to: 367,
    //             time: 30,
    //           },
    //         ],
    //       },
    //       {
    //         id: 366,
    //         name: "Villiers",
    //         line: "2",
    //         isTerminus: false,
    //         connection: 0,
    //         color: "#0055FF",
    //         x: 328,
    //         y: 342,
    //         edges: [
    //           {
    //             to: 204,
    //             time: 51,
    //           },
    //           {
    //             to: 302,
    //             time: 53,
    //           },
    //           {
    //             to: 367,
    //             time: 180,
    //           },
    //         ],
    //       },
    //       {
    //         id: 204,
    //         name: "Monceau",
    //         line: "2",
    //         isTerminus: false,
    //         connection: 0,
    //         color: "#0055FF",
    //         x: 304,
    //         y: 364,
    //         edges: [
    //           {
    //             to: 85,
    //             time: 47,
    //           },
    //           {
    //             to: 366,
    //             time: 51,
    //           },
    //         ],
    //       },
    //     ],
    //     time: 30 + 51,
    //   };
  }

  /**
   * Get adjacent matrix of node data
   * @returns {number[][]} adjacent matrix
   */
  public getAdjacentMatrix(): number[][] {
    const nodes = this.datas.nodes;
    const matrix = Array.from({ length: nodes.length }, () =>
      Array.from({ length: nodes.length }, () => Infinity)
    );

    nodes.forEach((node) => {
      node.edges.forEach((edge) => {
        matrix[node.id][edge.to] = edge.time;
      });
    });
    return matrix;
  }

  /**
   * Dijkstra algorithm
   * @param adjacentMatrix adjacent matrix
   * @param startNode start node
   * @returns {(number[], number[])} distance and previous arrays
   */
  public dijkstra(
    adjacentMatrix: number[][],
    startNode: number
  ): [number[], number[]] {
    const numNodes = adjacentMatrix.length;
    const distances = Array(numNodes).fill(Infinity); // Initialiser les distances
    const visited = Array(numNodes).fill(false);
    const previous = Array(numNodes).fill(null);
    distances[startNode] = 0; // Distance au point de départ 0

    for (let i = 0; i < numNodes - 1; i++) {
      const current = this.minDistance(distances, visited);
      visited[current] = true;
      for (let next = 0; next < numNodes; next++) {
        const edge = adjacentMatrix[current][next];
        const newDistance = distances[current] + edge;

        if (
          !visited[next] &&
          edge !== Infinity &&
          newDistance < distances[next]
        ) {
          distances[next] = newDistance;
          previous[next] = current;
        }
      }
    }

    return [distances, previous];
  }

  /**
   * Find the node with the minimum distance
   * @param distance distance array
   * @param visited visited array
   * @returns {number} the node with the minimum distance
   */
  private minDistance(distance: number[], visited: boolean[]): number {
    let min = Infinity;
    let minIndex = -1;

    distance.forEach((value, index) => {
      if (!visited[index] && value <= min) {
        min = value;
        minIndex = index;
      }
    });

    return minIndex;
  }

  /**
   * Get the path between two nodes
   * @param previous previous array
   * @param start start node
   * @param end end node
   * @returns {number[]} the path between two nodes
   */
  public getPath(previous: number[], start: number, end: number): number[] {
    const path = [];
    let current = end;
    while (current !== start) {
      path.unshift(current);
      current = previous[current];
    }
    path.unshift(start);

    return path;
  }
  /**
   * Get tab with name of the stations between two nodes
   * @param path path between two nodes
   * @returns {PathType} the path between two nodes
   */
  public getPathData(path: number[]): PathType {
    // Récupérer tous les nœuds du chemin
    const nodes = path.map((nodeId) => {
      const node = this.datas.nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error(`Node with ID ${nodeId} not found in metro data`);
      }
      return node;
    });

    // Construire les lignes en utilisant les coordonnées des nœuds
    const lines: LineType[] = [];
    let totalTime = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const startNode = nodes[i];
      const endNode = nodes[i + 1];

      // Trouver l'arête reliant les deux nœuds
      const edge = startNode.edges.find((e) => e.to === endNode.id);
      if (!edge) {
        throw new Error(
          `No edge found between ${startNode.id} and ${endNode.id}`
        );
      }

      // Ajouter la ligne correspondante
      lines.push(this.getLine(startNode, endNode));

      // Ajouter le temps de l'arête au temps total
      totalTime += edge.time;
    }

    // Construire le PathType final
    return {
      nodes,
      lines,
      time: totalTime,
    };
  }

  private getLine(start: Node, end: Node): LineType {
    return {
      id: `${start.id}_${end.id}`,
      coords: {
        start: {
          x: start.x,
          y: start.y,
        },
        end: {
          x: end.x,
          y: end.y,
        },
      },
      color: start.color,
    };
  }
}
export const dataService = DataService.getInstance();
