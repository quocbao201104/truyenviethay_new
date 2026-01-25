<template>
  <div class="input-group">
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder=" "
      required
    />
    <label> <i v-if="iconClass" :class="iconClass"></i> {{ label }} </label>
    <div class="slot-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseInput",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "text",
    },
    iconClass: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
};
</script>

<style scoped>
.input-group {
  position: relative;
  width: 100%;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 10px 40px 10px 10px;
  border: 1px solid #4caf50;
  border-radius: 8px;
  background: #1a1d29;
  font-size: 1rem;
  color: #ffffff;
  transition: all 0.3s ease;
}

.input-group input:focus {
  border-color: #388e3c;
  box-shadow: 0 0 6px rgba(76, 175, 80, 0.2);
  outline: none;
}

.input-group label {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: #cccccc;
  font-size: 1rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.input-group label i {
  color: #4caf50;
  font-size: 1rem;
}

.input-group .slot-container {
  position: absolute;
  top: 0;
  right: 5px;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 3;
}

.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -1px;
  left: 5px;
  font-size: 0.8rem;
  color: #4caf50;
  background: #1a1d29;
  padding: 0 5px;
  border-radius: 4px;
}
</style>
