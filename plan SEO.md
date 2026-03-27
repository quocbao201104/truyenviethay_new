# 1. Executive Summary
**Assumption**
- Mình không crawl live domain trực tiếp được trong môi trường hiện tại, nên audit này dựa trên codebase `truyenviethay_new` và coi là baseline kỹ thuật để triển khai production.
- Assumption: production đang deploy cùng cấu trúc frontend/backend hiện có.
- Assumption: hiện chưa có robots/sitemap generator chạy ngoài repo.

**Tóm tắt 10 vấn đề lớn nhất**
- Site đang là **SPA CSR** (Vite + `createWebHistory`) nên bot nhận HTML mỏng, nội dung chính (đặc biệt chapter) được tải sau bằng JS/CDN JSON: [frontend/src/router/index.ts:234](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/router/index.ts:234), [frontend/src/views/ChapterView.vue:349](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/ChapterView.vue:349), [frontend/src/views/ChapterView.vue:91](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/ChapterView.vue:91).
- Chưa thấy head SEO động (`title/description/canonical/og`) dù có dependency `@unhead/vue` nhưng chưa dùng: [frontend/package.json:14](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/package.json:14), [frontend/src/main.ts:12](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/main.ts:12).
- Thiếu `robots.txt` và `sitemap.xml` trong `frontend/public`: [frontend/public](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/public).
- `index.html` đang `lang="en"` và có meta no-cache toàn cục: [frontend/index.html:2](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/index.html:2), [frontend/index.html:8](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/index.html:8).
- Vercel rewrite mọi path về `index.html` + `no-store` cho toàn site HTML -> dễ tạo soft-404/crawl inefficiency/CWV kém: [frontend/vercel.json:3](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json:3), [frontend/vercel.json:9](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json:9).
- URL/query taxonomy rất rộng (`sort/status/genres/page`) và internal link đang đẩy vào faceted URLs -> nguy cơ crawl budget leak: [frontend/src/views/SearchView.vue:292](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/SearchView.vue:292), [frontend/src/views/CategoryView.vue:253](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/CategoryView.vue:253), [frontend/src/modules/storyAudio/views/StoryAudioView.vue:264](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/modules/storyAudio/views/StoryAudioView.vue:264).
- Inconsistent taxonomy query (`category` vs `categories`) gây URL phân mảnh: [frontend/src/components/home/CategoryCard.vue:3](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/components/home/CategoryCard.vue:3), [frontend/src/views/CategoryView.vue:261](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/CategoryView.vue:261).
- Chapter URL có khả năng duplicate (fallback chapterSlug số -> get by ID), cộng thêm query không cần thiết khi điều hướng đọc: [frontend/src/views/ChapterView.vue:306](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/ChapterView.vue:306), [frontend/src/views/StoryDetailView.vue:150](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/StoryDetailView.vue:150).
- Audio detail có link sang text nhưng chiều ngược lại yếu; chưa có transcript thật sự -> dễ thin page audio: [frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue:272](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue:272), [frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue:621](C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue:621).
- Chưa thấy JSON-LD/schema rõ ràng cho Book/ItemList/Breadcrumb/AudioObject.

**3 việc cần làm ngay**
- Triển khai **SSR hoặc prerender selective** cho các template public trọng yếu (`/`, list, story detail, chapter, category, author, audio detail).
- Thiết lập **robots + sitemap + canonical rules** chuẩn theo URL canonical indexable.
- Bật **SEO head management** theo template (title/meta/og/twitter/canonical) + noindex cho faceted/filter URLs.

---

# 2. Detailed Audit by Category

