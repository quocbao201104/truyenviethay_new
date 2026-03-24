<template>
  <component
    v-if="googleClientId"
    :is="GoogleLoginComponent"
    :client-id="googleClientId"
    :callback="callback"
    :button-config="buttonConfig"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

const props = defineProps<{
  callback: (response: { credential?: string }) => void;
}>();

const GoogleLoginComponent = defineAsyncComponent({
  loader: () => import("vue3-google-login").then((module) => module.GoogleLogin),
  delay: 0,
});

const googleClientId = computed(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || "");

const buttonConfig = {
  theme: "outline",
  size: "large",
  text: "signin_with",
  shape: "pill",
};

const callback = (response: { credential?: string }) => {
  props.callback(response);
};
</script>
