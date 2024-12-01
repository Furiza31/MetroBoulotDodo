<script setup lang="ts">
import { dataService } from "@/services/DataService";
import { Node } from "@/types/MetroDataType";
import { Ref, ref, watch } from "vue";
import SearchInput from "./SearchInput.vue";
import SearchResult from "./SearchResult.vue";

const searchInputFirstStation = ref("");
const searchResultFirstStation: Ref<Node[]> = ref([]);
const searchInputSecondStation = ref("");
const searchResultSecondStation: Ref<Node[]> = ref([]);

watch(searchInputFirstStation, (value) => {
  searchResultFirstStation.value = dataService.searchStation(value);
});

watch(searchInputSecondStation, (value) => {
  searchResultSecondStation.value = dataService.searchStation(value);
});

const emits = defineEmits(["select-first-station", "select-second-station"]);

const onFirstStationSelected = (station: Node) => {
  searchInputFirstStation.value = station.name;
  emits("select-first-station", station);
};

const onSecondStationSelected = (station: Node) => {
  searchInputSecondStation.value = station.name;
  emits("select-second-station", station);
};
</script>

<template>
  <section
    class="w-[350px] min-w-[350px] bg-white relative p-3 panel duration-300 flex flex-col gap-3 justify-start items-start"
  >
    <SearchInput
      v-model="searchInputFirstStation"
      placeholder="Search first station"
    />
    <SearchResult
      :searchResult="searchResultFirstStation"
      @select-station="onFirstStationSelected"
    />
    <SearchInput
      v-model="searchInputSecondStation"
      placeholder="Search second station"
    />
    <SearchResult
      :searchResult="searchResultSecondStation"
      @select-station="onSecondStationSelected"
    />
  </section>
</template>

<style scoped>
.panel {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