## 2.1 Indexation
- Findings: nhiều URL public quan trọng phụ thuộc render client-side; thiếu tín hiệu index rõ ràng (meta/canonical/structured data).
- Why it matters: site truyện có số URL lớn; nếu index pipeline yếu thì “Discovered - currently not indexed” tăng rất nhanh.
- Dấu hiệu/cách kiểm tra: GSC Indexing report; URL Inspection cho chapter/story/audio; log bot crawl vào HTML không có nội dung chính.
- Priority: **Critical**
- Tác động: **High**
- Độ khó: **High**
- Fix recommendation: hybrid rendering theo template, ưu tiên HTML có đầy đủ title/h1/desc/chapter links.
- Example implementation: prerender `/truyen-chu/:slug` và `/truyen-audio/:slug` theo danh sách sitemap; chapter render server-side snippet + body text chính.

## 2.2 Crawlability
- Findings: faceted query URLs được tạo mạnh từ UI filter/pagination.
- Why it matters: crawl budget site truyện thường bị đốt vào query/filter page thay vì chapter mới.
- Dấu hiệu/cách kiểm tra: crawl log cho `?sort=`, `?status=`, `?genres=`, `?page=`.
- Priority: **Critical**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: chuẩn hóa URL indexable dạng path, noindex/follow cho faceted URLs, hạn chế internal links tới query URLs.
- Example implementation: giữ `/the-loai/tien-hiep/` index; `/the-loai?categories=1&sort=...` noindex.

## 2.3 Robots.txt
- Findings: chưa có file robots trong public.
- Why it matters: không định hướng crawl ưu tiên cho bot; dễ crawl nhầm khu vực mỏng hoặc query pages.
- Dấu hiệu/cách kiểm tra: truy cập `/robots.txt`.
- Priority: **Critical**
- Tác động: **Medium**
- Độ khó: **Low**
- Fix recommendation: tạo robots chuẩn + khai báo sitemap index.
- Example implementation: disallow query faceted pattern; allow assets quan trọng; add sitemap index URL.

## 2.4 XML Sitemap
- Findings: chưa có sitemap file trong frontend public.
- Why it matters: site chapter-based cần feed URL mới liên tục để index nhanh chương mới.
- Dấu hiệu/cách kiểm tra: `/sitemap.xml`, GSC sitemap coverage.
- Priority: **Critical**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: tách sitemap theo loại URL và freshness.
- Example implementation: `sitemap-stories.xml`, `sitemap-chapters-*.xml`, `sitemap-authors.xml`, `sitemap-audio.xml`.

## 2.5 Canonical
- Findings: chưa thấy head canonical rule trung tâm; có nhiều biến thể URL/query.
- Why it matters: duplicate cluster trên site truyện làm phân tán ranking signals.
- Dấu hiệu/cách kiểm tra: crawl canonical cluster; compare canonical target vs URL thực.
- Priority: **Critical**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: canonical self cho URL indexable; canonical về parent cho faceted/thin.
- Example implementation: chapter canonical luôn về slug chuẩn; URL có query sort/page canonical về URL gốc indexable tương ứng.

## 2.6 URL Structure
- Findings: có route legacy/không thống nhất (`/the_loai/:id` vs `/the-loai`), query mismatch (`category` vs `categories`), redirect client-side route cũ (`/truyen-tranh`).
- Why it matters: URL nhất quán là nền tảng của crawl + canonical + internal link quality.
- Dấu hiệu/cách kiểm tra: crawl URL variants và mapping status code.
- Priority: **High**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: chuẩn hóa URL taxonomy bằng path segment, 301 server-side cho route cũ.
- Example implementation: 301 `/the_loai/:id` -> `/the-loai/<slug>/`; 301 `/truyen-tranh/*` -> `/truyen-audio/*`.

## 2.7 Pagination / Chapter Navigation
- Findings: danh sách chapter đang dựa chọn range + phân trang UI; chapter load động qua API/CDN.
- Why it matters: bot có thể không discover hết deep chapters nếu navigation không crawl-friendly.
- Dấu hiệu/cách kiểm tra: crawl depth chapter; số chapter indexed/tổng chapter.
- Priority: **High**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: render liên kết chapter HTML có thể crawl, có “Next/Prev chapter” dạng anchor thật, breadcrumb chapter.
- Example implementation: ở story detail render block chapter links crawlable cho N chương đầu + pagination URL tĩnh `/truyen-chu/<slug>/chuong-trang/2`.

