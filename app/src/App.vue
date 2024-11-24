<script setup lang="ts">
import {
  LCircleMarker,
  LMap,
  LPolyline,
  LTileLayer,
} from "@vue-leaflet/vue-leaflet";
import { onMounted, Ref, ref } from "vue";
import { DataService } from "./services/DataService";
import { MetroDataType } from "./types/DataType";
import { LineType } from "./types/LineType";

const zoom = ref(10);
const parisCenter = [48.8566, 2.3522];
const center = ref(parisCenter);
const dataService = new DataService();
let datas: Ref<MetroDataType>;
let lines: Ref<LineType[]>;

onMounted(async () => {
  datas = ref(await dataService.getMetroData());
  lines = ref(await dataService.getMetroLines());
});
</script>

<template>
  <main>
    <LMap
      ref="map"
      v-model:zoom="zoom"
      v-model:center="center"
      :useGlobalLeaflet="false"
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
  </main>
</template>
