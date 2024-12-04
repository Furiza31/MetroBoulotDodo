<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Node } from "@/types/MetroDataType";
import { Minus, SquareM } from "lucide-vue-next";
import { ref } from "vue";
import { Button } from "./ui/button";

defineProps<{
  searchResult: Node[];
}>();
const emits = defineEmits(["select-station"]);
const selected = ref<number | null>(null);

const onStationClick = (station: Node) => {
  selected.value = station.id;
  emits("select-station", station);
};
</script>

<template>
  <Card class="w-full">
    <CardHeader class="p-3">
      <CardTitle>Search result</CardTitle>
    </CardHeader>
    <CardContent
      class="flex flex-col justify-start items-center gap-2 p-3 pt-0 max-h-60 overflow-y-auto"
      v-if="searchResult.length > 0"
    >
      <Button
        v-for="station in searchResult"
        :key="station.id"
        class="w-full justify-start flex-col gap-1 h-fit"
        variant="outline"
        @click="onStationClick(station)"
        :class="{ 'bg-gray-200': selected === station.id }"
      >
        <span
          class="flex flex-row flex-nowrap w-full justify-start items-center gap-2 text-wrap text-left"
        >
          <SquareM />
          {{ station.name }}
        </span>
        <span
          class="flex flex-row flex-nowrap w-full justify-start items-center gap-2"
        >
          <Minus />
          Ligne {{ station.line }}
        </span>
      </Button>
    </CardContent>
    <CardContent v-else class="p-3 pt-0">
      <p>No result found</p>
    </CardContent>
  </Card>
</template>
