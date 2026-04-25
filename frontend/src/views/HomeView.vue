<template>
  <div class="trang-chu-xianxia">

    <!-- ===== PARTICLES ===== -->
    <div class="particles-bg" aria-hidden="true">
      <span v-for="n in 10" :key="n" class="particle" :style="particleStyle(n)"></span>
    </div>

    <!-- ===== HERO ===== -->
    <section class="hero-gate">
      <div class="hero-bg-wrapper">
        <img
          :src="homeHeroImage"
          :srcset="homeHeroSrcSet"
          sizes="100vw"
          alt="TruyenVietHay Background"
          class="hero-bg-image"
          crossorigin="anonymous"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <div class="hero-vignette"></div>
      </div>

      <div class="container relative z-10">
        <div class="hero-content">
          <div class="logo-wrapper animate-float">
            <img src="@/assets/images/logo.png" alt="TruyenVietHay Logo" class="logo-spirit" />
            <p class="slogan-spirit">Thế giới truyện Việt trong tầm tay bạn</p>
          </div>

          <h1 class="tieu-de-chinh">
            Đọc Truyện Miễn Phí, Nhanh Và Mượt Mà<br/>
            <span class="text-highlight">Cộng Đồng Tác Giả Tài Năng, Cùng Nhau Sáng Tạo</span>
          </h1>

          <div class="nut-dieu-huong">
            <router-link
              to="/truyen-chu"
              class="btn-hero-card emerald"
              @mouseenter="warmStoryList"
              @focusin="warmStoryList"
              @touchstart.passive="warmStoryList"
            >
              <div class="btn-hero-icon"><i class="fas fa-book-open"></i></div>
              <div class="btn-hero-text">
                <span class="btn-hero-main">Truyện Chữ</span>
                <span class="btn-hero-sub">50.000+ tựa truyện</span>
              </div>
            </router-link>
            <router-link
              to="/truyen-audio"
              class="btn-hero-card azure"
              @mouseenter="warmAudioList"
              @focusin="warmAudioList"
              @touchstart.passive="warmAudioList"
            >
              <div class="btn-hero-icon"><i class="fas fa-headphones"></i></div>
              <div class="btn-hero-text">
                <span class="btn-hero-main">Truyện Audio</span>
                <span class="btn-hero-sub">5.000+ bản audio</span>
              </div>
            </router-link>
          </div>

          <!-- scroll hint -->
          <div class="scroll-hint" aria-hidden="true">
            <span class="scroll-dot"></span>
          </div>
        </div>
      </div>
    </section>

    <!-- bridge 1: hero → audio -->
    <div class="section-bridge bridge-emerald-to-azure" aria-hidden="true">
      <div class="bridge-glow"></div>
      <div class="bridge-line"></div>
    </div>

    <!-- ===== AUDIO INTRO ===== -->
    <section class="audio-intro-sect reveal-section" ref="audioSectRef">
      <div class="container">
        <div class="audio-intro-inner">

          <!-- Left: visual -->
          <div class="audio-visual" ref="audioVisualRef">
            <div class="audio-circle-glow"></div>
            <div class="audio-icon-ring">
              <i class="fas fa-headphones audio-icon-big"></i>
            </div>
            <!-- sound wave bars -->
            <div class="sound-wave" aria-hidden="true">
              <span v-for="b in 8" :key="b" class="bar" :style="`--i:${b}`"></span>
            </div>
          </div>

          <!-- Right: text -->
          <div class="audio-text">
            <span class="audio-badge-label">
              <i class="fas fa-volume-up"></i> Tính năng mới
            </span>
            <h2 class="audio-title">Truyện Audio —<br/><span class="audio-title-grad">Nghe Hay, Sống Động</span></h2>
            <p class="audio-desc">
              Thưởng thức kho truyện Việt yêu thích qua giọng đọc truyền cảm, sắc nét. Dù đang lái xe, tập thể dục hay thư giãn — <strong>TruyenVietHay Audio</strong> luôn ở bên bạn mọi lúc, mọi nơi.
            </p>

            <ul class="audio-features-list">
              <li>
                <span class="af-icon"><i class="fas fa-microphone-alt"></i></span>
                <div>
                  <strong>Giọng Đọc Chuyên Nghiệp</strong>
                  <p>Giọng đọc AI được tuyển chọn kỹ càng, từng chương rõ ràng và cuốn hút.</p>
                </div>
              </li>
              <li>
                <span class="af-icon"><i class="fas fa-layer-group"></i></span>
                <div>
                  <strong>Đa Dạng Thể Loại</strong>
                  <p>Từ tiên hiệp, kiếm hiệp, ngôn tình đến trinh thám — đáp ứng mọi sở thích.</p>
                </div>
              </li>
              <li>
                <span class="af-icon"><i class="fas fa-mobile-screen"></i></span>
                <div>
                  <strong>Nghe Mọi Thiết Bị</strong>
                  <p>Phát trực tuyến mượt mà trên điện thoại, máy tính bảng hay trình duyệt.</p>
                </div>
              </li>
              <li>
                <span class="af-icon"><i class="fas fa-sync-alt"></i></span>
                <div>
                  <strong>Đồng Bộ Tiến Độ</strong>
                  <p>Dừng ở bất cứ đâu, tiếp tục đúng vị trí trên mọi thiết bị của bạn.</p>
                </div>
              </li>
            </ul>

            <router-link to="/truyen-audio" class="btn-audio-cta">
              <i class="fas fa-play-circle"></i> Khám phá ngay
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- bridge 2: audio → giới thiệu -->
    <div class="section-bridge bridge-azure-to-purple" aria-hidden="true">
      <div class="bridge-glow"></div>
      <div class="bridge-line"></div>
    </div>

    <!-- ===== GIỚI THIỆU ===== -->
    <section class="gioi-thieu-sect reveal-section" ref="introSectRef">
      <div class="container">
        <div class="section-header-spirit">
          <h2 class="tieu-de-phu">GIỚI THIỆU VỀ TRUYỆN VIỆT HAY</h2>
          <p class="noi-dung-lead">
            Nền tảng đọc truyện online miễn phí mới 2026. Nơi kết nối tâm hồn yêu văn chương của hàng triệu độc giả, mang đến không gian đọc truyện chất lượng cao đậm chất Việt.
          </p>
        </div>

        <div class="stats-grid-aura" ref="statsGridRef">
          <div class="stat-card reveal-item">
            <i class="fas fa-book-journal-whills stat-icon emerald"></i>
            <span class="con-so" ref="stat0Ref">50.000+</span>
            <span class="mo-ta">Tựa truyện</span>
          </div>
          <div class="stat-card reveal-item">
            <i class="fas fa-headphones stat-icon azure"></i>
            <span class="con-so" ref="stat1Ref">5.000+</span>
            <span class="mo-ta">Truyện Audio</span>
          </div>
          <div class="stat-card reveal-item">
            <i class="fas fa-users stat-icon purple"></i>
            <span class="con-so" ref="stat2Ref">2.000.000+</span>
            <span class="mo-ta">Độc giả</span>
          </div>
          <div class="stat-card reveal-item">
            <i class="fas fa-feather-pointed stat-icon gold"></i>
            <span class="con-so" ref="stat3Ref">5.000+</span>
            <span class="mo-ta">Tác giả</span>
          </div>
        </div>

        <h3 class="tieu-de-nho">Điểm Khác Biệt Làm Nên Cảnh Giới</h3>

        <div class="features-grid-spirit">
          <div class="feature-card reveal-item">
            <div class="feature-icon"><i class="fas fa-layer-group"></i></div>
            <h4 class="feature-title">Kho Truyện Đồ Sộ</h4>
            <p class="feature-desc">Hơn 50.000+ tựa truyện đa thể loại: Tiên hiệp, kiếm hiệp, ngôn tình, khoa học viễn tưởng và văn học đương đại Việt.</p>
          </div>

          <div class="feature-card feature-card--audio reveal-item">
            <div class="feature-icon audio"><i class="fas fa-headphones"></i></div>
            <h4 class="feature-title">Truyện Audio Sống Động</h4>
            <p class="feature-desc">5.000+ truyện có bản audio giọng đọc chuyên nghiệp. Thưởng thức văn học bằng tai, trải nghiệm hoàn toàn mới lạ.</p>
          </div>

          <div class="feature-card reveal-item">
            <div class="feature-icon"><i class="fas fa-bolt"></i></div>
            <h4 class="feature-title">Cập Nhật Thần Tốc</h4>
            <p class="feature-desc">100+ chương truyện mới mỗi ngày. Đội ngũ biên tập viên chuyên nghiệp đảm bảo nội dung chuẩn mực, sắc nét.</p>
          </div>

          <div class="feature-card reveal-item">
            <div class="feature-icon"><i class="fas fa-handshake"></i></div>
            <h4 class="feature-title">Cộng Đồng Sáng Tạo</h4>
            <p class="feature-desc">Kết nối với 5.000+ tác giả tài năng. Tương tác trực tiếp, đóng góp ý tưởng và tham gia các cuộc thi sáng tác.</p>
          </div>

          <div class="feature-card reveal-item">
            <div class="feature-icon"><i class="fas fa-mobile-screen"></i></div>
            <h4 class="feature-title">Trải Nghiệm Đỉnh Cao</h4>
            <p class="feature-desc">Giao diện tối ưu mọi thiết bị. Chế độ đọc ban đêm, lưu trang tự động, tùy chỉnh font chữ bảo vệ mắt.</p>
          </div>

          <div class="feature-card reveal-item">
            <div class="feature-icon"><i class="fas fa-brain"></i></div>
            <h4 class="feature-title">Đề Cử Thông Minh</h4>
            <p class="feature-desc">Công nghệ AI phân tích sở thích để gợi ý truyện phù hợp. Đồng bộ bộ sưu tập cá nhân trên mọi thiết bị.</p>
          </div>
        </div>

        <div class="ket-thuc-box">
          <p class="ket-thuc-text">
            <strong>TruyenVietHay</strong> không chỉ là nơi đọc truyện, mà còn là ngôi nhà chung của những người yêu văn chương. Hãy gia nhập cùng chúng tôi để trải nghiệm những trang sách <strong>đậm chất Việt</strong> nhất — kể cả khi bạn chỉ muốn <strong>lắng nghe</strong>.
          </p>
        </div>

        <div class="copyright-spirit">
          © 2026 TruyenVietHay. Bản quyền thuộc về TruyenVietHay Team.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useHead } from "@unhead/vue";
