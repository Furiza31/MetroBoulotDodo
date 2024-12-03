<script setup lang="ts">
import { LoaderCircle } from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import SidePanel from "./components/SidePanel.vue";
import { dataService } from "./services/DataService";
import { GraphService } from "./services/GraghService";
import { LineType, MetroDataType, Node } from "./types/MetroDataType";

const isLoading = ref(true);
let subway: MetroDataType = {
  nodes: [],
};
let subwayLines: LineType[] = [];
const graphContainer = ref(null);
let graphService: GraphService;
const search = ref("");
const stationOne = ref<Node | null>(null);
const stationTwo = ref<Node | null>(null);
const stationsSelected = computed(() => stationOne.value && stationTwo.value);

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

watch(search, (value) => {
  console.log(value);
});

const selectStart = (station: Node) => {
  stationOne.value = station;
  graphService.setStartStation(station.id);
};

const selectEnd = (station: Node) => {
  stationTwo.value = station;
  graphService.setEndStation(station.id);
};

watch(stationsSelected, (value) => {
  if (value) {
    console.log(
      dataService.findPath(stationOne.value!.id, stationTwo.value!.id)
    );
  }
});
</script>

<template>
  <main class="relative block h-screen w-screen">
    <div v-if="!isLoading" class="relative h-screen w-screen flex flex-row">
      <SidePanel
        @select-start="selectStart"
        @select-end="selectEnd"
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
