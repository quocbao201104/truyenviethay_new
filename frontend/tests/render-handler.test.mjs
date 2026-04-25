import test from "node:test";
import assert from "node:assert/strict";

import handler from "../api/render.js";

function createJsonResponse(data, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    async json() {
      return data;
    },
    async text() {
      return JSON.stringify(data);
    },
  };
}

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = JSON.stringify(payload);
      return this;
    },
    send(payload) {
      this.body = String(payload);
      return this;
    },
  };
}

test("chapter render uses backend chapter fields and chapter content url for SEO HTML", async () => {
  const originalFetch = global.fetch;

  global.fetch = async (url) => {
    const requestUrl = String(url);

    if (requestUrl.includes("/api/chuong/slug/story-slug/chapter-slug")) {
      return createJsonResponse({
        data: {
          tieu_de: "Chapter One",
          ten_truyen: "Story Name",
          content_url: "https://cdn.example.com/chapters/story-slug/chapter-slug.json",
          truyen: {
            slug: "story-slug",
            ten_truyen: "Story Name",
          },
        },
      });
    }

    if (requestUrl === "https://cdn.example.com/chapters/story-slug/chapter-slug.json") {
      return createJsonResponse({
        title: "Chapter One",
        content: "Hello from chapter content",
      });
    }

    throw new Error(`Unexpected fetch: ${requestUrl}`);
  };

  const req = {
    method: "GET",
    url: "/api/render?path=/truyen-chu/story-slug/chapter-slug",
    query: {
      path: "/truyen-chu/story-slug/chapter-slug",
    },
    headers: {
      accept: "text/html",
    },
  };
  const res = createMockResponse();

  try {
    await handler(req, res);
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<title>Chapter One - Story Name \| TruyenVietHay<\/title>/);
  assert.match(
    res.body,
    /<link rel="canonical" href="https:\/\/truyenviethay\.id\.vn\/truyen-chu\/story-slug\/chapter-slug" \/>/,
  );
  assert.match(res.body, /<noscript id="seo-ssr-content">[\s\S]*<h1>Chapter One<\/h1>/);
  assert.match(res.body, /Hello from chapter content/);
  assert.doesNotMatch(res.body, /undefined/);
});

test("missing chapter render returns a real 404 instead of a generic 200 html fallback", async () => {
  const originalFetch = global.fetch;

  global.fetch = async (url) => {
    const requestUrl = String(url);

    if (requestUrl.includes("/api/chuong/slug/story-slug/missing-chapter")) {
      return createJsonResponse(
        { message: "Khong tim thay chuong" },
        { ok: false, status: 404 },
      );
    }

    throw new Error(`Unexpected fetch: ${requestUrl}`);
  };

  const req = {
    method: "GET",
    url: "/api/render?path=/truyen-chu/story-slug/missing-chapter",
    query: {
      path: "/truyen-chu/story-slug/missing-chapter",
    },
    headers: {
      accept: "text/html",
    },
  };
  const res = createMockResponse();

  try {
    await handler(req, res);
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(res.statusCode, 404);
  assert.match(res.body, /Not Found/i);
});
