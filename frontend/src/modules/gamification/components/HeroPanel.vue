<template>
  <section class="hero-panel-aura" v-if="currentLevel">
    <div class="divine-energy-waves"></div>
    <div class="spirit-particles-bg"></div>

    <div class="hero-identity-layer">
      <div class="avatar-shrine" :class="frameEffectClass">
        <span class="aura-ring outer"></span>
        <span class="aura-ring inner"></span>

        <img :src="avatarUrl" alt="avatar" class="hero-avatar item-img" />
        <img
          v-if="equippedFrame?.image_url"
          :src="equippedFrame.image_url"
          :alt="equippedFrame.name || 'frame'"
          class="hero-frame equipped-frame"
        />
      </div>

      <div class="hero-chronicle">
        <div class="title-inscription">
          <span class="inscription-bg"></span>
          <p class="hero-kicker">TIÊN ĐỒ LỊCH LUYỆN</p>
        </div>
        
        <h1 class="hero-name-plate">
          <span class="name-text">{{ userName }}</span>
          <span class="name-glow"></span>
        </h1>

        <div 
          class="realm-badge-container" 
          :style="{ '--dynamic-realm-color': equippedBadge?.color || '#34d399' }"
        >
          <div class="realm-badge dynamic-realm-glow">
            <UserBadge v-if="equippedBadge" :badge="equippedBadge" size="md" class="magic-badge-glow" />
            <i v-else class="fas fa-yin-yang aura-spin"></i>
            <span class="realm-name">{{ currentLevel.name }}</span>
          </div>
          
          <button
            v-if="currentLevel.next_level_points && (userPoints?.total_exp || 0) >= currentLevel.next_level_points"
            class="breakthrough-btn-divine"
            :disabled="processingUpgrade"
            @click="$emit('upgrade')"
          >
            <div class="btn-inner">
              <i v-if="processingUpgrade" class="fas fa-circle-notch fa-spin"></i>
              <span v-else>ĐỘT PHÁ</span>
            </div>
            <div class="btn-glow"></div>
          </button>
        </div>

        <div class="spirit-progress-area">
          <div class="progress-track-crystalline">
            <div class="progress-fill-spiritual" :style="{ width: levelProgress + '%' }">
              <div class="fill-spark"></div>
            </div>
          </div>
          <div class="progress-stats-plate">
            <span class="exp-value">{{ (userPoints?.total_exp || 0).toLocaleString() }}</span>
            <span class="exp-divider">/</span>
            <span class="exp-target">{{ currentLevel.next_level_points ? currentLevel.next_level_points.toLocaleString() : 'Đỉnh Phong' }} EXP</span>
          </div>
        </div>
      </div>
    </div>

    <div class="essential-stats-grid">
      <article class="essence-box tu-vi">
        <div class="box-inner">
          <div class="stat-icon"><i class="fas fa-fire-flame-curved"></i></div>
          <div class="stat-content">
            <label>Tu Vi</label>
            <strong>{{ (userPoints?.total_exp || 0).toLocaleString() }}</strong>
          </div>
        </div>
      </article>

      <article class="essence-box linh-thach">
         <div class="box-inner">
          <div class="stat-icon"><i class="fas fa-gem"></i></div>
          <div class="stat-content">
            <label>Linh Thạch</label>
            <strong>{{ (userCurrency || 0).toLocaleString() }}</strong>
          </div>
        </div>
      </article>

      <article class="essence-box tho-nguyen">
         <div class="box-inner">
          <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
          <div class="stat-content">
            <label>Thọ Nguyên</label>
            <strong>{{ remainingLifespan || 'Vô Hạn' }}</strong>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import UserBadge from './UserBadge.vue';

const props = defineProps({
  currentLevel: Object,
  userPoints: Object,
  userCurrency: Number,
  remainingLifespan: String,
  levelProgress: Number,
  processingUpgrade: Boolean,
  userName: String,
  avatarUrl: String,
  equippedFrame: Object,
  equippedBadge: Object,
});

