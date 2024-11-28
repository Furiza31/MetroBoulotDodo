<script setup lang="ts">
import { LoaderCircle } from "lucide-vue-next";
import { onMounted, onUnmounted, ref } from "vue";
import { dataService } from "./services/DataService";
import { GraphService } from "./services/GraghService";
import { LineType, MetroDataType } from "./types/MetroDataType";

const isLoading = ref(true);
let subway: MetroDataType = {
  nodes: [],
};
let subwayLines: LineType[] = [];
const graphContainer = ref(null);
let graphService: GraphService;

onMounted(async () => {
  isLoading.value = false;
  subway = await dataService.getSubwayData();
  subwayLines = await dataService.getSubwayLines();

  console.log(subway);
  console.log(subwayLines);

  graphService = new GraphService(
    graphContainer.value!,
    window,
    subway,
    subwayLines
  );
});

onUnmounted(() => {});
</script>

<template>
  <main class="relative block h-screen w-screen">
    <div
      v-if="!isLoading"
      class="absolute block h-screen w-screen"
      id="graphContainer"
      ref="graphContainer"
    ></div>
    <div v-else class="absolute block h-screen w-screen">
      <div class="flex justify-center items-center h-full w-full flex-col">
        <LoaderCircle :size="64" class="animate-spin" />
        <h1>Loading datas, please wait...</h1>
      </div>
    </div>
  </main>
</template>