import { buildCloudinaryImageUrl, buildCloudinarySrcSet } from "@/config/constants";
import { prefetchAudioListExperience, prefetchStoryListExperience } from "@/router/prefetch";
import { defaultOgImage, toCanonicalUrl } from "@/seo/site";

// ── Hero banner ──────────────────────────────────────────────────────────
const HOME_HERO_BANNER =
  "https://res.cloudinary.com/dg9ftuhv4/image/upload/v1772805144/truyenviethay/banners/banner-desktop.jpg";
const homeHeroImage = buildCloudinaryImageUrl(HOME_HERO_BANNER, {
  width: 960,
  quality: "auto:eco",
  dprAuto: true,
});
const homeHeroSrcSet = buildCloudinarySrcSet(
  HOME_HERO_BANNER,
  [480, 768, 960, 1280, 1600],
  { quality: "auto:eco", dprAuto: true },
);

// ── SEO ──────────────────────────────────────────────────────────────────
const homeCanonicalUrl = toCanonicalUrl("/");
const homeTitle = "Đọc Truyện Chữ & Nghe Truyện Audio Miễn Phí | TruyenVietHay";
const homeDescription =
  "Kho truyện chữ và truyện audio tiếng Việt cập nhật liên tục. Đọc online mượt, nghe truyện mọi lúc tại TruyenVietHay.";
