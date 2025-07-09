<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>Họ tên</label>
      <input
        v-model="form.full_name"
        type="text"
        class="form-control"
        required
      />
    </div>
    <div class="form-group">
      <label>Email</label>
      <input v-model="form.email" type="email" class="form-control" required />
    </div>
    <div class="form-group">
      <label>Tên đăng nhập</label>
      <input
        v-model="form.username"
        type="text"
        class="form-control"
        required
      />
    </div>
    <div class="form-group">
      <label>Mật khẩu</label>
      <input
        v-model="form.password"
        type="password"
        class="form-control"
        required
      />
    </div>
    <div class="form-group">
      <label>Giới tính</label>
      <select v-model="form.gender" class="form-control">
        <option value="male">Nam</option>
        <option value="female">Nữ</option>
        <option value="other">Khác</option>
      </select>
    </div>
    <div class="form-group">
      <label>Số điện thoại</label>
      <input v-model="form.phone" type="text" class="form-control" required />
    </div>
    <button type="submit" class="btn btn-primary" :disabled="loading">
      Đăng ký
    </button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { toast } from "vue3-toastify";

toast.success("Đăng ký thành công!");
toast.error("Lỗi đăng ký!");

const emit = defineEmits(["submit"]);

const form = ref({
  full_name: "",
  email: "",
  username: "",
  password: "",
  gender: "male",
  phone: "",
});

const loading = ref(false);

const handleSubmit = () => {
  emit("submit", { ...form.value });
};
</script>
