<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Node } from "@/types/MetroDataType";
import { Button } from "./ui/button";

defineProps<{
  searchResult: Node[];
}>();
const emits = defineEmits(["select-station"]);

const onStationClick = (station: Node) => {
  emits("select-station", station);
};
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Search result</CardTitle>
    </CardHeader>
    <CardContent
      class="flex flex-col justify-start items-center gap-2"
      v-if="searchResult.length > 0"
    >
      <Button
        v-for="station in searchResult"
        :key="station.id"
        class="w-full justify-start"
        variant="link"
        @click="onStationClick(station)"
      >
        {{ station.name }}
      </Button>
    </CardContent>
    <CardContent v-else>
      <p>No result found</p>
    </CardContent>
  </Card>
</template>
