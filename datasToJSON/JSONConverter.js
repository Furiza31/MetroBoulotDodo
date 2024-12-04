import fs from "fs";
const metroLineColors = {
  1: "#FFD700",
  2: "#0055FF",
  3: "#66CC66",
  "3bis": "#99FF99",
  4: "#BB33CC",
  5: "#FF9933",
  6: "#339966",
  7: "#FF99CC",
  "7bis": "#FFCCDD",
  8: "#CCCCCC",
  9: "#99CC33",
  10: "#FFCC00",
  11: "#CC9966",
  12: "#99FF33",
  13: "#0033CC",
  14: "#660099",
};

/**
 * Convert a metro file and a positions file to a JSON file
 * @param {*} metro the metro file path
 * @param {*} positions the positions file path
 * @param {*} outputFilePath the output file path
 */
export const convertMetroToJSON = (metro, positions, outputFilePath) => {
  // Read the metro and positions files
  const metroData = fs.readFileSync(metro, "utf-8");
  const positionsData = fs.readFileSync(positions, "utf-8").replace(/@/g, " ");

  // Split the metro and positions data by line
  const lines = metroData.split("\n");
  const linesPosition = positionsData.split("\n");

  const graph = {
    nodes: [],
  };

  const nodeMap = new Map(); // To track nodes by their ID for deduplication

  lines.forEach((line) => {
    if (line.trim() === "") return;

    // if it's a line
    if (line.startsWith("V")) {
      const [, summitNumber, name, lineNumber, isTerminus, connection] =
        line.match(/V (\d+)\s+(.+?)\s+;([\d\w]+)\s+;(True|False)\s+(\d+)/);

      const nodeId = parseInt(summitNumber);

      if (!nodeMap.has(nodeId)) {
        // Find the position for this node
        let x = null;
        let y = null;

        linesPosition.forEach((position) => {
          if (position.trim() === "") return;

          const [px, py, lineName] = position.split(";");

          if (lineName.trim() === name.trim()) {
            x = parseInt(px);
            y = parseInt(py);
          }
        });

        // Create the node
        const node = {
          id: nodeId,
          name: name.trim(),
          line: lineNumber.trim(),
          isTerminus: isTerminus === "True",
          connection: parseInt(connection),
          color: metroLineColors[lineNumber.trim()],
        };

        if (x !== null && y !== null) {
          node.x = x;
          node.y = y;
        }

        // Add the node to graph and nodeMap
        graph.nodes.push(node);
        nodeMap.set(nodeId, node);
      }
    }

    // if it's an edge
    if (line.startsWith("E")) {
      const [, summitNumber1, summitNumber2, time] =
        line.match(/E (\d+) (\d+) (\d+)/);

      const node1 = nodeMap.get(parseInt(summitNumber1));
      const node2 = nodeMap.get(parseInt(summitNumber2));

      if (
        (node1.name === node2.name ||
          (node1.x === node2.x && node1.y === node2.y)) &&
        node1.line !== node2.line
      ) {
        node1.edges.push({
          to: node2.id,
          time: 0,
        });

        node2.edges.push({
          to: node1.id,
          time: 0,
        });
      } else {
        node1.edges = node1.edges || [];
        node1.edges.push({
          to: parseInt(summitNumber2),
          time: parseInt(time),
        });
        node2.edges = node2.edges || [];
        node2.edges.push({
          to: parseInt(summitNumber1),
          time: parseInt(time),
        });
      }
    }
  });

  // Write the graph (formatted JSON file) to the output file
  fs.writeFileSync(outputFilePath, JSON.stringify(graph, null, 2), "utf-8");

  return graph;
};