const homeOgImage = computed(() => homeHeroImage || defaultOgImage);

useHead(() => ({
  title: homeTitle,
  link: [{ rel: "canonical", href: homeCanonicalUrl }],
  meta: [
    { name: "description", content: homeDescription },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: homeTitle },
    { property: "og:description", content: homeDescription },
    { property: "og:url", content: homeCanonicalUrl },
    { property: "og:image", content: homeOgImage.value },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: homeTitle },
    { name: "twitter:description", content: homeDescription },
    { name: "twitter:image", content: homeOgImage.value },
  ],
}));

// ── Deterministic particle styles (SSR-safe) ─────────────────────────────
function particleStyle(n) {
  const size  = 4 + (n % 5) * 3;
  const left  = (n * 37 + 11) % 97;
  const top   = (n * 53 + 7)  % 90;
  const dur   = 8 + (n % 6) * 2;
  const delay = (n % 5) * 1.2;
  return `width:${size}px;height:${size}px;left:${left}%;top:${top}%;animation-duration:${dur}s;animation-delay:-${delay}s`;
}

// ── Prefetch on hover ────────────────────────────────────────────────────
function warmStoryList() { prefetchStoryListExperience(); }
function warmAudioList()  { prefetchAudioListExperience(); }

// ── Refs ─────────────────────────────────────────────────────────────────
const audioSectRef   = ref(null);
const audioVisualRef = ref(null);
const introSectRef   = ref(null);
const statsGridRef   = ref(null);
const stat0Ref = ref(null);
const stat1Ref = ref(null);
const stat2Ref = ref(null);
const stat3Ref = ref(null);

