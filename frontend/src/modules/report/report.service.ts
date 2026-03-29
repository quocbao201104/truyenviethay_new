import axios from "@/utils/axios";
import type {
  CreateReportPayload,
  ReportDetailResponse,
  ReportListResponse,
  ReportStatus,
  UpdateReportPayload,
} from "./report.types";

const cleanParams = <T extends Record<string, unknown>>(params: T) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "" && value !== "all")
  );

export const createReportApi = async (payload: CreateReportPayload): Promise<ReportDetailResponse> => {
  const response = await axios.post<ReportDetailResponse>("/api/reports", payload);
  return response.data;
};

export const getMyReportsApi = async (page = 1, limit = 20): Promise<ReportListResponse> => {
  const response = await axios.get<ReportListResponse>("/api/reports/mine", {
    params: { page, limit },
  });
  return response.data;
};

export const getAdminReportsApi = async (params: {
  page?: number;
  limit?: number;
  status?: ReportStatus | "" | "all";
  target_type?: string;
  issue_type?: string;
} = {}): Promise<ReportListResponse> => {
  const response = await axios.get<ReportListResponse>("/api/admin/reports", {
    params: cleanParams(params),
  });
  return response.data;
};

export const getAdminReportDetailApi = async (reportId: number): Promise<ReportDetailResponse> => {
  const response = await axios.get<ReportDetailResponse>(`/api/admin/reports/${reportId}`);
  return response.data;
};

export const updateAdminReportApi = async (
  reportId: number,
  payload: UpdateReportPayload
): Promise<ReportDetailResponse> => {
  const response = await axios.patch<ReportDetailResponse>(`/api/admin/reports/${reportId}`, payload);
  return response.data;
};

export const getAuthorReportsApi = async (params: {
  page?: number;
  limit?: number;
  status?: ReportStatus | "" | "all";
} = {}): Promise<ReportListResponse> => {
  const response = await axios.get<ReportListResponse>("/api/author/reports", {
    params: cleanParams(params),
  });
  return response.data;
};

export const getAuthorReportDetailApi = async (reportId: number): Promise<ReportDetailResponse> => {
  const response = await axios.get<ReportDetailResponse>(`/api/author/reports/${reportId}`);
  return response.data;
};

export const updateAuthorReportApi = async (
  reportId: number,
  payload: UpdateReportPayload
): Promise<ReportDetailResponse> => {
  const response = await axios.patch<ReportDetailResponse>(`/api/author/reports/${reportId}`, payload);
  return response.data;
};
