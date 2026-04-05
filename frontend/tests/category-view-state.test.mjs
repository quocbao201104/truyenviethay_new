import test from "node:test";
import assert from "node:assert/strict";

import {
  CATEGORY_ROUTE_NAME,
  isCategoryRoute,
  parseCategoryQuery,
} from "../src/views/categoryViewState.js";

test("recognizes the category page route used by the router", () => {
  assert.equal(CATEGORY_ROUTE_NAME, "Categories");
  assert.equal(isCategoryRoute("Categories"), true);
  assert.equal(isCategoryRoute("CategoryView"), false);
});

test("parses both current and legacy category query params", () => {
  assert.deepEqual(
    parseCategoryQuery({
      categories: "1, 2, invalid, 3",
      sort: "luot_xem",
      page: "4",
    }),
    {
      selectedCategories: [1, 2, 3],
      sortBy: "luot_xem",
      currentPage: 4,
    }
  );

  assert.deepEqual(
    parseCategoryQuery({
      category: "9",
    }),
    {
      selectedCategories: [9],
      sortBy: "thoi_gian_cap_nhat",
      currentPage: 1,
    }
  );
});
