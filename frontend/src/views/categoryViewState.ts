import type { RouteRecordName, LocationQuery, LocationQueryRaw } from 'vue-router';

export const CATEGORY_ROUTE_NAME = "Categories";
export const DEFAULT_CATEGORY_SORT = "thoi_gian_cap_nhat";

const parseCategoryIds = (rawValue: any): number[] => {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return [];
  }

  const normalizedValues = Array.isArray(rawValue) ? rawValue : [rawValue];

  return normalizedValues
    .flatMap((value) => String(value).split(","))
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value) && value > 0);
};

export const isCategoryRoute = (routeName: RouteRecordName | null | undefined): boolean => routeName === CATEGORY_ROUTE_NAME;

export const parseCategoryQuery = (query: LocationQuery = {}) => {
  const selectedCategories = parseCategoryIds(query.categories ?? query.category);
  const parsedPage = Number.parseInt(String(query.page ?? ""), 10);

  return {
    selectedCategories,
    sortBy: String(query.sort || DEFAULT_CATEGORY_SORT),
    currentPage: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
};

export interface CategoryPageLocationParams {
  selectedCategories?: number[];
  sortBy?: string;
  currentPage?: number;
}

export const buildCategoryPageLocation = ({
  selectedCategories = [],
  sortBy = DEFAULT_CATEGORY_SORT,
  currentPage = 1,
}: CategoryPageLocationParams = {}) => {
  const query: LocationQueryRaw = {};

  if (selectedCategories.length > 0) {
    query.categories = selectedCategories.join(",");
  }

  if (sortBy !== DEFAULT_CATEGORY_SORT) {
    query.sort = sortBy;
  }

  if (currentPage > 1) {
    query.page = currentPage;
  }

  return {
    path: "/the-loai",
    query,
  };
};

