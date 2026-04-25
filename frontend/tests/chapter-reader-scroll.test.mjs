import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("chapter route uses a single reader scroll container", async () => {
  const layout = await readSource("../src/layouts/MainLayout.vue");
  const chapterView = await readSource("../src/views/ChapterView.vue");

  assert.match(layout, /isReaderRoute/);
  assert.match(layout, /main-layout--reader/);
  assert.match(layout, /main-content--reader/);
  assert.match(layout, /<AppFooter\s+v-if="!isReaderRoute"/);
  assert.match(layout, /\.main-layout--reader[\s\S]*?overflow:\s*hidden/);
  assert.match(layout, /\.main-layout--reader\s+\.main-content[\s\S]*?overflow-y:\s*auto/);

  assert.match(chapterView, /getReaderScrollElement/);
  assert.match(chapterView, /scrollTarget/);
  assert.doesNotMatch(chapterView, /window\.addEventListener\('scroll', handleScroll/);
  assert.doesNotMatch(chapterView, /window\.removeEventListener\('scroll', handleScroll/);
});