## 2.8 Internal Linking
- Findings: audio -> text đã có, nhưng text -> audio chưa thấy rõ ở story detail; nhiều link đẩy vào query.
- Why it matters: với site truyện lớn, internal link graph quyết định tốc độ index chương mới.
- Dấu hiệu/cách kiểm tra: internal link reports; orphan chapter count.
- Priority: **High**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: chuẩn hóa cụm liên kết ngang/dọc giữa story/chapter/audio/taxonomy.
- Example implementation: trên story text thêm block “Nghe audio” và danh sách tập; trên audio tập thêm link chapter text tương ứng.

## 2.9 Taxonomy
- Findings: taxonomy hiện thiên query-driven; chưa có rule index rõ cho category/status/author/tag/filter.
- Why it matters: taxonomy là nguồn traffic scale lớn nhất sau chapter/story.
- Dấu hiệu/cách kiểm tra: số landing taxonomy có impressions >0, thin ratio.
- Priority: **High**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: chuyển taxonomy quan trọng sang URL tĩnh + mô tả unique + item quality threshold.
- Example implementation: index `/the-loai/tien-hiep/`, `/trang-thai/hoan-thanh/`, `/tac-gia/<slug>/`; noindex filter tổ hợp sâu.

## 2.10 Thin / Duplicate Content
- Findings: chapter/audio có nguy cơ mỏng nếu body không render HTML sẵn hoặc mô tả quá ngắn/generic.
- Why it matters: chapter-based site dễ bị đánh giá “templated thin pages”.
- Dấu hiệu/cách kiểm tra: ratio pages < X từ; duplicate title/meta; soft-404 signals.
- Priority: **Critical**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: đảm bảo text hữu ích tối thiểu cho mỗi URL index; canonical/noindex cho URL không đủ unique value.
- Example implementation: audio detail phải có tóm tắt + transcript đoạn + metadata tập, không chỉ player.

## 2.11 Meta Title / Description Templates
- Findings: hiện chưa thấy hệ thống head động trong app source.
- Why it matters: site truyện hàng trăm nghìn URL cần template hóa để tránh duplicate hàng loạt.
- Dấu hiệu/cách kiểm tra: audit title duplication theo template type.
- Priority: **Critical**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: bộ template theo page type + fallback an toàn.
- Example implementation: chapter title có `Tên truyện - Chương X: Tiêu đề | TruyenVietHay`.

## 2.12 Structured Data / Schema
- Findings: chưa thấy JSON-LD Book/Breadcrumb/ItemList/AudioObject.
- Why it matters: tăng hiểu ngữ nghĩa + eligibility rich results + entity consolidation.
- Dấu hiệu/cách kiểm tra: Rich Results Test + schema coverage.
- Priority: **High**
- Tác động: **Medium**
- Độ khó: **Medium**
- Fix recommendation: schema theo template + validate pipeline CI.
- Example implementation: story detail dùng `Book + BreadcrumbList`; chapter dùng `WebPage + BreadcrumbList`; audio dùng `AudioObject`.

## 2.13 Mobile UX / Core Web Vitals
- Findings: có nhiều UI nặng, `no-store` HTML global, dữ liệu render client-side.
- Why it matters: phần lớn traffic truyện là mobile; CWV ảnh hưởng ranking và retention.
- Dấu hiệu/cách kiểm tra: CrUX/Lighthouse mobile; INP/LCP/CLS theo template.
- Priority: **High**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: cache policy đúng cho HTML/assets, giảm JS hydrate, lazy chunk theo route, preconnect CDN/media.
- Example implementation: giữ `immutable` cho assets, bỏ `no-store` không cần thiết trên HTML list/detail.

