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

Chat:
 **Phase 1: sửa nền tảng index/crawl** trước, vì hiện tại đây là nút thắt lớn nhất của `truyenviethay_new`.

**Thứ tự triển khai khuyến nghị**
1. **Phase 1 (Critical, 3-7 ngày): Indexation Foundation**
- Tạo `robots.txt`, `sitemap.xml`/`sitemap-index.xml` chuẩn.
- Bỏ cấu hình chặn cache toàn site trong [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json).
- Chuẩn hóa canonical + URL (lọc query rác, chỉ giữ URL chuẩn để index).
- Bật SEO head theo route (`title`, `meta`, canonical, og) bằng `@unhead/vue`.
- Sửa `<html lang="vi">` trong [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/index.html`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/index.html).

2. **Phase 2 (High, 2-4 tuần): On-page Template + Internal Linking**
- Template title/meta cho: home, truyện, chương, thể loại, tác giả, audio.
- Điều hướng chapter (`prev/next`, danh sách chương), truyện liên quan, cùng thể loại/tác giả.
- Liên kết chéo text ↔ audio để tránh self-cannibalization.
- Thêm schema: `BreadcrumbList`, `Book/CreativeWork`, `ItemList`, `AudioObject`.

3. **Phase 3 (High, 1-2 tháng): Taxonomy & Crawl Budget Control**
- Quy định taxonomy nào index/noindex.
- Noindex các filter page mỏng/trùng.
- Chuẩn hóa phân trang/listing để bot crawl sâu hơn vào chapter chất lượng.
- Dọn title/meta trùng hàng loạt.

4. **Phase 4 (Medium-High, 2-3 tháng): Scale Traffic**
- Programmatic landing pages (genre x status x length x origin).
- Audio SEO nâng cao: transcript/summaries theo episode.
- Audio sitemap riêng (nếu audio pages self-canonical và có unique value đủ mạnh).

----
Phase 1 batch 1 đã được triển khai xong trong repo `truyenviethay_new`.

Đã sửa:
- Thêm nền tảng SEO technical:
  - [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/public/robots.txt`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/public/robots.txt)
  - [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/public/sitemap.xml`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/public/sitemap.xml)
- Gỡ cấu hình cache gây bất lợi crawl/index trong Vercel + thêm cache riêng cho robots/sitemap:
  - [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json)
- Chuẩn hóa HTML root cho SEO:
  - đổi `lang="vi"`, thêm meta mặc định, bỏ no-cache meta cứng:
  - [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/index.html`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/index.html)
- Bật head manager runtime:
  - [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/main.ts`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/main.ts)
- Thêm lớp SEO helper (canonical/url/strip/truncate):
  - [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/seo/site.ts`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/seo/site.ts)
- Thêm SEO fallback toàn app (canonical + robots theo route + og/twitter mặc định):
  - [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/App.vue`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/App.vue)
- Thêm meta/canonical động cho 3 trang trọng tâm:
  - Home: [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/HomeView.vue`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/HomeView.vue)
  - Story detail: [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/StoryDetailView.vue`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/StoryDetailView.vue)
  - Chapter: [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/ChapterView.vue`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/views/ChapterView.vue)
- Bổ sung env type cho SEO vars:
  - [`/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/env.d.ts`](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/env.d.ts)
--------
Nhìn theo mức độ quan trọng, các phần bạn đã làm có giá trị thật:

* `robots.txt` + `sitemap.xml`: đã có tín hiệu crawl/index cơ bản
* gỡ cấu hình cache bất lợi trong `vercel.json`: rất đáng làm sớm
* sửa `lang="vi"` + bỏ no-cache meta cứng trong `index.html`: đúng
* bật runtime head manager: cần thiết để metadata theo route hoạt động
* thêm SEO helper + fallback toàn app: tốt, giúp không bị “trang nào đó quên canonical/meta”
* thêm meta/canonical động cho **Home / Story / Chapter**: đây là 3 template quan trọng nhất trước mắt

Nói ngắn: **batch 1 là đạt**.

Phần “bước tiếp theo” Codex gợi ý cũng hợp lý, nhưng mình sẽ **xếp lại thứ tự trong batch 2** để tối ưu hơn cho site của bạn.

## Thứ tự mình khuyên cho Phase 1 batch 2

### 1. Chuẩn hóa canonical rule cho list/query pages

Cái này nên làm **trước** schema.

Vì nếu:

* category page có `?page=2`
* `?sort=new`
* `?status=full`
* `?audio=true`
* hoặc nhiều query param khác

mà canonical chưa rõ, thì Google có thể index sai cụm URL hoặc tự chọn canonical ngoài ý muốn.

Bạn nên chốt rule rất rõ:

* query rác tracking (`utm_*`, `fbclid`, etc.) → canonical về URL sạch
* query sort/filter không có giá trị SEO → canonical về URL gốc hoặc `noindex,follow`
* pagination:

  * nếu page 2, 3... có nội dung danh sách khác nhau và cần crawl → self-canonical
  * nếu không muốn index sâu → `noindex,follow`
