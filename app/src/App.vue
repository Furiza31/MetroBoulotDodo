<script setup lang="ts">
import { LoaderCircle } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import SidePanel from "./components/SidePanel.vue";
import { dataService } from "./services/DataService";
import { GraphService } from "./services/GraghService";
import { LineType, MetroDataType, Node, PathType } from "./types/MetroDataType";

const isLoading = ref(true);
let subway: MetroDataType = {
  nodes: [],
};
let subwayLines: LineType[] = [];
const graphContainer = ref(null);
let graphService: GraphService;
const stationOne = ref<Node | null>(null);
const stationTwo = ref<Node | null>(null);
const shorterPath = ref<PathType | null>(null);
const acpmPath = ref<PathType | null>(null);

onMounted(async () => {
  isLoading.value = false;
  subway = await dataService.getSubwayData();
  subwayLines = await dataService.getSubwayLines();

  graphService = new GraphService(
    graphContainer.value!,
    window,
    subway,
    subwayLines
  );
});

const selectStart = (station: Node) => {
  stationOne.value = station;
  graphService.setStartStation(station);
  if (stationTwo.value) {
    selectShortestPath();
  }
};

const selectEnd = (station: Node) => {
  stationTwo.value = station;
  graphService.setEndStation(station);
  if (stationOne.value) {
    selectShortestPath();
  }
};
const selectTour = () => {
  const path = dataService.getMinimumSpanningTree();
  acpmPath.value = path;
  graphService.highlightPath(path, "red");
};

const selectShortestPath = () => {
  if (stationOne.value && stationTwo.value) {
    const nodeAtLineTimeZero = dataService.getNodeAtLineTimeZero(
      stationOne.value
    );
    const datas = [...subway.nodes];
    datas.push(nodeAtLineTimeZero);
    const path = dataService.findPath(
      nodeAtLineTimeZero.id,
      stationTwo.value.id,
      datas
    );
    shorterPath.value = path;
    graphService.highlightPath(path, "red");
  }
};
</script>

<template>
  <main class="relative block h-screen w-screen">
    <div v-if="!isLoading" class="relative h-screen w-screen flex flex-row">
      <SidePanel
        @select-start="selectStart"
        @select-end="selectEnd"
        @select-mst-start="selectTour"
        :shorterPath="shorterPath"
        :acpmPath="acpmPath"
      />
      <div
        class="block h-full w-full"
        id="graphContainer"
        ref="graphContainer"
      ></div>
    </div>
    <div v-else class="absolute block h-screen w-screen">
      <div class="flex justify-center items-center h-full w-full flex-col">
        <LoaderCircle :size="64" class="animate-spin" />
        <h1>Loading datas, please wait...</h1>
      </div>
    </div>
  </main>
</template>