## 2.14 JavaScript Rendering / SSR / HTML Crawlability
- Findings: kiến trúc hiện tại CSR-only (`vite build`), chapter content fetch từ CDN JSON.
- Why it matters: bot vẫn render JS nhưng không ổn định trên scale chapter lớn.
- Dấu hiệu/cách kiểm tra: fetch as Googlebot HTML snapshot.
- Priority: **Critical**
- Tác động: **High**
- Độ khó: **High**
- Fix recommendation: SSR/ISR hoặc prerender selective; tối thiểu render sườn nội dung crawlable.
- Example implementation: chuyển các trang SEO template sang Nuxt/SSR route-level hoặc prerender snapshot định kỳ.

## 2.15 Content Uniqueness / SERP Differentiation
- Findings: page copy theo motif giao diện đẹp nhưng chưa rõ “search intent module” khác biệt theo cụm từ khóa.
- Why it matters: SERP truyện cạnh tranh cao, cần lý do rõ để người dùng chọn click.
- Dấu hiệu/cách kiểm tra: CTR thấp dù position tốt; snippet na ná đối thủ.
- Priority: **Medium**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: thêm module unique: reading order guides, arc summary, character guide, version history.
- Example implementation: mỗi story có block “Lộ trình đọc”, “Tốc độ cập nhật”, “Bản nghe tương ứng”.

## 2.16 Programmatic SEO Pages
- Findings: nhiều tổ hợp dữ liệu có thể tạo landing page tĩnh nhưng hiện chủ yếu query filter.
- Why it matters: đây là kênh mở rộng organic scale bền vững nhất cho site truyện lớn.
- Dấu hiệu/cách kiểm tra: query demand theo cụm “truyện [thể loại] [trạng thái] [độ dài]”.
- Priority: **High**
- Tác động: **High**
- Độ khó: **Medium**
- Fix recommendation: tạo page generator có quota chất lượng + auto noindex khi mỏng.
- Example implementation: `/the-loai/tien-hiep/hoan-thanh/`, `/truyen-audio/tien-hiep/`.

---

# 3. Audio SEO Section

## Best structure recommendation
- Khuyến nghị hiện tại: **giữ 2 URL tách biệt** `text` và `audio` (phù hợp kiến trúc đang có), nhưng bắt buộc tăng unique value cho audio page.
- Tránh mô hình “audio page chỉ player + vài chip”.

## Indexation recommendation
- **Index độc lập** cho `/truyen-audio/:slug` nếu có đủ:
  - mô tả audio unique (không generic),
  - metadata đầy đủ (duration, số tập, ngày cập nhật, nguồn),
  - transcript/tóm tắt nội dung nghe,
  - internal links 2 chiều text <-> audio.
- Nếu thiếu các yếu tố trên: tạm **noindex,follow** cho audio detail.

## Canonical recommendation
- Audio page **self-canonical** khi:
  - intent “nghe truyện” khác intent “đọc truyện”,
  - có nội dung độc lập đủ dày,
  - có demand riêng trong Search Console.
- Audio page **canonical về text** khi:
  - chỉ có player + metadata ít,
  - mô tả gần như giống hệt story text,
  - không có transcript/tóm tắt riêng.
- Episode URL (nếu mở trong tương lai):
  - self-canonical chỉ khi mỗi episode có transcript/summary riêng.
  - không thì canonical về audio story page.

## Transcript recommendation
- Tối thiểu cho mỗi audio story:
  - “Transcript excerpt” 250-500 từ cho tập đang phát + summary tập.
  - cụm từ khóa intent nghe: “nghe truyện [tên] tập [x]”.
- Nếu mở episode URL:
  - transcript từng episode 600+ từ để tránh thin page.
- Thực tế với repo hiện tại: chưa thấy pipeline transcript.

## Schema recommendation
- Story text page: `Book`, `WebPage`, `BreadcrumbList`.
- Audio story page: `AudioObject` (hoặc `MediaObject`) + `BreadcrumbList`.
- Episode page (nếu tách): `AudioObject` theo tập.
- Chỉ dùng `PodcastEpisode` nếu nội dung thực sự là podcast series (không phải audiobook chương truyện thuần).

