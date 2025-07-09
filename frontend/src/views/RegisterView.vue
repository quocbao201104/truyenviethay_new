<template>
  <div class="register-view">
    <RegisterForm @submit="handleRegister" />
  </div>
</template>

<script setup>
import RegisterForm from "@/modules/auth/RegisterForm.vue";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useToast } from "vue3-toastify";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

const handleRegister = async (form) => {
  try {
    await authStore.register(form);
    toast.success("Đăng ký thành công!");
    router.push("/dang-nhap");
  } catch (error) {
    toast.error(error.message || "Đăng ký thất bại!");
  }
};
</script>