// ── Counter animation ────────────────────────────────────────────────────
const STATS = [
  { ref: stat0Ref, target: 50000,   suffix: '+', locale: true },
  { ref: stat1Ref, target: 5000,    suffix: '+', locale: true },
  { ref: stat2Ref, target: 2000000, suffix: '+', locale: true },
  { ref: stat3Ref, target: 5000,    suffix: '+', locale: true },
];

function formatNumber(n) {
  return n.toLocaleString('vi-VN');
}

let statsAnimated = false;
function animateStats() {
  if (statsAnimated) return;
  statsAnimated = true;

  // Respect prefers-reduced-motion
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return; // already showing final values in HTML

  STATS.forEach(({ ref: elRef, target, suffix }) => {
    const el = elRef.value;
    if (!el) return;
    const duration = 1600; // ms
    const startTime = performance.now();
    const startVal = 0;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = formatNumber(current) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ── IntersectionObserver helpers ─────────────────────────────────────────
const observers = [];

function observeReveal(el, options = {}) {
  if (!el) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // one-shot
      }
    });
  }, { threshold: 0.12, ...options });
  obs.observe(el);
  observers.push(obs);
}

/** Observe all .reveal-item children of a container */
function observeRevealItems(containerEl, staggerMs = 80) {
  if (!containerEl) return;
  const items = containerEl.querySelectorAll('.reveal-item');
  items.forEach((item, i) => {
    item.style.transitionDelay = `${i * staggerMs}ms`;
    observeReveal(item, { threshold: 0.08 });
  });
}

/** Observe audio visual — pause/resume its animations */
function observeAudioVisual(el) {
  if (!el) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        el.classList.add('is-animating');
      } else {
        el.classList.remove('is-animating');
      }
    });
  }, { threshold: 0.1 });
  obs.observe(el);
  observers.push(obs);
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  // Reveal sections
  observeReveal(audioSectRef.value);
  observeReveal(introSectRef.value);

  // Reveal staggered items inside sections
  observeRevealItems(audioSectRef.value);
  observeRevealItems(statsGridRef.value, 90);
  observeRevealItems(introSectRef.value?.querySelector('.features-grid-spirit'), 70);

  // Counter on stats
  if (statsGridRef.value) {
    const statsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateStats();
        statsObs.disconnect();
      }
    }, { threshold: 0.2 });
    statsObs.observe(statsGridRef.value);
    observers.push(statsObs);
  }

  // Pause audio animations when not visible
  observeAudioVisual(audioVisualRef.value);

  // Idle prefetch for category page
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('@/router/prefetch').then(({ prefetchCategoryExperience }) => {
        prefetchCategoryExperience?.();
      }).catch(() => {});
    }, { timeout: 3000 });
  }
});

onBeforeUnmount(() => {
  observers.forEach((obs) => obs.disconnect());
});
</script>

<style scoped>
/* =====================
   BASE
   ===================== */
.trang-chu-xianxia {
  font-family: "Be Vietnam Pro", sans-serif;
  /* Unified flowing gradient background across all 3 sections */
  background: linear-gradient(
    180deg,
    #0d1420 0%,
    #0d1825 18%,
    #0c1a2e 35%,
    #0e1728 52%,
    #0f152a 68%,
    #0d1420 100%
  );
  color: #cbd5e1;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* =====================
   PARTICLES
   ===================== */
.particles-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(91,196,232,0.42) 0%, rgba(91,196,232,0) 70%);
  animation: particleDrift linear infinite;
  opacity: 0;
}
@keyframes particleDrift {
  0%   { opacity: 0;   transform: translateY(30px) scale(0.6); }
  20%  { opacity: 0.7; }
  80%  { opacity: 0.5; }
  100% { opacity: 0;   transform: translateY(-120px) scale(1.1); }
}

