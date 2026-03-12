<template>
  <section class="hero-panel-aura" v-if="currentLevel">
    <!-- Decorative background elements -->
    <div class="divine-energy-waves"></div>
    <div class="spirit-particles-bg"></div>

    <div class="hero-identity-layer">
      <!-- Left: Avatar with Aura -->
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

      <!-- Right: Main Info -->
      <div class="hero-chronicle">
        <div class="title-inscription">
          <span class="inscription-bg"></span>
          <p class="hero-kicker">TIÊN ĐỒ LỊCH LUYỆN</p>
        </div>
        
        <h1 class="hero-name-plate">
          <span class="name-text">{{ userName }}</span>
          <span class="name-glow"></span>
        </h1>

        <div class="realm-badge-container">
          <div class="realm-badge">
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

    <!-- Bottom: Stats Row -->
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
.hero-panel-aura {
  position: relative;
  width: min(1120px, 100%);
  margin-inline: auto;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2rem;
  background: linear-gradient(165deg, #0f1c2e 0%, #050a14 100%);
  box-shadow: 
    0 25px 80px -20px rgba(0, 0, 0, 0.8),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
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
  background: radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, transparent 70%);
  transform: rotate(-15deg);
  pointer-events: none;
  z-index: 0;
}

.spirit-particles-bg {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.02) 1.5px, transparent 1.5px),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 100px 100px, 150px 150px, 200px 200px;
  opacity: 0.5;
  pointer-events: none;
}

.hero-identity-layer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3rem;
  margin-bottom: 2.5rem;
}

/* Avatar Shrine Design */
.avatar-shrine {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  --aura-primary: 52, 211, 153;
  --frame-scale: 1.45;
}

.avatar-shrine::after {
  content: '';
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--aura-primary), 0.15), transparent 70%);
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
  border: 4px solid rgba(var(--aura-primary), 0.9);
  padding: 3px;
  background: #050a14;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
.hero-chronicle {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title-inscription {
  position: relative;
  margin-bottom: 0.5rem;
  display: inline-flex;
}

.hero-kicker {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  background: linear-gradient(
    90deg, 
    #34d399 0%, 
    #6ee7b7 25%, 
    #fff 50%, 
    #6ee7b7 75%, 
    #34d399 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 3s linear infinite;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.4);
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

@keyframes shine {
  to { background-position: 200% center; }
}

.hero-name-plate {
  margin: 0.2rem 0;
  font-size: 2.8rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 5px 15px rgba(0,0,0,0.4);
  position: relative;
}

.realm-badge-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.8rem;
  margin-bottom: 1.5rem;
}

.realm-badge {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  padding: 0.6rem 1.2rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  backdrop-filter: blur(5px);
}

.magic-badge-glow {
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 10px var(--badge-color, rgba(52, 211, 153, 0.5)));
  animation: badge-pulse 2s infinite ease-in-out alternate;
}

@keyframes badge-pulse {
  from { filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 8px var(--badge-color, rgba(52, 211, 153, 0.3))); }
  to { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 15px var(--badge-color, rgba(52, 211, 153, 0.8))); transform: scale(1.05); }
}

.aura-spin {
  font-size: 1.1rem;
  color: #34d399;
  animation: spin 6s linear infinite;
}

.realm-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: #d1fae5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Breakthrough Button - Premium */
.breakthrough-btn-divine {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.btn-inner {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  padding: 0.7rem 1.5rem;
  border-radius: 50px;
  color: #fff;
  font-weight: 900;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-glow {
  position: absolute;
  inset: -4px;
  border-radius: 54px;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  filter: blur(8px);
  opacity: 0.5;
  z-index: 1;
  animation: pulseGlow 2s infinite;
}

.breakthrough-btn-divine:hover .btn-inner {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(217, 119, 6, 0.6);
}

.breakthrough-btn-divine:active .btn-inner {
  transform: translateY(0);
}

/* Progress area */
.spirit-progress-area {
  margin-top: 0.5rem;
}

.progress-track-crystalline {
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-fill-spiritual {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981, #34d399);
  background-size: 200% 100%;
  animation: energyFlow 3s linear infinite;
  position: relative;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.fill-spark {
  position: absolute;
  right: 0;
  top: 0;
  width: 20px;
  height: 100%;
  background: white;
  filter: blur(5px);
  opacity: 0.8;
}

.progress-stats-plate {
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #94a3b8;
}

.exp-value { color: #34d399; }
.exp-divider { opacity: 0.3; }

/* Stats Grid Row */
.essential-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  z-index: 2;
  position: relative;
}

.essence-box {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 1.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.essence-box:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(52, 211, 153, 0.3);
  transform: translateY(-5px);
}

.box-inner {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #94a3b8;
  transition: all 0.3s;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-content label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.stat-content strong {
  font-size: 1.35rem;
  font-weight: 900;
  color: #f8fafc;
}

/* Coloring boxes */
.tu-vi:hover .stat-icon { color: #f87171; background: rgba(248, 113, 113, 0.1); }
.linh-thach:hover .stat-icon { color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
.tho-nguyen:hover .stat-icon { color: #60a5fa; background: rgba(96, 165, 250, 0.1); }

.linh-thach strong { color: #fbbf24; }

/* Animations */
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes energyFlow { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
@keyframes pulseGlow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
@keyframes auraPulse { 0%, 100% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }

/* Mobile adaptation */
@media (max-width: 900px) {
  .hero-panel-aura { padding: 1.5rem; }
  .hero-identity-layer { gap: 1.5rem; }
  .avatar-shrine { width: 110px; height: 110px; }
  .hero-name-plate { font-size: 2.2rem; }
  .essential-stats-grid { gap: 1rem; }
  .essence-box { padding: 1rem; }
}

@media (max-width: 768px) {
  .hero-identity-layer { flex-direction: column; text-align: center; }
  .hero-chronicle { align-items: center; }
  .essential-stats-grid { grid-template-columns: 1fr; }
  .box-inner { justify-content: flex-start; }
}
</style>
