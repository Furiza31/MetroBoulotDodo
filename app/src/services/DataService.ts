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
  public searchStation(search: string, isFirst: boolean): Node[] {
    if (this.datas.nodes.length === 0) {
      return [];
    }
    if (search === "") {
      return [];
    }

    let nodes = this.datas.nodes.filter((node) =>
      node.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!isFirst) return nodes;

    const processedStations = new Set<string>();
    const nodesWithFictiveStations: Node[] = [];

    nodes.forEach((node) => {
      const stationKey = `${node.x}-${node.y}`;

      if (!processedStations.has(stationKey)) {
        const sameNodeWithDifferentLine = this.datas.nodes.filter(
          (otherNode) =>
            otherNode.name === node.name &&
            otherNode.x === node.x &&
            otherNode.y === node.y &&
            otherNode.line !== node.line
        );

        if (sameNodeWithDifferentLine.length > 0) {
          const fictiveNode: Node = this.getNodeAtLineTimeZero(node);
          nodesWithFictiveStations.push(fictiveNode);

          processedStations.add(stationKey);
        }
      }
    });

    nodes = [...nodes, ...nodesWithFictiveStations];
    return nodes;
  }

  /**
   * Get shortest path between two stations using Dijkstra algorithm
   * @param start The id of the start station
   * @param end The id of the end station
   * @returns {PathType} The path between the two stations
   */
  public findPath(start: number, end: number, nodes: Node[]): PathType {
    const djik = this.dijkstra(this.getAdjacentMatrix(nodes), start);
    const path = this.getPath(djik[1], start, end);
    return this.getPathData(path, nodes);
  }

  /*
   * Function that returns the minimum spanning tree of the metro network
   * @param start The id of the start station
   * @returns {PathType} The minimum spanning tree of the metro network
   */
  public getMinimumSpanningTree(): PathType {
    let tree = this.display_tree(this.kruskal(this.datas.nodes));
    return tree;
  }

  public display_tree(tree: PathType): PathType {
    const graph = new Map<string, Set<string>>();
    const processedPairs = new Set<string>();

    tree.nodes.forEach((node) => {
      const nodeKey = `${node.x},${node.y}`;
      graph.set(nodeKey, new Set());
    });

    const getLineTime = (line: LineType): number => {
      const startNode = tree.nodes.find(
        (node) =>
          node.x === line.coords.start.x && node.y === line.coords.start.y
      );
      const endNode = tree.nodes.find(
        (node) => node.x === line.coords.end.x && node.y === line.coords.end.y
      );

      if (!startNode || !endNode) return Infinity;

      const edge = startNode.edges.find((e) => {
        const targetNode = tree.nodes.find((n) => n.id === e.to);
        return (
          targetNode && targetNode.x === endNode.x && targetNode.y === endNode.y
        );
      });

      return edge?.time ?? Infinity;
    };

    const sortedLines = [...tree.lines].sort((a, b) => {
      const timeA = getLineTime(a);
      const timeB = getLineTime(b);
      return timeA - timeB;
    });

    const wouldCreateCycle = (start: string, end: string): boolean => {
      const visited = new Set<string>();
      const queue = [start];

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === end) return true;

        visited.add(current);
        for (const neighbor of graph.get(current) || []) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
      return false;
    };

    const filteredLines = sortedLines.filter((line) => {
      const startKey = `${line.coords.start.x},${line.coords.start.y}`;
      const endKey = `${line.coords.end.x},${line.coords.end.y}`;
      const pairKey = [startKey, endKey].sort().join("_");

      if (processedPairs.has(pairKey)) {
        return false;
      }

      if (wouldCreateCycle(startKey, endKey)) {
        return false;
      }

      graph.get(startKey)?.add(endKey);
      graph.get(endKey)?.add(startKey);
      processedPairs.add(pairKey);
      return true;
    });

    return {
      nodes: tree.nodes,
      lines: filteredLines,
      time: tree.time,
    };
  }
  /**
   * Get adjacent matrix of node data
   * @returns {number[][]} adjacent matrix
   */
  public getAdjacentMatrix(nodes: Node[]): number[][] {
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
    const distances = Array(numNodes).fill(Infinity);
    const visited = Array(numNodes).fill(false);
    const previous = Array(numNodes).fill(null);
    distances[startNode] = 0;

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
  public getPathData(
    path: number[],
    nodesWithnodeAtLineTimeZero: Node[]
  ): PathType {
    const nodes = path.map((nodeId) => {
      const node = nodesWithnodeAtLineTimeZero.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error(`Node with ID ${nodeId} not found in metro data`);
      }
      return node;
    });

    const lines: LineType[] = [];
    let totalTime = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const startNode = nodes[i];
      const endNode = nodes[i + 1];

      const edge = startNode.edges.find((e) => e.to === endNode.id);
      if (!edge) {
        throw new Error(
          `No edge found between ${startNode.id} and ${endNode.id}`
        );
      }

      lines.push(this.getLine(startNode, endNode));

      totalTime += edge.time;
    }

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

  /* KRUSKAL function that   returns PathType that takes a  adjacentMatrix and a starting node to get a pathtype to passe by  all the nodes  */
  /**
   * Kruskal's algorithm to find Minimum Spanning Tree (MST)
   * @param Node[] The nodes of the metro network
   * @returns {PathType} Minimum Spanning Tree path
   */
  private kruskal(nodes: Node[]): PathType {
    const edges: { from: number; to: number; time: number }[] = [];

    nodes.forEach((node) => {
      node.edges.forEach((edge) => {
        edges.push({
          from: node.id,
          to: edge.to,
          time: edge.time,
        });
      });
    });

    edges.sort((a, b) => a.time - b.time);

    const parent: Record<number, number> = {};
    const rank: Record<number, number> = {};

    const find = (x: number): number => {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]);
      }
      return parent[x];
    };

    const union = (x: number, y: number): boolean => {
      const rootX = find(x);
      const rootY = find(y);

      if (rootX === rootY) return false;

      // Union by rank
      if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
      } else if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
      } else {
        parent[rootY] = rootX;
        rank[rootX]++;
      }

      return true;
    };

    // Initialize Union-Find
    nodes.forEach((node) => {
      parent[node.id] = node.id;
      rank[node.id] = 0;
    });

    // Kruskal's algorithm
    const mstNodes = new Set<Node>();
    const mstLines: LineType[] = [];
    let totalTime = 0;

    edges.forEach((edge) => {
      if (union(edge.from, edge.to)) {
        const fromNode = nodes.find((node) => node.id === edge.from);
        const toNode = nodes.find((node) => node.id === edge.to);

        if (fromNode && toNode) {
          mstNodes.add(fromNode);
          mstNodes.add(toNode);

          mstLines.push({
            id: `${edge.from}-${edge.to}`,
            coords: {
              start: { x: fromNode.x, y: fromNode.y },
              end: { x: toNode.x, y: toNode.y },
            },
            color: fromNode.color,
          });

          totalTime += edge.time;
        }
      }
    });

    return {
      nodes: Array.from(mstNodes),
      lines: mstLines,
      time: totalTime,
    };
  }

  public getNodeAtLineTimeZero(firstNode: Node) {
    const sameNodeWithDifferentLine = this.datas.nodes.filter(
      (node) =>
        node.name === firstNode.name &&
        node.x === firstNode.x &&
        node.y === firstNode.y
    );

    const newEdges = sameNodeWithDifferentLine.map((node) => {
      return {
        to: node.id,
        time: 0,
      };
    });

    const newNode: Node = {
      id: this.datas.nodes.length,
      line: firstNode.line,
      name: firstNode.name,
      x: firstNode.x,
      y: firstNode.y,
      color: firstNode.color,
      edges: newEdges,
      connection: firstNode.connection,
      isTerminus: firstNode.isTerminus,
      isFictive: true,
    };

    return newNode;
  }
}
export const dataService = DataService.getInstance();