/* =====================
   HERO
   ===================== */
.hero-gate {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  background-color: #0d1420;
}

.hero-bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  opacity: 0.72;
  transform: scale(1.02);
}

.hero-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(91, 196, 232, 0.07) 0%,
    rgba(13, 20, 32, 0.6) 50%,
    #0d1420 100%
  );
}

@keyframes spiritMove {
  from { transform: scale(1.02) translate(0, 0); }
  to   { transform: scale(1.1)  translate(-1%, -2%); }
}

.hero-content {
  position: relative;
  z-index: 10;
  padding: 60px 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-wrapper { margin-bottom: 30px; }

.logo-spirit {
  width: 280px;
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 0 14px rgba(91, 196, 232, 0.22));
  transition: transform 0.4s ease, filter 0.4s ease;
}
.logo-spirit:hover {
  transform: scale(1.04);
  filter: drop-shadow(0 0 22px rgba(91, 196, 232, 0.38));
}

.slogan-spirit {
  font-size: 1.15rem;
  color: #94a3b8;
  margin-top: 14px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  font-weight: 700;
}

.tieu-de-chinh {
  font-size: 2.3rem;
  font-weight: 800;
  max-width: 900px;
  margin: 0 auto 40px;
  color: #f8fafc;
  line-height: 1.5;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 0.9s ease both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.text-highlight {
  background: linear-gradient(90deg, #34d399, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  background-position: 20% center;
}
@keyframes shimmerGrad {
  0%   { background-position: 0% center; }
  100% { background-position: 200% center; }
}

/* ---- Hero Buttons (card style) ---- */
.nut-dieu-huong {
  display: flex;
  gap: 18px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 1.1s ease 0.2s both;
}

.btn-hero-card {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 16px 28px;
  border-radius: 20px;
  text-decoration: none;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  position: relative;
  overflow: hidden;
  min-width: 210px;
}

.btn-hero-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.04);
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: inherit;
}
.btn-hero-card:hover::before { opacity: 1; }

/* Icon bubble inside card */
.btn-hero-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}
.btn-hero-card:hover .btn-hero-icon { transform: scale(1.12) rotate(-4deg); }