* chỉ giữ các URL taxonomy “thật sự có chiến lược index”

### 2. Tạo sitemap động từ backend cho story/chapter/audio

Đây là bước rất nên làm sớm, nhất là site truyện.

Với site của bạn, sitemap tĩnh chỉ là giải pháp tạm. Sitemap động mới giúp:

* truyện mới được phát hiện nhanh hơn
* chương mới lên sitemap đều
* `lastmod` có ý nghĩa
* tách riêng sitemap theo loại URL

Mình khuyên cấu trúc như sau:

* `/sitemap.xml` → sitemap index
* `/sitemaps/stories.xml`
* `/sitemaps/chapters-1.xml`, `/sitemaps/chapters-2.xml`
* `/sitemaps/audio.xml` hoặc chỉ thêm khi audio đủ mạnh để index riêng
* có thể thêm `/sitemaps/categories.xml` nếu taxonomy đã ổn

Ưu tiên:

* story
* chapter
* rồi mới audio

### 3. Thêm schema cơ bản cho story/chapter/audio

Schema nên làm sau canonical và sitemap động.

Thứ tự schema nên là:

* **Story detail**:

  * `BreadcrumbList`
  * `Book` hoặc `CreativeWork`
* **Chapter page**:

  * `BreadcrumbList`
  * `Article` hoặc `CreativeWork`
* **Audio page**:

  * chỉ thêm `AudioObject` nếu trang audio thực sự là page riêng có giá trị index độc lập
  * nếu audio chỉ là module trong chapter/story page, có thể nhúng schema thận trọng hơn thay vì đẩy thành entity độc lập quá sớm

## Đánh giá nhanh 3 đề xuất batch 2

### A. Sitemap động

**Nên làm ngay.**
Đây là hạng mục quan trọng nhất trong 3 cái.

### B. Canonical rule cho query/list pages

**Nên làm ngay, thậm chí trước sitemap động nếu query đang nhiều.**
Nếu không làm, rất dễ sinh index rác.

### C. Schema cơ bản

**Nên làm ngay sau khi canonical rule rõ.**
Có ích, nhưng không cứu được nếu URL/index policy đang mơ hồ.

---

## Batch 2 mình đề xuất viết lại thành checklist thực thi

### Batch 2A — URL & canonical governance

* định nghĩa danh sách query params:

  * tracking params
  * pagination params
  * sort/filter params
* mapping rule:

  * param nào bỏ khỏi canonical
  * param nào self-canonical
  * param nào `noindex,follow`
* áp dụng thống nhất cho:

  * home listing
  * category
  * author
  * search/filter
  * audio listing nếu có

**Done when**

* mọi trang list/query có canonical rule rõ
* không còn canonical trỏ lung tung hoặc giữ nguyên toàn bộ query rác

### Batch 2B — Dynamic sitemap

* sinh sitemap index từ backend
* sinh sitemap story
* sinh sitemap chapter có chia file
* thêm `lastmod`
* giới hạn mỗi file hợp lý
* chỉ đưa URL canonical, indexable vào sitemap

**Done when**

* sitemap không chứa URL query rác
* chapter mới được phản ánh tự động
* story mới vào sitemap mà không cần sửa tay

### Batch 2C — Base structured data

* Story: `BreadcrumbList` + `Book/CreativeWork`
* Chapter: `BreadcrumbList` + `CreativeWork/Article`
* Audio: `AudioObject` nếu self-canonical
* validate JSON-LD

**Done when**

* schema render đúng ở HTML
* không tạo conflict giữa entity story/chapter/audio

---

## Một điểm rất quan trọng cho audio

Ở batch 2, mình khuyên **chưa vội làm audio sitemap riêng**, trừ khi bạn đã xác định rõ:

* audio page tự canonical chính nó
* audio page có nội dung riêng đủ mạnh
* có title/meta riêng
* có transcript hoặc mô tả đủ tốt
* không chỉ là một player mỏng

Nếu chưa chắc, cứ:

* ưu tiên story + chapter sitemap
* audio để giai đoạn sau

## Mức độ hoàn thành hiện tại

Nếu lấy plan ban đầu làm chuẩn, mình chấm:

* **Phase 1 batch 1**: khoảng **70–80% phần nền tảng**
* thứ còn thiếu lớn nhất của Phase 1:

  1. canonical policy cho list/query URLs
  2. sitemap động thật sự
  3. kiểm tra render HTML/source cho bot
  4. schema nền tảng

### 4. Xác minh HTML thực tế mà bot nhìn thấy

Cần kiểm tra cho:

* home
* story detail
* chapter
* audio

Xem trong initial HTML có:

* title/meta đúng
* canonical đúng
* nội dung chính có hiện diện hay không
* schema có mặt hay không

Vì đôi khi app Vue “trông đúng trên browser”, nhưng bot fetch HTML ban đầu vẫn khá mỏng.

