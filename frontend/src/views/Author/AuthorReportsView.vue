<template>
  <div class="author-report-page">
    <main class="author-report-shell">
      <div class="page-header-spirit animate-fadeIn">
        <h1 class="page-title-glow">Hộp Thư Report Nội Dung</h1>
        <p class="page-subtitle">Theo dõi các report chapter và truyện của bạn.</p>
        <div class="header-action-row mt-4">
          <router-link to="/user/dashboard" class="header-action-pill">
            <i class="fas fa-chart-line"></i>
            <span>Về Dashboard</span>
          </router-link>
        </div>
      </div>

      <section class="author-report-toolbar">
        <select v-model="statusFilter" class="report-select" @change="loadReports">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="resolved">Đã xử lý</option>
        </select>
      </section>

      <section class="author-report-layout">
        <div class="author-report-list">
          <div v-if="store.loading" class="report-empty">Đang tải report...</div>
          <div v-else-if="store.authorReports.length === 0" class="report-empty">Chưa có report nào.</div>

          <button
            v-for="report in store.authorReports"
            v-else
            :key="report.id"
            type="button"
            class="report-list-item"
            :class="{ active: store.selectedReport?.id === report.id }"
            @click="selectReport(report.id)"
          >
            <div class="report-list-item__top">
              <strong>{{ getReportHeadline(report) }}</strong>
              <span class="status-pill" :data-status="report.status">{{ statusLabel(report.status) }}</span>
            </div>
            <p>{{ report.target?.story_title || "Không rõ truyện" }}</p>
            <small>{{ targetTypeLabel(report.target_type) }} • {{ issueTypeLabel(report) }} • {{ formatDate(report.created_at) }}</small>
          </button>
        </div>

        <div class="author-report-detail">
          <div v-if="!store.selectedReport" class="report-empty">Chọn một report để xử lý.</div>
          <template v-else>
            <h2>{{ getReportHeadline(store.selectedReport) }}</h2>
            <p class="detail-story">{{ store.selectedReport.target?.story_title || "Không rõ truyện" }}</p>

            <div class="report-description-block">
              <h3>Mục tiêu</h3>
              <p>{{ targetTypeLabel(store.selectedReport.target_type) }}</p>
            </div>

            <div class="report-description-block">
              <h3>Nội dung report</h3>
              <p>{{ store.selectedReport.description || "Không có mô tả thêm." }}</p>
            </div>

            <div class="report-description-block">
              <h3>Loại lỗi</h3>
              <p>{{ issueTypeLabel(store.selectedReport) }}</p>
            </div>

            <div v-if="store.selectedReport.target_type === 'chapter' && store.selectedReport.target?.chapter_number" class="report-description-block">
              <h3>Chapter</h3>
              <p>Chuong {{ store.selectedReport.target.chapter_number }}</p>
            </div>

            <div class="report-update-form">
              <label>
                <span>Trạng thái</span>
                <select v-model="statusDraft" class="report-select">
                  <option value="processing">Đang xử lý</option>
                  <option value="resolved">Đã xử lý</option>
                </select>
              </label>

              <label>
                <span>Ghi chú xử lý</span>
                <textarea v-model="noteDraft" rows="6" class="report-note"></textarea>
              </label>

              <button class="save-report-btn" :disabled="store.submitting" @click="saveReport">
                {{ store.submitting ? "Đang lưu..." : "Cập nhật report" }}
              </button>
            </div>
          </template>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useReportStore } from "@/modules/report/report.store";
import {
  REPORT_STATUS_LABELS,
  REPORT_TARGET_LABELS,
  getReportIssueLabel,
  type ReportRecord,
  type ReportStatus,
} from "@/modules/report/report.types";

const store = useReportStore();
const statusFilter = ref<ReportStatus | "all">("all");
const statusDraft = ref<ReportStatus>("processing");
const noteDraft = ref("");

