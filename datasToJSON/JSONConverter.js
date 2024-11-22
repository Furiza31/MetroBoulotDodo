import fs from "fs";

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

  lines.forEach((line) => {
    if (line.trim() === "") return;

    // if it's a line
    if (line.startsWith("V")) {
      const [, summitNumber, name, lineNumber, isTerminus, connection] =
        line.match(/V (\d+)\s+(.+?)\s+;([\d\w]+)\s+;(True|False)\s+(\d+)/);

      let positionFound = false;
      linesPosition.forEach((position) => {
        if (position.trim() === "") return;

        const [x, y, lineName] = position.split(";");

        // add the node to the graph with its position
        if (lineName.trim() === name.trim()) {
          positionFound = true;
          graph.nodes.push({
            id: parseInt(summitNumber),
            name: name.trim(),
            line: lineNumber.trim(),
            isTerminus: isTerminus === "True",
            connection: parseInt(connection),
            x: parseInt(x),
            y: parseInt(y),
          });
        }
      });

      // add the node to the graph without its position
      if (!positionFound) {
        graph.nodes.push({
          id: parseInt(summitNumber),
          name: name.trim(),
          line: lineNumber.trim(),
          isTerminus: isTerminus === "True",
          connection: parseInt(connection),
        });
      }
    }

    // if it's an edge
    if (line.startsWith("E")) {
      const [, summitNumber1, summitNumber2, time] =
        line.match(/E (\d+) (\d+) (\d+)/);

      // find the node with the id summitNumber1 and add an edge to it
      graph.nodes.forEach((node) => {
        if (node.id === parseInt(summitNumber1)) {
          node.edges = node.edges || [];
          node.edges.push({
            to: parseInt(summitNumber2),
            time: parseInt(time),
          });
        }
      });
    }
  });

  // Write the graph (formated JSON file) to the output file
  fs.writeFileSync(outputFilePath, JSON.stringify(graph, null, 2), "utf-8");

  return graph;
};
