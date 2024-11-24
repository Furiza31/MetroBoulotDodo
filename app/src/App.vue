<script setup lang="ts">
import {
  LCircleMarker,
  LMap,
  LPolyline,
  LTileLayer,
} from "@vue-leaflet/vue-leaflet";
import { LoaderCircle } from "lucide-vue-next";
import { onMounted, Ref, ref } from "vue";
import { DataService } from "./services/DataService";
import { MetroDataType } from "./types/DataType";
import { LineType } from "./types/LineType";

const zoom = ref(10);
const parisCenter = [48.8566, 2.3522];
const center = ref(parisCenter);
const dataService = new DataService();
const loading = ref(true);
let datas: Ref<MetroDataType>;
let lines: Ref<LineType[]>;

onMounted(async () => {
  datas = ref(await dataService.getMetroData());
  lines = ref(await dataService.getMetroLines());
  loading.value = false;
});
</script>

<template>
  <main>
    <LMap
      ref="map"
      v-model:zoom="zoom"
      v-model:center="center"
      :useGlobalLeaflet="false"
      v-if="!loading"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="Stadia Maps Basemap"
      />
      <LCircleMarker
        v-for="data in datas.nodes"
        :key="'circle-' + data.id"
        :lat-lng="[data.latitude, data.longitude]"
        :radius="6"
        :color="'white'"
        :fill-color="data.color"
        :fill-opacity="0.8"
        :weight="2"
      />
      <LPolyline
        v-for="(line, index) in lines"
        :key="'line-' + index"
        :lat-lngs="line.latLngs"
        :color="line.color"
        :weight="5"
      />
    </LMap>
    <div v-else class="absolute block h-screen w-screen">
      <div class="flex justify-center items-center h-full w-full flex-col">
        <LoaderCircle :size="64" class="animate-spin" />
        <h1>Loading datas, please wait...</h1>
      </div>
    </div>
  </main>
</template>
