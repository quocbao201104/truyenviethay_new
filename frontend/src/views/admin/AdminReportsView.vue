<template>
  <div class="report-admin-page">
    <main class="report-admin-shell">
      <div class="page-header-spirit animate-fadeIn">
        <h1 class="page-title-glow-admin">Báo Cáo Nội Dung</h1>
        <p class="page-subtitle">Trung tâm điều phối report cho comment, truyện và audio.</p>
        <div class="header-action-row mt-4">
          <router-link to="/admin/dashboard" class="header-action-pill">
            <i class="fas fa-chart-line"></i>
            <span>Về Dashboard</span>
          </router-link>
        </div>
      </div>

      <section class="report-filter-bar">
        <select v-model="statusFilter" class="report-select" @change="loadReports">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="resolved">Đã xử lý</option>
          <option value="rejected">Từ chối</option>
        </select>
        <select v-model="targetFilter" class="report-select" @change="loadReports">
          <option value="all">Tất cả mục tiêu</option>
          <option value="comment">Comment</option>
          <option value="novel">Truyen</option>
          <option value="audio">Audio</option>
        </select>
      </section>

      <section class="report-layout">
        <div class="report-list-card">
          <div class="report-section-title">
            <h2>Danh sách report</h2>
            <span>{{ store.pagination.total }} mục</span>
          </div>

          <div v-if="store.loading" class="report-empty">Đang tải report...</div>
          <div v-else-if="store.adminReports.length === 0" class="report-empty">Chưa có report nào.</div>

          <button
            v-for="report in store.adminReports"
            v-else
            :key="report.id"
            type="button"
            class="report-list-item"
            :class="{ active: store.selectedReport?.id === report.id }"
            @click="selectReport(report.id)"
          >
            <div class="report-list-item__top">
              <strong>#{{ report.id }} • {{ targetTypeLabel(report.target_type) }}</strong>
              <span class="status-pill" :data-status="report.status">{{ statusLabel(report.status) }}</span>
            </div>
            <p>{{ getReportHeadline(report) }}</p>
            <small>{{ issueTypeLabel(report) }} • {{ formatDate(report.created_at) }}</small>
          </button>
        </div>

        <div class="report-detail-card">
          <div v-if="!store.selectedReport" class="report-empty">Chọn một report để xem chi tiết.</div>
          <template v-else>
            <div class="report-section-title">
              <h2>Chi tiết report #{{ store.selectedReport.id }}</h2>
              <span class="status-pill" :data-status="store.selectedReport.status">
                {{ statusLabel(store.selectedReport.status) }}
              </span>
            </div>

            <dl class="report-meta-grid">
              <div>
                <dt>Reporter</dt>
                <dd>{{ store.selectedReport.reporter_name || `User #${store.selectedReport.reporter_id}` }}</dd>
              </div>
              <div>
                <dt>Mục tiêu</dt>
                <dd>{{ targetTypeLabel(store.selectedReport.target_type) }}</dd>
              </div>
              <div>
                <dt>Loại lỗi</dt>
                <dd>{{ issueTypeLabel(store.selectedReport) }}</dd>
              </div>
              <div>
                <dt>Truyen</dt>
                <dd>{{ store.selectedReport.target?.story_title || "Không rõ" }}</dd>
              </div>
            </dl>

            <div class="report-description-block">
              <h3>Mô tả</h3>
              <p>{{ store.selectedReport.description || "Không có mô tả thêm." }}</p>
            </div>

            <div v-if="store.selectedReport.target_type === 'comment' && store.selectedReport.target?.comment_excerpt" class="report-description-block">
              <h3>Trích comment</h3>
              <p>{{ store.selectedReport.target.comment_excerpt }}</p>
            </div>

            <div v-if="store.selectedReport.target_type === 'novel'" class="report-description-block">
              <h3>Truyện bị report</h3>
              <p>{{ store.selectedReport.target?.story_title || "Không rõ truyện" }}</p>
            </div>

            <div v-if="store.selectedReport.target_type === 'audio'" class="report-description-block">
              <h3>Audio bị report</h3>
              <p>{{ store.selectedReport.target?.story_title || "Không rõ audio" }}</p>
            </div>

            <div class="report-update-form">
              <label>
                <span>Trạng thái</span>
                <select v-model="statusDraft" class="report-select">
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="resolved">Đã xử lý</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </label>

              <label>
                <span>Ghi chú</span>
                <textarea v-model="noteDraft" rows="6" class="report-note"></textarea>
              </label>

              <button class="save-report-btn" :disabled="store.submitting" @click="saveReport">
                {{ store.submitting ? "Đang lưu..." : "Lưu cập nhật" }}
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
const targetFilter = ref<"all" | "comment" | "novel" | "audio">("all");
const statusDraft = ref<ReportStatus>("pending");
const noteDraft = ref("");

