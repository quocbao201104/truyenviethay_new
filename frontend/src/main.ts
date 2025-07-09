// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router/index";
import "vue3-toastify/dist/index.css";
import Toast from "vue3-toastify";

import "./assets/styles/global.css"; // nếu có file css global

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Toast, {
  autoClose: 3000,
  position: "top-right",
});
app.mount("#app");
