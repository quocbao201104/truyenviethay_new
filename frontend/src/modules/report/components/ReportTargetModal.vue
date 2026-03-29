<template>
  <teleport to="body">
    <div v-if="open" class="report-modal-backdrop" @click.self="$emit('close')">
      <div class="report-modal-shell animate-modal-in">
        <div class="report-modal-header">
          <div class="header-main">
            <i class="fas fa-triangle-exclamation text-emerald-400 mr-2"></i>
            <h3>Báo lỗi {{ targetLabel }}</h3>
          </div>
          <button class="report-close-btn" type="button" @click="$emit('close')">
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <div class="report-modal-body">
          <p class="report-modal-copy">
            Chọn loại vấn đề để Linh Đài tiếp nhận xử lý:
          </p>

          <div class="report-options-grid">
            <label
              v-for="option in issueOptions"
              :key="option.value"
              class="report-option-compact"
              :class="{ active: selectedIssue === option.value }"
            >
              <input v-model="selectedIssue" type="radio" name="report-issue" :value="option.value" />
              <span class="option-label">{{ option.label }}</span>
            </label>
          </div>

          <div class="report-textarea-wrap">
            <textarea
              v-model="description"
              rows="3"
              class="report-textarea"
              placeholder="Ghi chú thêm (không bắt buộc)..."
            ></textarea>
          </div>
        </div>

        <div class="report-modal-actions">
          <button type="button" class="report-btn ghost" @click="$emit('close')">Hủy</button>
          <button type="button" class="report-btn primary" :disabled="!selectedIssue || submitting" @click="handleSubmit">
            <i v-if="submitting" class="fas fa-spinner fa-spin mr-2"></i>
            {{ submitting ? "Đang gửi..." : "Gửi báo cáo" }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useReportStore } from "../report.store";
import { REPORT_ISSUE_OPTIONS, REPORT_TARGET_LABELS, type IssueOption, type ReportTargetType } from "../report.types";

const props = defineProps<{
  open: boolean;
  targetId: number | null;
  targetType: ReportTargetType;
  targetLabel?: string | null;
  customOptions?: IssueOption[] | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submitted"): void;
}>();

const reportStore = useReportStore();
const { submitting } = storeToRefs(reportStore);

const selectedIssue = ref("");
const description = ref("");

const issueOptions = computed(
  () => props.customOptions?.length ? props.customOptions : REPORT_ISSUE_OPTIONS[props.targetType]
);

const targetLabel = computed(() => props.targetLabel || REPORT_TARGET_LABELS[props.targetType]);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      selectedIssue.value = "";
      description.value = "";
    }
  }
);

const handleSubmit = async () => {
  if (!props.targetId || !selectedIssue.value) return;

  await reportStore.submitReport({
    target_id: props.targetId,
    target_type: props.targetType,
    issue_type: selectedIssue.value,
    description: description.value?.trim() || null,
  });

  emit("submitted");
  emit("close");
};
</script>

<style scoped>
.report-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 18, 0.82);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 2000;
}

.report-modal-shell {
  width: 100%;
  max-width: 440px;
  background: #111a28;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 24px;
  padding: 24px;
  color: #ecf3fb;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}

.report-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-main {
  display: flex;
  align-items: center;
}

.report-modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #f8fafc;
}

.report-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.report-close-btn:hover {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}

.report-modal-copy {
  margin-bottom: 16px;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}

.report-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.report-option-compact {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-size: 0.85rem;
}

.report-option-compact input {
  position: absolute;
  opacity: 0;
}

.option-label {
  font-weight: 600;
  color: #cbd5e1;
}

.report-option-compact:hover {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.3);
}

.report-option-compact.active {
  background: rgba(16, 185, 129, 0.12);
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
}

.report-option-compact.active .option-label {
  color: #10b981;
}

.report-textarea-wrap {
  margin-bottom: 20px;
}

.report-textarea {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(8, 15, 28, 0.4);
  color: #e2e8f0;
  padding: 12px 14px;
  resize: none;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.report-textarea:focus {
  border-color: #10b981;
  outline: none;
}

.report-modal-actions {
  display: flex;
  gap: 10px;
}

.report-btn {
  flex: 1;
  border: 0;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.report-btn.ghost {
  background: rgba(30, 41, 59, 0.6);
  color: #94a3b8;
}

.report-btn.primary {
  background: #10b981;
  color: #052e26;
}

.report-btn.primary:hover:not(:disabled) {
  background: #34d399;
  transform: translateY(-1px);
}

.report-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-modal-in {
  animation: modalIn 0.15s ease-out forwards;
}

@media (max-width: 480px) {
  .report-options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