defineEmits(['upgrade']);

const DEFAULT_FRAME_EFFECT = 'frame-default-aura';
const SUPPORTED_FRAME_EFFECTS = [
  'frame-phoenix-fire',
  'frame-bang-tinh',
  'frame-thien-thanh',
  'frame-nine-tails-purple',
  'frame-chan-long',
  'frame-van-kiem',
  'frame-ma-ton',
  'frame-bang-long',
  'frame-thien-co',
  'frame-that-sac',
  'frame-thien-nhien',
  'frame-thanh-loan',
];

const frameEffectClass = computed(() => {
  const rawClass = (props.equippedFrame?.css_class || '').trim();
  if (!rawClass) return DEFAULT_FRAME_EFFECT;

  const matchedClass = rawClass
    .split(/\s+/)
    .find((cssClass) => SUPPORTED_FRAME_EFFECTS.includes(cssClass));

  return matchedClass || DEFAULT_FRAME_EFFECT;
});
</script>

<style scoped>
/* ===== MAIN PANEL ===== */
.hero-panel-aura {
  position: relative;
  width: min(1120px, 100%);
  margin-inline: auto;
  border-radius: 32px;
  border: 1px solid rgba(56, 189, 248, 0.15); 
  padding: 2.5rem;
  background: linear-gradient(165deg, rgba(15, 23, 42, 0.9) 0%, rgba(3, 7, 18, 0.95) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 
    0 30px 60px -20px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 10;
}

/* Decorative background */
.divine-energy-waves {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 80%;
  height: 200%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 60%);
  transform: rotate(-15deg);
  pointer-events: none;
  z-index: 0;
}

.spirit-particles-bg {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.05) 1.5px, transparent 1.5px),
    radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.04) 1px, transparent 1px);
  background-size: 100px 100px, 150px 150px, 200px 200px;
  opacity: 0.6;
  pointer-events: none;
  animation: slowPan 30s linear infinite alternate;
}

@keyframes slowPan {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(10px, 10px); }
}

/* ===== IDENTITY LAYER ===== */
.hero-identity-layer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3.5rem;
  margin-bottom: 3.5rem;
}

/* Avatar Shrine Design */
.avatar-shrine {
  position: relative;
  width: 150px; 
  height: 150px;
  flex-shrink: 0;
  --aura-primary: 56, 189, 248; 
  --frame-scale: 1.45;
}

.avatar-shrine::after {
  content: '';
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--aura-primary), 0.2), transparent 70%);
  filter: blur(15px);
  z-index: 0;
  animation: auraPulse 4s ease-in-out infinite;
}

.hero-avatar {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(var(--aura-primary), 0.8);
  padding: 4px;
  background: #050a14;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(var(--aura-primary), 0.5);
  transform: scale(0.85);
}

.hero-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(var(--frame-scale));
  z-index: 3;
  pointer-events: none;
}

.aura-ring.inner {
  position: absolute;
  inset: -6px;
  border: 1px solid rgba(var(--aura-primary), 0.3);
  border-radius: 50%;
  z-index: 1;
}

/* Identity Content */
.hero-chronicle { flex: 1; display: flex; flex-direction: column; }

.title-inscription { position: relative; margin-bottom: 0.5rem; display: inline-flex; }

.hero-kicker {
  margin: 0; font-size: 1.1rem; font-weight: 900; letter-spacing: 0.3em;
  background: linear-gradient(90deg, #38bdf8 0%, #a7f3d0 25%, #fff 50%, #a7f3d0 75%, #38bdf8 100%);
  background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  animation: shine 4s linear infinite; text-shadow: 0 0 15px rgba(56, 189, 248, 0.3); text-transform: uppercase; position: relative; z-index: 1;
}

.hero-name-plate {
  margin: 0.2rem 0; font-size: 3rem; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; line-height: 1.1;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.2); position: relative;
}

/* ===== TÍCH HỢP MÀU DYNAMIC TỪ BADGE ===== */
.realm-badge-container { 
  display: flex; align-items: center; gap: 1.5rem; margin-top: 1rem; margin-bottom: 1.8rem; 
}