const loadReports = async () => {
  await store.fetchAuthorReports({
    status: statusFilter.value === "all" ? undefined : statusFilter.value,
  });

  if (store.selectedReport) {
    statusDraft.value = store.selectedReport.status === "resolved" ? "resolved" : "processing";
    noteDraft.value = store.selectedReport.admin_note || "";
  }
};

const selectReport = async (reportId: number) => {
  await store.fetchAuthorReportDetail(reportId);
  if (store.selectedReport) {
    statusDraft.value = store.selectedReport.status === "resolved" ? "resolved" : "processing";
    noteDraft.value = store.selectedReport.admin_note || "";
  }
};

const saveReport = async () => {
  if (!store.selectedReport) return;
  await store.updateAuthorReport(store.selectedReport.id, statusDraft.value, noteDraft.value);
};

const statusLabel = (status: ReportStatus) => REPORT_STATUS_LABELS[status];

const targetTypeLabel = (targetType: ReportRecord["target_type"]) => REPORT_TARGET_LABELS[targetType];

const issueTypeLabel = (report: ReportRecord) =>
  getReportIssueLabel(report.target_type, report.issue_type);

const getReportHeadline = (report: ReportRecord) => {
  if (report.target_type === "chapter") {
    return report.target?.chapter_title || `Chapter #${report.target_id}`;
  }

  return report.target?.story_title || `Truyện #${report.target_id}`;
};

const formatDate = (value: string) => new Date(value).toLocaleString("vi-VN");

watch(
  () => store.selectedReport,
  (report) => {
    if (!report) return;
    statusDraft.value = report.status === "resolved" ? "resolved" : "processing";
    noteDraft.value = report.admin_note || "";
  },
);

onMounted(loadReports);
</script>

<style scoped>
.author-report-page {
  min-height: 100vh;
  background: #0b0f19;
  color: #cbd5e1;
  font-family: "Be Vietnam Pro", sans-serif;
}

.author-report-shell {
  max-width: 1220px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.page-header-spirit {
  text-align: center;
  margin-bottom: 28px;
}

.page-title-glow {
  font-size: 2.6rem;
  font-weight: 900;
  color: #f8fafc;
}

.page-subtitle {
  color: #94a3b8;
  margin-top: 8px;
}

.author-report-toolbar {
  margin-bottom: 18px;
}

.author-report-layout {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 18px;
}

.author-report-list,
.author-report-detail {
  background: #131b2c;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 28px;
  padding: 22px;
}

.report-list-item {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.8);
  color: inherit;
  cursor: pointer;
  margin-bottom: 12px;
}

.report-list-item.active {
  border-color: rgba(56, 189, 248, 0.45);
}

.report-list-item__top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-story,
.report-list-item p,
.report-description-block p {
  color: #cbd5e1;
  line-height: 1.55;
}

.detail-story {
  margin: 4px 0 18px;
}

.report-list-item p {
  margin: 0 0 8px;
}

.report-list-item small {
  color: #94a3b8;
  text-transform: capitalize;
}

.status-pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.14);
}

.status-pill[data-status="pending"] { color: #fbbf24; }
.status-pill[data-status="processing"] { color: #38bdf8; }
.status-pill[data-status="resolved"] { color: #34d399; }
.status-pill[data-status="rejected"] { color: #f87171; }

.report-description-block {
  background: rgba(15, 23, 42, 0.76);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 16px;
}

.report-update-form {
  display: grid;
  gap: 16px;
}

.report-update-form span {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}

.report-select,
.report-note {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.84);
  color: #e2e8f0;
  padding: 12px 14px;
}

.save-report-btn {
  border: 0;
  border-radius: 999px;
  padding: 12px 16px;
  font-weight: 800;
  background: linear-gradient(135deg, #38bdf8, #22c55e);
  color: #082f49;
  cursor: pointer;
}

.report-empty {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

@media (max-width: 980px) {
  .author-report-layout {
    grid-template-columns: 1fr;
  }
}
</style>
