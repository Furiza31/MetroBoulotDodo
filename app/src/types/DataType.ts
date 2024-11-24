type Edge = {
  to: number;
  time: number;
};

type Node = {
  id: number;
  name: string;
  line: string;
  isTerminus: boolean;
  connection: number;
  x: number;
  y: number;
  latitude: number;
  longitude: number;
  edges: Edge[];
  color: string;
};

export type MetroDataType = {
  nodes: Node[];
};
