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
import { Minus, SquareM } from "lucide-vue-next";

const searchInputStartStation = ref("");
const searchResultStartStation: Ref<Node[]> = ref([]);
const searchInputEndStation = ref("");
const searchResultEndStation: Ref<Node[]> = ref([]);
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

const emits = defineEmits(["select-start", "select-end"]);

const onStartStationSelected = (station: Node) => {
  searchInputStartStation.value = station.name;
  emits("select-start", station);
};

const onEndStationSelected = (station: Node) => {
  searchInputEndStation.value = station.name;
  emits("select-end", station);
};
</script>

<template>
  <section
    class="w-[350px] min-w-[350px] bg-white relative p-3 panel duration-300 flex flex-col gap-3 justify-start items-start"
  >
    <SearchInput
      v-model="searchInputStartStation"
      placeholder="Search start station"
    />
    <SearchResult
      :searchResult="searchResultStartStation"
      @select-station="onStartStationSelected"
    />
    <SearchInput
      v-model="searchInputEndStation"
      placeholder="Search end station"
    />
    <SearchResult
      :searchResult="searchResultEndStation"
      @select-station="onEndStationSelected"
    />
    <div class="overflow-y-auto w-full h-full">
      <Stepper
        orientation="vertical"
        class="mx-auto flex w-full max-w-md flex-col justify-start gap-10"
        :default-value="3"
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
              class="z-10 rounded-[100%] size-9"
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
                Ligne {{ step.line }}
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