/* Biến CSS `--dynamic-realm-color` được truyền từ style của thẻ cha */
.dynamic-realm-glow {
  /* Dùng màu động cho nền gradient (opacity 15% -> 5%) */
  background: linear-gradient(135deg, color-mix(in srgb, var(--dynamic-realm-color) 15%, transparent), color-mix(in srgb, var(--dynamic-realm-color) 5%, transparent));
  /* Dùng màu động cho viền */
  border: 1px solid color-mix(in srgb, var(--dynamic-realm-color) 40%, transparent);
  /* Dùng màu động cho bóng đổ */
  box-shadow: 0 0 15px color-mix(in srgb, var(--dynamic-realm-color) 20%, transparent);
}

.realm-badge {
  padding: 0.6rem 1.5rem; border-radius: 100px;
  display: flex; align-items: center; gap: 0.8rem; backdrop-filter: blur(5px);
  transition: all 0.4s ease;
}

.realm-name { 
  font-size: 1.2rem; font-weight: 900; 
  /* Chữ của Cảnh Giới lấy màu của Badge luôn */
  color: var(--dynamic-realm-color); 
  text-transform: uppercase; letter-spacing: 0.08em; 
  text-shadow: 0 0 10px color-mix(in srgb, var(--dynamic-realm-color) 50%, transparent); 
}

.aura-spin { font-size: 1.2rem; color: var(--dynamic-realm-color); animation: spin 6s linear infinite; }

.magic-badge-glow {
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 10px var(--badge-color, rgba(52, 211, 153, 0.5)));
}

@keyframes badge-pulse {
  from { filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 8px var(--badge-color, rgba(52, 211, 153, 0.3))); }
  to { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 15px var(--badge-color, rgba(52, 211, 153, 0.8))); transform: scale(1.05); }
}

/* Breakthrough Button */
.breakthrough-btn-divine { position: relative; border: none; background: transparent; padding: 0; cursor: pointer; }

.btn-inner {
  background: linear-gradient(135deg, #fbbf24 0%, #ea580c 100%); padding: 0.8rem 2rem; border-radius: 50px;
  color: #fff; font-weight: 900; font-size: 0.9rem; letter-spacing: 0.1em; position: relative; z-index: 2;
  box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4), inset 0 2px 0 rgba(255,255,255,0.2); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex; align-items: center; gap: 0.6rem;
}

.btn-glow {
  position: absolute; inset: -4px; border-radius: 54px; background: linear-gradient(135deg, #fbbf24, #ea580c);
  filter: blur(10px); opacity: 0.5; z-index: 1; animation: pulseGlow 2s infinite;
}

.breakthrough-btn-divine:hover .btn-inner { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(234, 88, 12, 0.6), inset 0 2px 0 rgba(255,255,255,0.4); }
.breakthrough-btn-divine:active .btn-inner { transform: translateY(0); }

/* Progress Area */
.spirit-progress-area { margin-top: 0.5rem; }

.progress-track-crystalline {
  height: 10px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; overflow: hidden; position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
}

.progress-fill-spiritual {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9, #34d399, #0ea5e9); 
  background-size: 200% 100%; animation: energyFlow 3s linear infinite; position: relative;
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1); 
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);
}

.fill-spark {
  position: absolute; right: 0; top: 0; width: 30px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9));
  filter: blur(2px); opacity: 0.9;
}

.progress-stats-plate {
  margin-top: 0.8rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; font-weight: 800; color: #94a3b8;
}

.exp-value { color: #34d399; text-shadow: 0 0 8px rgba(52, 211, 153, 0.4); }
.exp-divider { opacity: 0.4; }

/* ===== 3 THẺ CHỈ SỐ ===== */
.essential-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; z-index: 2; position: relative; }

.essence-box {
  position: relative; background: linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
  border-radius: 24px; padding: 1.5rem; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); overflow: hidden; cursor: default;
}