## Internal linking recommendation
- Text story -> Audio story: thêm CTA cố định “Nghe audio”.
- Audio story -> Text story: đã có, giữ và tăng prominence.
- Audio part -> Chapter text tương ứng.
- Chapter text -> Audio part tương ứng (nếu mapping part-chapter tồn tại).
- Sidebar toàn site: “Truyện có audio mới cập nhật”.

---

# 4. Action Roadmap

## 7-Day Plan
| Task | Owner | Kết quả đầu ra | KPI/Tín hiệu |
|---|---|---|---|
| Tạo `robots.txt` + `sitemap index` cơ bản | SEO + Dev | robots + sitemap live | GSC nhận sitemap thành công |
| Bật head SEO tối thiểu (title, description, canonical) cho 5 template chính | Dev | hệ template meta v1 | Giảm duplicate title/meta |
| Chuẩn hóa canonical query pages | Dev | canonical rules cho search/category/audio filters | Giảm index URL query |
| Chuẩn hóa taxonomy query (`category` vs `categories`) | Dev | 1 chuẩn query/path duy nhất | Giảm URL phân mảnh |
| Thêm liên kết text -> audio trên story detail | Dev | block “Nghe audio” rõ ràng | Tăng click internal sang audio |

## 30-Day Plan
| Task | Owner | Kết quả đầu ra | KPI/Tín hiệu |
|---|---|---|---|
| Triển khai prerender/SSR cho story detail + category + author + audio detail | Dev | HTML crawlable cho template SEO | Tăng “Crawled & indexed” |
| Xây sitemap phân mảnh: stories/chapters/authors/audio | Dev | cron generate sitemap | Index chapter mới nhanh hơn |
| Thiết kế taxonomy index policy (index/noindex matrix) | SEO | rulebook + QA checklist | Giảm thin taxonomy indexed |
| Bộ schema theo template | Dev + SEO | JSON-LD valid | Rich results/valid items tăng |
| Meta template full cho tất cả page types | SEO + Dev | template engine v2 | CTR tăng theo page type |

## 90-Day Plan
| Task | Owner | Kết quả đầu ra | KPI/Tín hiệu |
|---|---|---|---|
| Programmatic landing pages (genre x status x format) | SEO + Dev + Content | cụm landing pages chuẩn | Organic sessions từ long-tail tăng |
| Transcript pipeline cho audio | Dev + Content | transcript excerpt/episode | Audio pages index ổn định |
| Link graph optimization (orphan cleanup + related engine) | Dev + SEO | internal link map v2 | Crawl depth tốt hơn |
| SERP differentiation modules (guide, arc summary, reading path) | Content + SEO | template content block mới | CTR + dwell time tăng |
| Monitoring dashboard SEO kỹ thuật | SEO + Data | dashboard index/crawl/CWV | alert sớm regression |

---

# 5. Technical Spec Suggestions

## robots.txt (đề xuất)
```txt
User-agent: *
Allow: /

# Chặn faceted/query rác (tùy xác nhận framework routing)
Disallow: /*?*sort=
Disallow: /*?*status=
Disallow: /*?*genres=
Disallow: /*?*category=
Disallow: /*?*categories=
Disallow: /*?*page=

Sitemap: https://truyenviethay.id.vn/sitemap-index.xml
```

## sitemap structure (đề xuất)
- `sitemap-index.xml`
- `sitemap-stories.xml` (story detail)
- `sitemap-chapters-1.xml ... sitemap-chapters-n.xml`
- `sitemap-authors.xml`
- `sitemap-categories.xml` (chỉ taxonomy indexable)
- `sitemap-audio.xml` (chỉ audio pages đủ unique value)

## canonical rules
- Self-canonical:
  - homepage, story, chapter, author, category chuẩn, audio story chuẩn.
- Canonical về URL chuẩn:
  - mọi URL có query `sort/status/genres/page`.
  - route legacy `/the_loai/:id` -> canonical/301 về path mới.