------
Trước đó đã sửa:
- [render.js](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/api/render.js)
- [vercel.json](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json)

Những gì đã làm:
1. Bật lại Option C nhưng an toàn:
- Rewrite chỉ áp cho request có `Accept: text/html` để tránh đụng asset/runtime  
  ([vercel.json](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/vercel.json):7-18)

2. Harden `api/render`:
- Resolve path từ nhiều nguồn (query + forwarded headers) để tránh sai route  
  ([render.js](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/api/render.js):64-95)
- Merge query an toàn cho policy canonical/noindex  
  ([render.js](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/api/render.js):97-116)
- Inject thêm `canonical` + `robots` + debug marker `x-seo-render` vào HTML source  
  ([render.js](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/api/render.js):127-139)
- Thêm fail-safe: nếu inject lỗi vẫn trả template HTML (không làm trắng trang)  
  ([render.js](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/api/render.js):209-218)

3. Thêm debug runtime để QA nhanh:
- Response header: `x-seo-render`, `x-seo-path`  
  ([render.js](/C:/Users/Admin/Downloads/web/truyenviethay_new/frontend/api/render.js):222-223)

Verification local:
- `npm run build` pass
- Mô phỏng `/tim-kiem`, `/the-loai?page=2` trả đúng:
  - canonical theo route
  - robots `noindex, follow` cho route cần noindex
  (hiện tại đã hiển thị canonical và robots khi test `/tim-kiem`, `/the-loai?page=2` nhưng trang chủ thì chưa có)
Src check:
<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TruyenVietHay - Đọc Truyện Chữ & Nghe Truyện Audio</title>
    <meta
      name="description"
      content="Đọc truyện chữ và nghe truyện audio miễn phí. Cập nhật chương mới mỗi ngày tại TruyenVietHay."
    />
    <meta name="apple-mobile-web-app-title" content="TruyenVietHay" />
    <meta property="og:site_name" content="TruyenVietHay" />
    <meta property="og:locale" content="vi_VN" />

    <!-- Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <!-- Fonts/CSS -->
    <link rel="preconnect" href="https://res.cloudinary.com" crossorigin />
    <link rel="preload" href="/fonts/critical/ebe222511beff24d66cf1065323e31dbf6dcbc4b.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/critical/b3cac1dad649a5230f2b83a860418f6d0825a546.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/critical/ba57728a5d4556be56beac3e24b5b3d30d7fbdc5.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/critical/8b6c7c9f87b1c1e862ce4c5134e9864d5ee7d77b.woff2" as="font" type="font/woff2" crossorigin />
    <script type="module" crossorigin src="/assets/index.DYpha23h.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor.CXTc2ZKB.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-charts.CI_Dm7_k.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-realtime.YzahyF3a.js">
    <link rel="stylesheet" crossorigin href="/assets/vendor.Bbo-_dVE.css">
    <link rel="stylesheet" crossorigin href="/assets/index.DE2yzZ9A.css">
  <link rel="manifest" href="/manifest.webmanifest"><script id="vite-plugin-pwa:register-sw" src="/registerSW.js"></script>
  <link rel="canonical" href="https://truyenviethay.id.vn/the-loai?page=2" />
  <meta name="robots" content="noindex, follow" />
  <meta name="x-seo-render" content="route-head-v2" />
</head>
  <body>
    <div id="app"></div>
  </body>
</html>


<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TruyenVietHay - Đọc Truyện Chữ & Nghe Truyện Audio</title>
    <meta
      name="description"
      content="Đọc truyện chữ và nghe truyện audio miễn phí. Cập nhật chương mới mỗi ngày tại TruyenVietHay."
    />
    <meta name="robots" content="index, follow" />
    <meta name="apple-mobile-web-app-title" content="TruyenVietHay" />
    <meta property="og:site_name" content="TruyenVietHay" />
    <meta property="og:locale" content="vi_VN" />

    <!-- Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <!-- Fonts/CSS -->
    <link rel="preconnect" href="https://res.cloudinary.com" crossorigin />
    <link rel="preload" href="/fonts/critical/ebe222511beff24d66cf1065323e31dbf6dcbc4b.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/critical/b3cac1dad649a5230f2b83a860418f6d0825a546.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/critical/ba57728a5d4556be56beac3e24b5b3d30d7fbdc5.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/critical/8b6c7c9f87b1c1e862ce4c5134e9864d5ee7d77b.woff2" as="font" type="font/woff2" crossorigin />
    <script type="module" crossorigin src="/assets/index.DYpha23h.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor.CXTc2ZKB.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-charts.CI_Dm7_k.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-realtime.YzahyF3a.js">
    <link rel="stylesheet" crossorigin href="/assets/vendor.Bbo-_dVE.css">
    <link rel="stylesheet" crossorigin href="/assets/index.DE2yzZ9A.css">
  <link rel="manifest" href="/manifest.webmanifest"><script id="vite-plugin-pwa:register-sw" src="/registerSW.js"></script></head>
  <body>
    <div id="app"></div>
  </body>
</html>
------