.essence-box::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transform: skewX(-25deg); transition: 0.5s;
}

.essence-box:hover { transform: translateY(-8px); background: linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 1) 100%); }
.essence-box:hover::before { left: 200%; transition: 0.8s ease-in-out; }

.box-inner { display: flex; align-items: center; gap: 1.5rem; position: relative; z-index: 2;}

.stat-icon {
  width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; transition: all 0.4s; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-content { display: flex; flex-direction: column; }
.stat-content label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; font-weight: 800; margin-bottom: 0.3rem; }
.stat-content strong { font-size: 1.6rem; font-weight: 900; line-height: 1.2; }

.tu-vi { border: 1px solid rgba(239, 68, 68, 0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.tu-vi .stat-icon { color: #fca5a5; }
.tu-vi .stat-content strong { color: #f8fafc; }
.tu-vi:hover { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 15px 35px rgba(239, 68, 68, 0.15); }
.tu-vi:hover .stat-icon { color: #ef4444; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); transform: scale(1.1) rotate(-5deg); text-shadow: 0 0 15px rgba(239, 68, 68, 0.8); }
.tu-vi:hover .stat-content strong { color: #fca5a5; text-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }

.linh-thach { border: 1px solid rgba(245, 158, 11, 0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.linh-thach .stat-icon { color: #fcd34d; }
.linh-thach .stat-content strong { color: #fbbf24; } 
.linh-thach:hover { border-color: rgba(245, 158, 11, 0.4); box-shadow: 0 15px 35px rgba(245, 158, 11, 0.15); }
.linh-thach:hover .stat-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.3); transform: scale(1.1); text-shadow: 0 0 15px rgba(245, 158, 11, 0.8); }
.linh-thach:hover .stat-content strong { color: #fde68a; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }

.tho-nguyen { border: 1px solid rgba(14, 165, 233, 0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.tho-nguyen .stat-icon { color: #bae6fd; }
.tho-nguyen .stat-content strong { color: #f8fafc; }
.tho-nguyen:hover { border-color: rgba(14, 165, 233, 0.4); box-shadow: 0 15px 35px rgba(14, 165, 233, 0.15); }
.tho-nguyen:hover .stat-icon { color: #0ea5e9; background: rgba(14, 165, 233, 0.15); border-color: rgba(14, 165, 233, 0.3); transform: scale(1.1) rotate(5deg); text-shadow: 0 0 15px rgba(14, 165, 233, 0.8); }
.tho-nguyen:hover .stat-content strong { color: #7dd3fc; text-shadow: 0 0 10px rgba(14, 165, 233, 0.5); }


/* ===== ANIMATIONS ===== */
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes energyFlow { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
@keyframes pulseGlow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
@keyframes auraPulse { 0%, 100% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
@keyframes shine { to { background-position: 200% center; } }

/* ===== MOBILE ADAPTATION ===== */
@media (max-width: 1024px) {
  .essential-stats-grid { gap: 1rem; }
  .essence-box { padding: 1.2rem; }
  .stat-icon { width: 48px; height: 48px; font-size: 1.3rem; }
  .stat-content strong { font-size: 1.3rem; }
}

@media (max-width: 900px) {
  .hero-panel-aura { padding: 1.5rem; border-radius: 24px; }
  .hero-identity-layer { gap: 2rem; margin-bottom: 2rem; }
  .avatar-shrine { width: 120px; height: 120px; }
  .hero-name-plate { font-size: 2.2rem; }
  .realm-name { font-size: 1rem; }
}

@media (max-width: 768px) {
  .hero-identity-layer { flex-direction: column; text-align: center; gap: 1.5rem; }
  .hero-chronicle { align-items: center; }
  .realm-badge-container { flex-direction: column; gap: 1rem; }
  .progress-stats-plate { justify-content: center; }
  .essential-stats-grid { grid-template-columns: 1fr; }
  .box-inner { justify-content: center; } 
  .stat-content { align-items: center; }
}
</style>