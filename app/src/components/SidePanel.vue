<script setup lang="ts">
import { dataService } from "@/services/DataService";
import { Node, PathType } from "@/types/MetroDataType";
import { computed, Ref, ref, watch } from "vue";
import SearchInput from "./SearchInput.vue";
import SearchResult from "./SearchResult.vue";

import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Circle, Minus, SquareM } from "lucide-vue-next";

const searchInputStartStation = ref("");
const searchResultStartStation: Ref<Node[]> = ref([]);
const searchInputEndStation = ref("");
const searchResultEndStation: Ref<Node[]> = ref([]);
const searchInputMSTStation = ref("");
const searchResultMSTStation: Ref<Node[]> = ref([]);


const steps = computed(() =>
  props.path?.nodes.map((node, index) => {
    const lineChange =
      index > 0 && node.line !== props.path?.nodes[index - 1].line;

    return {
      step: index + 1,
      name: node.name,
      line: node.line,
      color: node.color,
      state: "completed",
      lineChange,
    };
  })
);

const props = defineProps({
  path: {
    type: Object as () => PathType | null,
  },
});

watch(searchInputStartStation, (value) => {
  searchResultStartStation.value = dataService.searchStation(value);
});

watch(searchInputEndStation, (value) => {
  searchResultEndStation.value = dataService.searchStation(value);
});

watch(searchInputMSTStation, (value) => {
  searchResultMSTStation.value = dataService.searchStation(value);
});

const emits = defineEmits(["select-start", "select-end", "select-mst-start"]);

const onStartStationSelected = (station: Node) => {
  searchInputStartStation.value = station.name;
  emits("select-start", station);
};

const onEndStationSelected = (station: Node) => {
  searchInputEndStation.value = station.name;
  emits("select-end", station);
};
const onMSTStationSelected = (station: Node) => {
  searchInputMSTStation.value = station.name;
  emits("select-mst-start", station);
};
</script>

<template>
  <section
      class="w-[350px] min-w-[350px] bg-blue-100 relative p-3 panel duration-300 flex flex-col gap-3 justify-start items-start"
  >
    <h1 class="text-lg font-bold mb-2 flex items-center gap-2">
      <Tree size="20" /> Trouver l'itinéraire
    </h1>
    <SearchInput
        v-model="searchInputStartStation"
        placeholder="Votre station de départ"
    />
    <SearchResult
        v-if="searchInputStartStation"
        :searchResult="searchResultStartStation"
        @select-station="onStartStationSelected"
    />

    <SearchInput
        v-model="searchInputEndStation"
        placeholder="Votre station d'arrivée"
    />
    <SearchResult
        v-if="searchInputEndStation"
        :searchResult="searchResultEndStation"
        @select-station="onEndStationSelected"
    />
    <h1 class="text-lg font-bold mb-2 flex items-center gap-2">
      <Tree size="20" /> ACPM Kruskal
    </h1>


    <SearchInput
        v-model="searchInputMSTStation"
        placeholder="Choissisez votre station"
    />
    <SearchResult
        v-if="searchInputMSTStation"
        :searchResult="searchResultMSTStation"
        @select-station="onMSTStationSelected"
    />
    <h1 class="text-lg font-bold my-4 flex items-center gap-2">
      <Tree size="20" /> GO, GO, GO ... !!
    </h1>

    <div class="overflow-y-auto w-full h-full mt-2" v-if="steps">
      <Stepper
          orientation="vertical"
          class="mx-auto flex w-full max-w-md flex-col justify-start gap-10"
          :default-value="steps?.length"
      >
        <StepperItem
            v-for="step in steps"
            :key="step.step"
            v-slot="{ state }"
            class="relative flex w-full items-start gap-6"
            :step="step.step"
        >
          <StepperSeparator
              v-if="steps && step.step !== steps[steps.length - 1].step"
              class="absolute left-[18px] top-[38px] block h-[105%] w-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
          />

          <StepperTrigger as-child class="pointer-events-none">
            <div
                class="z-10 rounded-full size-9"
                :style="{
                backgroundColor: step.color,
              }"
            >
              <Circle />
            </div>
          </StepperTrigger>

          <div class="flex flex-col gap-1">
            <StepperTitle
                :class="[state === 'active' && 'text-primary']"
                class="text-sm font-semibold transition lg:text-base"
            >
              <span
                  class="flex flex-row flex-nowrap w-full justify-start items-center gap-2 text-wrap text-left"
              >
                <SquareM />
                {{ step.name }}
              </span>
            </StepperTitle>
            <StepperDescription
                :class="[state === 'active' && 'text-primary']"
                class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
            >
              <span
                  class="flex flex-row flex-nowrap w-full justify-start items-center gap-2"
                  :class="{ 'text-destructive': step.lineChange }"
              >
                <Minus />
                <span v-if="step.lineChange">Changement de ligne</span>
                <span v-else>Linge</span> {{ step.line }}
              </span>
            </StepperDescription>
          </div>
        </StepperItem>
      </Stepper>
    </div>
  </section>
</template>


<style scoped>
.panel {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
