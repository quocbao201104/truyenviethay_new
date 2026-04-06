import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function readVercelConfig() {
  const raw = await readFile(new URL("../vercel.json", import.meta.url), "utf8");
  return JSON.parse(raw);
}

test("root requests are sent through the SEO renderer before the SPA index fallback", async () => {
  const config = await readVercelConfig();
  const rootRewriteIndex = config.rewrites.findIndex(
    (entry) => entry.source === "/" && entry.destination === "/api/render?path=/",
  );
  const rootIndexFallback = config.rewrites.findIndex(
    (entry) => entry.source === "/" && entry.destination === "/index.html",
  );

  assert.notEqual(rootRewriteIndex, -1, "expected an explicit root SEO rewrite");
  assert.notEqual(rootIndexFallback, -1, "expected the SPA root fallback to remain present");
  assert.ok(
    rootRewriteIndex < rootIndexFallback,
    "the root SEO rewrite must run before the static index fallback",
  );
});

test("legacy duplicate paths use permanent redirects to their canonical URL", async () => {
  const config = await readVercelConfig();
  const redirects = config.redirects || [];

  assert.ok(
    redirects.some(
      (entry) =>
        entry.source === "/the_loai/:id" &&
        entry.destination === "/the-loai?categories=:id" &&
        entry.permanent === true,
    ),
    "expected a 301 redirect from /the_loai/:id to /the-loai?categories=:id",
  );

  assert.ok(
    redirects.some(
      (entry) =>
        entry.source === "/truyen-tranh" &&
        entry.destination === "/truyen-audio" &&
        entry.permanent === true,
    ),
    "expected a 301 redirect from /truyen-tranh to /truyen-audio",
  );

  assert.ok(
    redirects.some(
      (entry) =>
        entry.source === "/truyen-tranh/:slug" &&
        entry.destination === "/truyen-audio/:slug" &&
        entry.permanent === true,
    ),
    "expected a 301 redirect from /truyen-tranh/:slug to /truyen-audio/:slug",
  );
});
