// src/main.ts
import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router/index";
import { ToastPlugin } from "./plugins/toast";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./assets/styles/global.css";
import "./assets/styles/avatar-frames.css";

const app = createApp(App);
const head = createHead();

app.use(createPinia());
app.use(router);
app.use(head);
app.use(ToastPlugin);

app.mount("#app");