- Canonical audio:
  - self nếu có transcript + metadata mạnh.
  - về text nếu thin.

## URL rules (đề xuất)
- Trang truyện: `/truyen/<story-slug>/`
- Trang chương: `/truyen/<story-slug>/chuong-<chapter-number>-<chapter-slug>/`
- Trang thể loại: `/the-loai/<genre-slug>/`
- Trang tác giả: `/tac-gia/<author-slug>/`
- Trang trạng thái: `/trang-thai/<dang-ra|hoan-thanh>/`
- Trang nghe truyện: `/truyen-audio/<story-slug>/`
- Trang audio episode/chapter (nếu tách): `/truyen-audio/<story-slug>/tap-<part-number>/`

## meta template rules
- Trang chủ:
  - Title: `TruyenVietHay - Đọc Truyện Chữ & Nghe Truyện Audio Mới Nhất`
  - Meta: `Kho truyện chữ và audio cập nhật liên tục: truyện mới, truyện full, truyện hot theo thể loại.`
- Trang truyện:
  - Title: `{Tên truyện} - Đọc online | {Tác giả} | TruyenVietHay`
  - Meta: `Đọc {Tên truyện} của {Tác giả}. {Số chương} chương, trạng thái {Trạng thái}. Có bản audio nếu khả dụng.`
- Trang chương:
  - Title: `{Tên truyện} - Chương {Số}: {Tiêu đề chương} | TruyenVietHay`
  - Meta: `Đọc {Tên truyện} chương {Số}: {Tiêu đề}. Điều hướng chương trước/sau, lưu tiến độ đọc.`
- Trang thể loại:
  - Title: `Truyện {Thể loại} mới nhất, hay nhất | TruyenVietHay`
  - Meta: `Danh sách truyện {Thể loại} cập nhật mới, lọc theo trạng thái và độ dài.`
- Trang tác giả:
  - Title: `Tác giả {Tên tác giả} - Danh sách truyện | TruyenVietHay`
  - Meta: `Tổng hợp truyện của tác giả {Tên tác giả}, theo dõi cập nhật chương mới.`
- Trang “truyện hoàn thành”:
  - Title: `Truyện Hoàn Thành (Full) mới cập nhật | TruyenVietHay`
  - Meta: `Danh sách truyện đã hoàn thành, đọc full theo thể loại yêu thích.`
- Trang “truyện mới cập nhật”:
  - Title: `Truyện Mới Cập Nhật Hôm Nay | TruyenVietHay`
  - Meta: `Cập nhật truyện mới nhất theo thời gian thực, theo dõi chương mới liên tục.`
- Trang nghe truyện:
  - Title: `{Tên truyện} Audio - Nghe truyện online | TruyenVietHay`
  - Meta: `Nghe {Tên truyện} audio: {Số tập} tập, tổng thời lượng {Duration}. Có liên kết qua bản đọc chữ.`
- Trang audio episode/chapter:
  - Title: `{Tên truyện} Audio - Tập {Số tập} | TruyenVietHay`
  - Meta: `Nghe {Tên truyện} tập {Số tập}. Kèm tóm tắt và transcript để theo dõi nội dung.`

## schema recommendations
- Home/list/category: `WebPage + ItemList + BreadcrumbList`
- Story detail: `Book + WebPage + BreadcrumbList`
- Chapter: `WebPage + BreadcrumbList`
- Author: `ProfilePage + Person + BreadcrumbList`
- Audio story: `AudioObject (hoặc MediaObject) + BreadcrumbList`
- Audio episode (nếu có): `AudioObject`
- FAQ: chỉ thêm nếu có block hỏi đáp thật (không spam).

---

# 6. SEO Opportunity Map

## Taxonomy opportunities
- Index landing pages có intent cao:
  - thể loại chính,
  - trạng thái hoàn thành/đang ra,
  - audio theo thể loại.