.btn-hero-text {
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 2px;
}
.btn-hero-main {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.btn-hero-sub {
  font-size: 0.78rem;
  font-weight: 500;
  opacity: 0.75;
  letter-spacing: 0.3px;
}

/* Emerald variant */
.btn-hero-card.emerald {
  background: linear-gradient(135deg, rgba(16,185,129,0.18), rgba(52,211,153,0.1));
  border: 1.5px solid rgba(52,211,153,0.45);
  color: #d1fae5;
  box-shadow: 0 6px 24px rgba(16,185,129,0.18);
}
.btn-hero-card.emerald .btn-hero-icon {
  background: rgba(52,211,153,0.2);
  color: #34d399;
  box-shadow: 0 0 14px rgba(52,211,153,0.25);
}
.btn-hero-card.emerald .btn-hero-main { color: #6ee7b7; }
.btn-hero-card.emerald:hover {
  transform: translateY(-2px);
  border-color: rgba(52,211,153,0.7);
  box-shadow: 0 10px 24px rgba(16,185,129,0.22);
}

/* Azure variant */
.btn-hero-card.azure {
  background: linear-gradient(135deg, rgba(91,196,232,0.12), rgba(167,139,250,0.08));
  border: 1.5px solid rgba(91,196,232,0.35);
  color: #e0f4ff;
  box-shadow: 0 6px 24px rgba(91,196,232,0.14);
}
.btn-hero-card.azure .btn-hero-icon {
  background: rgba(91,196,232,0.18);
  color: #5bc4e8;
  box-shadow: 0 0 14px rgba(91,196,232,0.2);
}
.btn-hero-card.azure .btn-hero-main { color: #93c5fd; }
.btn-hero-card.azure:hover {
  transform: translateY(-2px);
  border-color: rgba(91,196,232,0.6);
  box-shadow: 0 10px 24px rgba(91,196,232,0.2);
}

/* Scroll hint */
.scroll-hint {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.scroll-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(91,196,232,0.6);
  animation: scrollBounce 1.8s ease-in-out infinite;
}
@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50%       { transform: translateY(12px); opacity: 1; }
}

/* =====================
   SECTION BRIDGES
   ===================== */
.section-bridge {
  position: relative;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  z-index: 2;
}

.bridge-glow {
  position: absolute;
  width: 320px;
  height: 2px;
  border-radius: 2px;
  filter: blur(8px);
  opacity: 0.55;
}
.bridge-line {
  position: absolute;
  width: 160px;
  height: 1px;
  border-radius: 1px;
  opacity: 0.4;
}

.bridge-emerald-to-azure .bridge-glow {
  background: linear-gradient(90deg, #34d399, #5bc4e8);
}
.bridge-emerald-to-azure .bridge-line {
  background: linear-gradient(90deg, #34d399, #5bc4e8);
  opacity: 0.6;
}

.bridge-azure-to-purple .bridge-glow {
  background: linear-gradient(90deg, #5bc4e8, #a78bfa);
}
.bridge-azure-to-purple .bridge-line {
  background: linear-gradient(90deg, #5bc4e8, #a78bfa);
  opacity: 0.6;
}

/* Also add faint top/bottom soft glow on bridges */
.section-bridge::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 80px;
  border-radius: 50%;
  pointer-events: none;
}
.bridge-emerald-to-azure::before {
  background: radial-gradient(ellipse at center, rgba(52,211,153,0.06) 0%, transparent 70%);
}
.bridge-azure-to-purple::before {
  background: radial-gradient(ellipse at center, rgba(91,196,232,0.07) 0%, transparent 70%);
}

/* =====================
   AUDIO INTRO
   ===================== */
.audio-intro-sect {
  padding: 80px 0 90px;
  position: relative;
  z-index: 1;
  background: transparent;
}

.audio-intro-inner {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 70px;
  align-items: center;
}

/* ---- Visual side ---- */
.audio-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  position: relative;
}

.audio-circle-glow {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(91,196,232,0.18) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
  pointer-events: none;
}
@keyframes glowPulse {
  0%, 100% { transform: scale(1);   opacity: 0.7; }
  50%       { transform: scale(1.15); opacity: 1; }
}

.audio-icon-ring {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(13,20,32,0.9);
  border: 2px solid rgba(91,196,232,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 30px rgba(91,196,232,0.12), inset 0 0 22px rgba(91,196,232,0.05);
}
@keyframes rotate-ring {
  0%   { box-shadow: 0 0 40px rgba(91,196,232,0.15), inset 0 0 30px rgba(91,196,232,0.06); border-color: rgba(91,196,232,0.35); }
  50%  { box-shadow: 0 0 60px rgba(167,139,250,0.22), inset 0 0 30px rgba(167,139,250,0.08); border-color: rgba(167,139,250,0.4); }
  100% { box-shadow: 0 0 40px rgba(91,196,232,0.15), inset 0 0 30px rgba(91,196,232,0.06); border-color: rgba(91,196,232,0.35); }
}

.audio-icon-big {
  font-size: 4rem;
  background: linear-gradient(135deg, #5bc4e8, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Sound wave */
.sound-wave {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 50px;
}
.bar {
  width: 6px;
  height: 44px;
  border-radius: 3px;
  background: linear-gradient(to top, #5bc4e8, #a78bfa);
  transform: scaleY(0.25);
  transform-origin: bottom;
  animation: barDance 1.2s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * 0.09s);
}
@keyframes barDance {
  0%   { transform: scaleY(0.22); opacity: 0.5; }
  100% { transform: scaleY(1); opacity: 1; }
}

/* ---- Text side ---- */
.audio-badge-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(91,196,232,0.1);
  border: 1px solid rgba(91,196,232,0.25);
  color: #74dbf3;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
  display: inline-flex;
}

.audio-title {
  font-size: 2.4rem;
  font-weight: 900;
  color: #f1f5f9;
  line-height: 1.3;
  margin-bottom: 20px;
}
.audio-title-grad {
  background: linear-gradient(90deg, #5bc4e8, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.audio-desc {
  font-size: 1.05rem;
  line-height: 1.85;
  color: #94a3b8;
  margin-bottom: 32px;
}
.audio-desc strong { color: #74dbf3; }

.audio-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.audio-features-list li {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.af-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(91,196,232,0.1);
  border: 1px solid rgba(91,196,232,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #74dbf3;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.2s;
}
.audio-features-list li:hover .af-icon {
  background: rgba(91,196,232,0.18);
  transform: scale(1.08);
}
.audio-features-list strong {
  display: block;
  color: #e2e8f0;
  font-size: 0.97rem;
  margin-bottom: 3px;
}
.audio-features-list p {
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
}

.btn-audio-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 36px;
  border-radius: 50px;
  background: linear-gradient(135deg, #5bc4e8, #a78bfa);
  color: #07111c;
  font-size: 1rem;
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 28px rgba(91,196,232,0.28);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  position: relative;
  overflow: hidden;
}
.btn-audio-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.12);
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: inherit;
}
.btn-audio-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 38px rgba(91,196,232,0.4);
}
.btn-audio-cta:hover::after { opacity: 1; }

/* =====================
   GIỚI THIỆU
   ===================== */
.gioi-thieu-sect {
  padding: 90px 0;
  position: relative;
  z-index: 1;
  background: radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.04) 0%, transparent 55%),
              radial-gradient(ellipse at 50% 100%, rgba(91,196,232,0.04) 0%, transparent 55%);
}

.section-header-spirit {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.tieu-de-phu {
  font-size: 2rem;
  font-weight: 900;
  color: #f8fafc;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.noi-dung-lead {
  font-size: 1.1rem;
  line-height: 1.85;
  color: #94a3b8;
}

/* Stats */
.stats-grid-aura {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 80px;
}

.stat-card {
  background: rgba(21, 31, 47, 0.9);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 30px 18px;
  text-align: center;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  bottom: -30px; left: 50%;
  transform: translateX(-50%);
  width: 80px; height: 80px;
  border-radius: 50%;
  background: rgba(91,196,232,0.06);
  transition: opacity 0.2s ease;
  opacity: 0;
}
.stat-card:hover { transform: translateY(-2px); border-color: rgba(91,196,232,0.22); box-shadow: 0 10px 22px rgba(0,0,0,0.24); }
.stat-card:hover::before { opacity: 1; }

.stat-icon { font-size: 2.4rem; margin-bottom: 14px; display: block; }
.stat-icon.emerald { color: #34d399; }
.stat-icon.azure   { color: #60a5fa; }
.stat-icon.purple  { color: #a78bfa; }
.stat-icon.gold    { color: #fbbf24; }

.con-so { display: block; font-size: 2.2rem; font-weight: 900; color: #f8fafc; margin-bottom: 6px; }
.mo-ta  { font-size: 0.9rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

/* Features */
.tieu-de-nho {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 44px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #34d399, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.features-grid-spirit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: 22px;
  margin-bottom: 70px;
}

.feature-card {
  background: rgba(21, 31, 47, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 30px;
  border-radius: 20px;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  position: relative;
  overflow: hidden;
}
.feature-card::after {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 100px; height: 100px;
  border-radius: 50%;
  background: rgba(91,196,232,0.06);
  opacity: 0;
  transition: opacity 0.3s;
}
.feature-card:hover {
  background: rgba(91, 196, 232, 0.05);
  border-color: rgba(91, 196, 232, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0,0,0,0.22);
}
.feature-card:hover::after { opacity: 1; }

/* Highlighted audio card */
.feature-card--audio {
  border-color: rgba(91,196,232,0.18);
  background: rgba(91,196,232,0.04);
}
.feature-card--audio:hover {
  border-color: rgba(91,196,232,0.35);
  box-shadow: 0 10px 24px rgba(91,196,232,0.1);
}

.feature-icon {
  width: 50px; height: 50px;
  border-radius: 14px;
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; margin-bottom: 20px;
  transition: transform 0.2s;
}
.feature-card:hover .feature-icon { transform: scale(1.1); }
.feature-icon.audio {
  background: rgba(91,196,232,0.12);
  color: #5bc4e8;
}

.feature-title { font-size: 1.15rem; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; }
.feature-desc  { font-size: 0.93rem; color: #94a3b8; line-height: 1.65; }

/* Kết thúc */
.ket-thuc-box {
  background: linear-gradient(135deg, rgba(91,196,232,0.07), rgba(167,139,250,0.05));
  border-left: 4px solid;
  border-image: linear-gradient(to bottom, #5bc4e8, #a78bfa) 1;
  padding: 30px 32px;
  border-radius: 0 18px 18px 0;
  max-width: 900px;
  margin: 0 auto 54px;
}
.ket-thuc-text { font-size: 1.1rem; line-height: 1.85; color: #cbd5e1; margin: 0; }
.ket-thuc-text strong { color: #74dbf3; }

.copyright-spirit {
  text-align: center; color: #475569; font-size: 0.88rem; font-weight: 600;
  padding-top: 28px; border-top: 1px dashed rgba(255,255,255,0.08);
}

@supports (content-visibility: auto) {
  .audio-intro-sect,
  .gioi-thieu-sect {
    content-visibility: auto;
    contain-intrinsic-size: auto 900px;
  }
}

/* =====================
   SCROLL REVEAL
   ===================== */
.reveal-section {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal-item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  /* transitionDelay is set dynamically via JS for stagger */
}
.reveal-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* =====================
   AUDIO VISUAL — PAUSE WHEN OFF-SCREEN
   ===================== */
.audio-visual .bar,
.audio-visual .audio-circle-glow,
.audio-visual .audio-icon-ring {
  animation-play-state: paused;
}
.audio-visual.is-animating .bar,
.audio-visual.is-animating .audio-circle-glow,
.audio-visual.is-animating .audio-icon-ring {
  animation-play-state: running;
}

/* =====================
   PARTICLES — ÍT HƠN TRÊN MOBILE
   ===================== */
@media (max-width: 768px) {
  /* Ẩn những particles có index lẻ cao (> 10) */
  .particle:nth-child(n+11) {
    display: none;
  }
}
@media (max-width: 480px) {
  .particle:nth-child(n+7) {
    display: none;
  }
}

/* =====================
   PREFERS-REDUCED-MOTION
   ===================== */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
    opacity: 0;
  }
  .animate-float {
    animation: none;
  }
  .hero-bg-image {
    animation: none;
  }
  .text-highlight {
    animation: none;
    background-position: 0% center;
  }
  .audio-visual .bar,
  .audio-visual .audio-circle-glow,
  .audio-visual .audio-icon-ring {
    animation: none;
  }
  .scroll-dot {
    animation: none;
  }
  /* Hiển thị ngay không cần reveal */
  .reveal-section,
  .reveal-item {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

/* =====================
   ANIMATIONS
   ===================== */
@keyframes float {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }
.logo-wrapper.animate-float { animation: none; }

/* =====================
   RESPONSIVE
   ===================== */
@media (max-width: 1024px) {
  .stats-grid-aura { grid-template-columns: repeat(2, 1fr); }
  .audio-intro-inner { grid-template-columns: 1fr; gap: 50px; }
  .audio-visual { flex-direction: row; gap: 24px; }
}

@media (max-width: 768px) {
  .tieu-de-chinh { font-size: 1.85rem; }
  .stats-grid-aura { grid-template-columns: repeat(2, 1fr); margin-bottom: 50px; }
  .features-grid-spirit { grid-template-columns: 1fr; }
  .audio-title { font-size: 1.9rem; }
  .audio-visual { flex-direction: column; }
}

@media (max-width: 640px) {
  .logo-spirit { width: 220px; }
  .slogan-spirit { font-size: 0.95rem; }
  .tieu-de-chinh { font-size: 1.5rem; padding: 0 10px; }
  .btn-hero-card { width: 100%; min-width: unset; }
  .nut-dieu-huong { flex-direction: column; width: 100%; padding: 0 20px; }
  .tieu-de-phu { font-size: 1.5rem; }
  .stats-grid-aura { grid-template-columns: 1fr 1fr; gap: 14px; }
  .audio-title { font-size: 1.6rem; }
  .btn-audio-cta { width: 100%; justify-content: center; }
}
</style>
