import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const loadChapterFormat = async () => {
  const source = await readFile(new URL("../src/utils/chapterFormat.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
};

test("formatChapterContent keeps content that already has line breaks", async () => {
  const { formatChapterContent } = await loadChapterFormat();
  const content = "Một câu đã xuống dòng.\nCâu sau giữ nguyên. Câu này cũng giữ nguyên.";

  assert.equal(formatChapterContent(content), content);
});

test("formatChapterContent splits compact prose after sentence endings", async () => {
  const { formatChapterContent } = await loadChapterFormat();
  const content = 'Hắn nói: "Ổn rồi." Nàng gật đầu。Có thể tiến hóa? Che lấy thở dài! Lương Cử đi tiếp.';

  assert.equal(
    formatChapterContent(content),
    'Hắn nói: "Ổn rồi."\n\nNàng gật đầu。\n\nCó thể tiến hóa?\n\nChe lấy thở dài!\n\nLương Cử đi tiếp.',
  );
});