- Noindex:
  - filter tổ hợp sâu,
  - page kết quả quá ít item,
  - taxonomy rỗng/thin.

## Programmatic SEO opportunities
- Cụm URL:
  - `/the-loai/<genre>/hoan-thanh/`
  - `/the-loai/<genre>/moi-cap-nhat/`
  - `/truyen-audio/<genre>/`
  - `/tac-gia/<author>/truyen-moi/`
- Rule xuất bản:
  - chỉ index khi >= 12 item + có intro unique 120+ từ + internal links đủ.

## Internal linking opportunities
- Mọi chapter có:
  - chương trước/sau,
  - về story hub,
  - sang audio part tương ứng.
- Story hub có:
  - chương mới nhất,
  - chapter phổ biến,
  - truyện cùng thể loại,
  - tác giả liên quan,
  - “bản nghe”.

## Content differentiation opportunities
- Thêm block:
  - reading order,
  - arc/season summary,
  - nhân vật chính,
  - trạng thái tiến độ cập nhật.
- Tạo lợi thế snippet so với đối thủ chỉ có list chapter đơn thuần.

## Audio SEO opportunities
- Audio story page có:
  - summary riêng cho người nghe,
  - transcript excerpt,
  - metadata đầy đủ (duration/upload date/series/episode number).
- Audio sitemap riêng nếu volume lớn và index độc lập.

**Quick Wins (làm nhanh, impact lớn)**
- Tạo robots + sitemap index.
- Bật title/meta/canonical template ngay.
- Thêm link hai chiều text <-> audio.
- Chuẩn hóa query taxonomy, 301 route legacy.
- Noindex faceted URLs.

---

# 7. Final Prioritized Task List

| Priority | Task | Why | Owner | Difficulty | Expected Impact |
|---|---|---|---|---|---|
| Critical | Implement SSR/prerender cho template public chính | Giải quyết gốc vấn đề index/crawl của SPA | Dev | High | High |
| Critical | Add robots.txt + sitemap index + sitemap phân loại | Định hướng bot và tăng tốc index | Dev + SEO | Medium | High |
| Critical | Canonical framework cho query/legacy URLs | Chặn duplicate cluster lớn | Dev | Medium | High |
| Critical | Head SEO dynamic templates (title/meta/OG) | Tránh duplicate title/meta hàng loạt | Dev + SEO | Medium | High |
| Critical | Noindex/follow faceted filter URLs | Bảo toàn crawl budget | SEO + Dev | Low | High |
| High | Chuẩn hóa URL taxonomy (path-based) + 301 | Ổn định kiến trúc URL và link equity | Dev | Medium | High |
| High | Story/Chapter internal link graph chuẩn | Tăng discoverability chapter sâu | Dev + SEO | Medium | High |
| High | Audio page enrichment (summary + transcript excerpt) | Tránh thin audio pages | Content + Dev | Medium | High |
| High | Schema rollout theo page type | Tăng semantic clarity/rich result eligibility | Dev + SEO | Medium | Medium |
| High | CWV tune-up (cache/html policy, JS reduction) | Tăng ranking + UX mobile | Dev | Medium | High |
| Medium | Programmatic taxonomy pages có quality gate | Scale long-tail bền vững | SEO + Dev | Medium | High |
| Medium | Episode-level URL strategy (chỉ mở khi đủ content) | Tránh tạo hàng loạt thin URLs | SEO + Dev | Medium | Medium |
| Medium | SERP differentiation modules (guide/arc/summary) | Tăng CTR và intent match | Content + SEO | Medium | Medium |
| Low | Dashboard monitoring SEO kỹ thuật | Giảm regression khi scale | SEO + Data | Medium | Medium |

---

Nếu bạn muốn, bước tiếp theo mình có thể làm ngay là viết **spec triển khai kỹ thuật chi tiết theo file** cho repo này (task-by-task: `robots`, generator sitemap, head meta service, canonical middleware, schema composer) để dev bắt tay code trực tiếp.