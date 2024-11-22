/**
 * Check if the graph is connected
 * @param {*} graph - the graph to check
 * @returns {boolean} - true if the graph is connected, false otherwise
 */
export const checkConnexity = (graph) => {
  let n;
  n = graph.length;
  let visited;
  visited = Array(n).fill(false);

  /**
   * Inner function to perform a depth-first search
   * @param {*} node - the node to start the search from
   */
  function dfs(node) {
    visited[node] = true;
    for (let i = 0; i < n; i++) {
      if (graph[node][i] != -1 && !visited[i]) {
        dfs(i);
      }
    }
  }

  dfs(0);

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      return false;
    }
  }

  return true;
};
