<script setup lang="ts">
import { dataService } from "@/services/DataService";
import { Node, PathType } from "@/types/MetroDataType";
import { computed, Ref, ref, watch } from "vue";
import SearchInput from "./SearchInput.vue";
import SearchResult from "./SearchResult.vue";
import { Button } from "./ui/button";

import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Circle, Minus, SquareM } from "lucide-vue-next";

const searchInputStartStation = ref("");
const searchResultStartStation: Ref<Node[]> = ref([]);
const searchInputEndStation = ref("");
const searchResultEndStation: Ref<Node[]> = ref([]);

const steps = computed(() =>
  props.shorterPath?.nodes.map((node, index) => {
    const lineChange =
      index > 0 &&
      node.line !== props.shorterPath?.nodes[index - 1].line &&
      !props.shorterPath?.nodes[index - 1].isFictive;

    return {
      step: index + 1,
      name: node.name,
      line: node.line,
      color: node.color,
      state: "completed",
      lineChange,
      isFictive: node.isFictive ? true : false,
    };
  })
);

const props = defineProps({
  shorterPath: {
    type: Object as () => PathType | null,
  },
  acpmPath: {
    type: Object as () => PathType | null,
  },
});

watch(searchInputStartStation, (value) => {
  searchResultStartStation.value = dataService.searchStation(value, true);
});

watch(searchInputEndStation, (value) => {
  searchResultEndStation.value = dataService.searchStation(value, false);
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
const onMSTStationSelected = () => {
  emits("select-mst-start");
};
</script>

<template>
  <section
    class="w-[350px] min-w-[350px] bg-blue-100 relative p-3 panel duration-300 flex flex-col gap-3 justify-start items-start overflow-y-auto"
  >
    <h1 class="text-center w-full text-xl font-bold">Metro boulot dodo</h1>
    <Tabs default-value="itineraire" class="w-full h-full">
      <TabsList class="w-full">
        <TabsTrigger value="itineraire" class="w-full">
          Itinéraire
        </TabsTrigger>
        <TabsTrigger value="kruskal" class="w-full"> ACPM Kruskal </TabsTrigger>
      </TabsList>
      <TabsContent value="itineraire" asChild>
        <h1 class="text-lg font-bold mb-2 flex items-center gap-2">
          Trouver l'itinéraire
        </h1>
        <SearchInput
          v-model="searchInputStartStation"
          placeholder="Votre station de départ"
          class="mb-1"
        />
        <SearchResult
          v-if="searchInputStartStation"
          :searchResult="searchResultStartStation"
          @select-station="onStartStationSelected"
        />

        <SearchInput
          v-model="searchInputEndStation"
          placeholder="Votre station d'arrivée"
          class="mb-1"
        />
        <SearchResult
          v-if="searchInputEndStation"
          :searchResult="searchResultEndStation"
          @select-station="onEndStationSelected"
        />

        <div class="w-full h-fit mt-2" v-if="steps">
          <div v-if="props.shorterPath" class="my-1">
            Temps de parcours:
            {{ Math.round(props.shorterPath?.time / 60) }} minutes
          </div>
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
                v-if="
                  steps &&
                  step.step !== steps[steps.length - 1].step &&
                  step.isFictive === false
                "
                class="absolute left-[18px] top-[38px] block h-[105%] w-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
              />

              <StepperTrigger
                as-child
                class="pointer-events-none"
                v-if="step.isFictive === false"
              >
                <div
                  class="z-10 rounded-full size-9"
                  :style="{
                    backgroundColor: step.color,
                  }"
                >
                  <Circle />
                </div>
              </StepperTrigger>

              <div class="flex flex-col gap-1" v-if="step.isFictive === false">
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
      </TabsContent>
      <TabsContent value="kruskal">
        <h1 class="text-lg font-bold mb-2 flex items-center gap-2">
          ACPM Kruskal
        </h1>
        <Button class="w-full" @click="onMSTStationSelected">Calculer</Button>
        <div v-if="acpmPath" class="mt-1">
          <span>
            Temp de parcours: {{ Math.round(acpmPath.time / 60) }} minutes
          </span>
        </div>
      </TabsContent>
    </Tabs>
  </section>
</template>

<style scoped>
.panel {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
