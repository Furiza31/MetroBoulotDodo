type Edge = {
  to: number;
  time: number;
};

export type Node = {
  id: number;
  name: string;
  line: string;
  isTerminus: boolean;
  connection: number;
  x: number;
  y: number;
  edges: Edge[];
  color: string;
  isFictive?: boolean;
};

export type MetroDataType = {
  nodes: Node[];
};

export type LineType = {
  id: string;
  coords: {
    start: {
      x: number;
      y: number;
    };
    end: {
      x: number;
      y: number;
    };
  };
  color: string;
};

export type PathType = {
  nodes: Node[];
  lines: LineType[];
  time: number;
};