const loadReports = async () => {
  await store.fetchAdminReports({
    status: statusFilter.value === "all" ? undefined : statusFilter.value,
    target_type: targetFilter.value === "all" ? undefined : targetFilter.value,
  });

  if (store.selectedReport?.id) {
    statusDraft.value = store.selectedReport.status;
    noteDraft.value = store.selectedReport.admin_note || "";
  }
};

const selectReport = async (reportId: number) => {
  await store.fetchAdminReportDetail(reportId);
  if (store.selectedReport) {
    statusDraft.value = store.selectedReport.status;
    noteDraft.value = store.selectedReport.admin_note || "";
  }
};

const saveReport = async () => {
  if (!store.selectedReport) return;
  await store.updateAdminReport(store.selectedReport.id, statusDraft.value, noteDraft.value);
};

const statusLabel = (status: ReportStatus) => REPORT_STATUS_LABELS[status];

const targetTypeLabel = (targetType: ReportRecord["target_type"]) => REPORT_TARGET_LABELS[targetType];

const issueTypeLabel = (report: ReportRecord) =>
  getReportIssueLabel(report.target_type, report.issue_type);

const getReportHeadline = (report: ReportRecord) => {
  if (report.target_type === "comment") {
    return report.target?.story_title || "Comment khong ro nguon";
  }

    return report.target?.story_title || `Target #${report.target_id}`;
};

const formatDate = (value: string) => new Date(value).toLocaleString("vi-VN");

watch(
  () => store.selectedReport,
  (report) => {
    if (!report) return;
    statusDraft.value = report.status;
    noteDraft.value = report.admin_note || "";
  },
);

onMounted(loadReports);
</script>

<style scoped>
.report-admin-page {
  min-height: 100vh;
  background: #0b0f19;
  color: #cbd5e1;
}

.report-admin-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  font-family: "Be Vietnam Pro", sans-serif;
}

.page-header-spirit {
  text-align: center;
  margin-bottom: 28px;
}

.page-title-glow-admin {
  font-size: 2.8rem;
  font-weight: 900;
  color: #f8fafc;
}

.page-subtitle {
  color: #94a3b8;
  margin-top: 10px;
}

.report-filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.report-layout {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 18px;
}

.report-list-card,
.report-detail-card {
  background: #131b2c;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.32);
}

.report-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.report-section-title h2,
.report-description-block h3 {
  margin: 0;
  color: #f8fafc;
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
  border-color: rgba(52, 211, 153, 0.5);
}

.report-list-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.report-list-item p,
.report-description-block p {
  margin: 0 0 8px;
  color: #cbd5e1;
  line-height: 1.55;
}

.report-list-item small {
  color: #94a3b8;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.16);
  text-transform: capitalize;
}

.status-pill[data-status="pending"] { color: #fbbf24; }
.status-pill[data-status="processing"] { color: #38bdf8; }
.status-pill[data-status="resolved"] { color: #34d399; }
.status-pill[data-status="rejected"] { color: #f87171; }

.report-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.report-meta-grid dt {
  color: #94a3b8;
  margin-bottom: 6px;
}

.report-meta-grid dd {
  margin: 0;
  color: #f8fafc;
}

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
  color: #e2e8f0;
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

.report-note {
  resize: vertical;
}

.save-report-btn {
  border: 0;
  border-radius: 999px;
  padding: 12px 16px;
  font-weight: 800;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #052e26;
  cursor: pointer;
}

.report-empty {
  color: #94a3b8;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 980px) {
  .report-layout {
    grid-template-columns: 1fr;
  }

  .report-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
