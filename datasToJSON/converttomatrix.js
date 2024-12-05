/**
 * Convert a graph object to an adjacency matrix
 * @param {*} graph - The graph object to convert
 * @returns {Array<Array<number>>} - The adjacency matrix
 */
export const converttomatrix = (graph) => {
  if (!graph || typeof graph !== "object") {
    console.error("Invalid input: graph must be an object. Received:", graph);
    throw new TypeError(
      "Invalid input: graph must be an object with a nodes array"
    );
  }

  const nodes = Array.isArray(graph) ? graph : graph.nodes;

  if (!Array.isArray(nodes)) {
    console.error("Invalid input: nodes must be an array. Received:", nodes);
    throw new TypeError("Invalid input: nodes must be an array");
  }

  if (nodes.length === 0) {
    console.error("Invalid input: nodes array is empty.");
    throw new TypeError("Invalid input: graph must have at least one node");
  }

  const maxNodeId = Math.max(...nodes.map((node) => node.id));
  const matrixSize = maxNodeId + 1;

  const matrix = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill(-1)
  );

  nodes.forEach((node) => {
    if (!node || typeof node !== "object") {
      console.error("Invalid node in graph:", node);
      throw new TypeError("Invalid node in graph");
    }

    const edges = node.edges || [];
    if (!Array.isArray(edges)) {
      console.error("Invalid edges for node:", node);
      throw new TypeError("Node edges must be an array");
    }

    edges.forEach((edge) => {
      if (!edge || typeof edge !== "object") {
        console.error("Invalid edge:", edge);
        throw new TypeError("Invalid edge object");
      }

      matrix[node.id][edge.to] = edge.time;
      matrix[edge.to][node.id] = edge.time;
    });
  });

  return matrix;
};
