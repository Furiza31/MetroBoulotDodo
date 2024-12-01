<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Search } from "lucide-vue-next";
import { defineEmits, defineProps, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    inputValue.value = value;
  }
);

const updateValue = () => {
  emit("update:modelValue", inputValue.value);
};
</script>

<template>
  <div class="relative w-full max-w-sm items-center">
    <Input
      id="search"
      type="text"
      :placeholder="placeholder"
      class="pl-10"
      v-model="inputValue"
      @input="updateValue"
    />
    <span
      class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
    >
      <Search class="size-6 text-muted-foreground" />
    </span>
  </div>
</template>
