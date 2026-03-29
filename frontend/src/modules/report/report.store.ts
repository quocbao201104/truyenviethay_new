import { defineStore } from "pinia";
import { ref } from "vue";
import { useAppToast } from "@/composables/useAppToast";
import {
  createReportApi,
  getAdminReportDetailApi,
  getAdminReportsApi,
  getAuthorReportDetailApi,
  getAuthorReportsApi,
  getMyReportsApi,
  updateAdminReportApi,
  updateAuthorReportApi,
} from "./report.service";
import type {
  CreateReportPayload,
  ReportPagination,
  ReportRecord,
  ReportStatus,
} from "./report.types";

const emptyPagination = (): ReportPagination => ({
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 1,
});

export const useReportStore = defineStore("report", () => {
  const { showSuccessToast, showErrorToast } = useAppToast();

  const submitting = ref(false);
  const loading = ref(false);
  const adminReports = ref<ReportRecord[]>([]);
  const authorReports = ref<ReportRecord[]>([]);
  const myReports = ref<ReportRecord[]>([]);
  const selectedReport = ref<ReportRecord | null>(null);
  const pagination = ref<ReportPagination>(emptyPagination());
  const error = ref<string | null>(null);

  const withError = (err: any, fallback: string) => {
    const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
    error.value = message;
    return message;
  };

  const submitReport = async (payload: CreateReportPayload) => {
    submitting.value = true;
    error.value = null;
    try {
      const response = await createReportApi(payload);
      showSuccessToast("Đã gửi report thành công.");
      return response.data;
    } catch (err: any) {
      const message = withError(err, "Không thể gửi report.");
      showErrorToast(message);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const fetchMyReports = async (page = 1, limit = 20) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getMyReportsApi(page, limit);
      myReports.value = response.data || [];
      pagination.value = response.pagination || emptyPagination();
    } catch (err: any) {
      withError(err, "Không thể tải danh sách report của bạn.");
    } finally {
      loading.value = false;
    }
  };

  const fetchAdminReports = async (params: {
    page?: number;
    limit?: number;
    status?: ReportStatus | "";
    target_type?: string;
    issue_type?: string;
  } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getAdminReportsApi(params);
      adminReports.value = response.data || [];
      pagination.value = response.pagination || emptyPagination();
      if (adminReports.value.length === 0) {
        selectedReport.value = null;
      } else if (!selectedReport.value || !adminReports.value.some((report) => report.id === selectedReport.value?.id)) {
        selectedReport.value = adminReports.value[0];
      }
    } catch (err: any) {
      withError(err, "Không thể tải report cho admin.");
    } finally {
      loading.value = false;
    }
  };

  const fetchAdminReportDetail = async (reportId: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getAdminReportDetailApi(reportId);
      selectedReport.value = response.data;
    } catch (err: any) {
      withError(err, "Không thể tải chi tiết report.");
    } finally {
      loading.value = false;
    }
  };

  const updateAdminReport = async (reportId: number, status: ReportStatus, adminNote?: string | null) => {
    submitting.value = true;
    error.value = null;
    try {
      const response = await updateAdminReportApi(reportId, {
        status,
        admin_note: adminNote || null,
      });
      selectedReport.value = response.data;
      adminReports.value = adminReports.value.map((report) =>
        report.id === reportId ? response.data : report
      );
      showSuccessToast("Đã cập nhật trạng thái report.");
      return response.data;
    } catch (err: any) {
      const message = withError(err, "Không thể cập nhật report.");
      showErrorToast(message);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const fetchAuthorReports = async (params: { page?: number; limit?: number; status?: ReportStatus | "" } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getAuthorReportsApi(params);
      authorReports.value = response.data || [];
      pagination.value = response.pagination || emptyPagination();
      if (authorReports.value.length === 0) {
        selectedReport.value = null;
      } else if (!selectedReport.value || !authorReports.value.some((report) => report.id === selectedReport.value?.id)) {
        selectedReport.value = authorReports.value[0];
      }
    } catch (err: any) {
      withError(err, "Không thể tải report của tác giả.");
    } finally {
      loading.value = false;
    }
  };

  const fetchAuthorReportDetail = async (reportId: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getAuthorReportDetailApi(reportId);
      selectedReport.value = response.data;
    } catch (err: any) {
      withError(err, "Không thể tải chi tiết report.");
    } finally {
      loading.value = false;
    }
  };

  const updateAuthorReport = async (reportId: number, status: ReportStatus, adminNote?: string | null) => {
    submitting.value = true;
    error.value = null;
    try {
      const response = await updateAuthorReportApi(reportId, {
        status,
        admin_note: adminNote || null,
      });
      selectedReport.value = response.data;
      authorReports.value = authorReports.value.map((report) =>
        report.id === reportId ? response.data : report
      );
      showSuccessToast("Đã cập nhật trạng thái report.");
      return response.data;
    } catch (err: any) {
      const message = withError(err, "Không thể cập nhật report.");
      showErrorToast(message);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const resetSelection = () => {
    selectedReport.value = null;
  };

  return {
    submitting,
    loading,
    adminReports,
    authorReports,
    myReports,
    selectedReport,
    pagination,
    error,
    submitReport,
    fetchMyReports,
    fetchAdminReports,
    fetchAdminReportDetail,
    updateAdminReport,
    fetchAuthorReports,
    fetchAuthorReportDetail,
    updateAuthorReport,
    resetSelection,
  };
});
