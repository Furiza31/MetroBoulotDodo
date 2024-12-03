<script setup lang="ts">
import { dataService } from "@/services/DataService";
import { Node } from "@/types/MetroDataType";
import { Ref, ref, watch } from "vue";
import SearchInput from "./SearchInput.vue";
import SearchResult from "./SearchResult.vue";

const searchInputStartStation = ref("");
const searchResultStartStation: Ref<Node[]> = ref([]);
const searchInputEndStation = ref("");
const searchResultEndStation: Ref<Node[]> = ref([]);

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
  </section>
</template>

<style scoped>
.panel {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
