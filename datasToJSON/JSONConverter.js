import fs from "fs";
const metroLineColors = {
  1: "#eec044",
  2: "#3656c0",
  3: "#6d6e21",
  "3bis": "#9ac7e3",
  4: "#8c1e6b",
  5: "#e2652c",
  6: "#9dd980",
  7: "#e789b2",
  "7bis": "#9dd980",
  8: "#c286bb",
  9: "#cfd147",
  10: "#cb9836",
  11: "#654a26",
  12: "#326240",
  13: "#9ac7e3",
  14: "#59137d",
};

/**
 * Convert a metro file and a positions file to a JSON file
 * @param {*} metro the metro file path
 * @param {*} positions the positions file path
 * @param {*} outputFilePath the output file path
 */
export const convertMetroToJSON = (metro, positions, outputFilePath) => {
  const metroData = fs.readFileSync(metro, "utf-8");
  const positionsData = fs.readFileSync(positions, "utf-8").replace(/@/g, " ");

  const lines = metroData.split("\n");
  const linesPosition = positionsData.split("\n");

  const graph = {
    nodes: [],
  };

  const nodeMap = new Map();

  lines.forEach((line) => {
    if (line.trim() === "") return;

    if (line.startsWith("V")) {
      const [, summitNumber, name, lineNumber, isTerminus, connection] =
        line.match(/V (\d+)\s+(.+?)\s+;([\d\w]+)\s+;(True|False)\s+(\d+)/);

      const nodeId = parseInt(summitNumber);

      if (!nodeMap.has(nodeId)) {
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

        graph.nodes.push(node);
        nodeMap.set(nodeId, node);
      }
    }

    if (line.startsWith("E")) {
      const [, summitNumber1, summitNumber2, time] =
        line.match(/E (\d+) (\d+) (\d+)/);

      const node1 = nodeMap.get(parseInt(summitNumber1));
      const node2 = nodeMap.get(parseInt(summitNumber2));

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
  });

  fs.writeFileSync(outputFilePath, JSON.stringify(graph, null, 2), "utf-8");

  return graph;
};
