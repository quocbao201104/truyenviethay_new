<template>
  <section class="cosmic-hero-array" v-if="currentLevel">
    <div class="galaxy-nebula-bg"></div>

    <div class="hero-core-layer">
      <div class="spirit-array-center" :class="frameEffectClass">
        <div class="magic-circle-spin"></div>
        <div class="magic-circle-reverse"></div>

        <img :src="avatarUrl" alt="avatar" class="hero-avatar item-img" />
        <img
          v-if="equippedFrame?.image_url"
          :src="equippedFrame.image_url"
          :alt="equippedFrame.name || 'frame'"
          class="hero-frame equipped-frame"
        />
      </div>

      <div class="hero-destiny-chronicle">
        <div class="title-inscription">
          <p class="hero-kicker">ĐỘNG THIÊN PHÚC ĐỊA</p>
        </div>
        
        <h1 class="hero-name-plate">
          <span class="name-text">{{ userName }}</span>
        </h1>

        <div class="realm-badge-container">
          <div class="realm-badge">
            <UserBadge v-if="equippedBadge" :badge="equippedBadge" size="md" class="magic-badge-glow" />
            <i v-else class="fas fa-yin-yang aura-spin"></i>
            <span class="realm-name">{{ currentLevel.name }}</span>
          </div>
          
          <button
            v-if="currentLevel.next_level_points && (userPoints?.total_exp || 0) >= currentLevel.next_level_points"
            class="tribulation-breakthrough-btn"
            :disabled="processingUpgrade"
            @click="$emit('upgrade')"
          >
            <div class="btn-lightning-glow"></div>
            <div class="btn-inner">
              <i v-if="processingUpgrade" class="fas fa-bolt fa-fade"></i>
              <span v-else>ĐỘT PHÁ THIÊN KIẾP</span>
            </div>
          </button>
        </div>

        <div class="qi-flow-area">
          <div class="qi-track-cosmic">
            <div class="qi-fill-gold" :style="{ width: levelProgress + '%' }">
              <div class="qi-sparkles"></div>
            </div>
          </div>
          <div class="qi-stats-plate">
            <span class="exp-current">{{ (userPoints?.total_exp || 0).toLocaleString() }}</span>
            <span class="exp-divider">/</span>
            <span class="exp-target">{{ currentLevel.next_level_points ? currentLevel.next_level_points.toLocaleString() : 'Đỉnh Phong Đại Đạo' }} Tụ Khí</span>
          </div>
        </div>
      </div>
    </div>

    <div class="divine-pillars-grid">
      <article class="cosmic-pillar tu-vi">
        <div class="pillar-glow"></div>
        <div class="pillar-inner">
          <div class="stat-icon"><i class="fas fa-fire-flame-curved"></i></div>
          <div class="stat-content">
            <label>Căn Cơ Tu Vi</label>
            <strong>{{ (userPoints?.total_exp || 0).toLocaleString() }}</strong>
          </div>
        </div>
      </article>

      <article class="cosmic-pillar linh-thach">
        <div class="pillar-glow"></div>
        <div class="pillar-inner">
          <div class="stat-icon"><i class="fas fa-gem"></i></div>
          <div class="stat-content">
            <label>Linh Thạch Tàng Trữ</label>
            <strong>{{ (userCurrency || 0).toLocaleString() }}</strong>
          </div>
        </div>
      </article>

      <article class="cosmic-pillar tho-nguyen">
        <div class="pillar-glow"></div>
        <div class="pillar-inner">
          <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
          <div class="stat-content">
            <label>Thọ Nguyên Thiên Định</label>
            <strong>{{ remainingLifespan || 'Vô Hạn Thọ' }}</strong>
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
  'frame-phoenix-fire', 'frame-bang-tinh', 'frame-thien-thanh', 'frame-nine-tails-purple',
  'frame-chan-long', 'frame-van-kiem', 'frame-ma-ton', 'frame-bang-long',
  'frame-thien-co', 'frame-that-sac', 'frame-thien-nhien', 'frame-thanh-loan',
];

const frameEffectClass = computed(() => {
  const rawClass = (props.equippedFrame?.css_class || '').trim();
  if (!rawClass) return DEFAULT_FRAME_EFFECT;
  const matchedClass = rawClass.split(/\s+/).find((cssClass) => SUPPORTED_FRAME_EFFECTS.includes(cssClass));
  return matchedClass || DEFAULT_FRAME_EFFECT;
});
</script>

<style scoped>
/* ===== MAIN ARRAY (TỤ LINH TRẬN) ===== */
.cosmic-hero-array {
  position: relative;
  width: 100%;
  border-radius: 30px;
  border: 1px solid rgba(251, 191, 36, 0.3); 
  padding: 3rem;
  background: radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.08) 0%, rgba(5, 5, 16, 0.95) 80%);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9), inset 0 0 50px rgba(251, 191, 36, 0.05);
  overflow: hidden;
  z-index: 10;
}

.galaxy-nebula-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 80% 0%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 100%, rgba(239, 68, 68, 0.1) 0%, transparent 40%);
  z-index: 0; pointer-events: none;
}

/* ===== HERO CORE LAYER ===== */
.hero-core-layer {
  position: relative; z-index: 2; display: flex; align-items: center; gap: 4rem; margin-bottom: 4rem;
}

/* Avatar Tụ Linh Trận */
.spirit-array-center {
  position: relative; width: 170px; height: 170px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  --aura-gold: 251, 191, 36;
}

.magic-circle-spin, .magic-circle-reverse {
  position: absolute; inset: -15px; border-radius: 50%;
  border: 2px dashed rgba(var(--aura-gold), 0.4);
  animation: spinArray 20s linear infinite; pointer-events: none;
}
.magic-circle-reverse {
  inset: -25px; border: 1px dotted rgba(var(--aura-gold), 0.6);
  animation: spinArrayReverse 15s linear infinite;
}

.hero-avatar {
  position: relative; z-index: 2; width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  border: 4px solid rgba(var(--aura-gold), 0.8); background: #000;
  box-shadow: 0 0 30px rgba(var(--aura-gold), 0.5), inset 0 0 20px rgba(var(--aura-gold), 0.8);
  transform: scale(0.80);
}
 
.hero-frame {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
  transform: scale(1.45 ); z-index: 3; pointer-events: none; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4));
}

/* Identity Content */
.hero-destiny-chronicle { flex: 1; display: flex; flex-direction: column; }

.title-inscription { margin-bottom: 0.5rem; }
.hero-kicker {
  margin: 0; font-size: 1.2rem; font-weight: 900; letter-spacing: 0.4em;
  background: linear-gradient(90deg, #fbbf24 0%, #fef3c7 50%, #fbbf24 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: goldShine 3s linear infinite; text-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
}

.hero-name-plate {
  margin: 0.2rem 0; font-size: 3.5rem; font-weight: 900; color: #ffffff; letter-spacing: 2px;
  text-shadow: 0 5px 15px rgba(0,0,0,0.8), 0 0 25px rgba(251, 191, 36, 0.3);
}

.realm-badge-container { display: flex; align-items: center; gap: 1.5rem; margin-top: 1rem; margin-bottom: 2rem; }

.realm-badge {
  padding: 0.6rem 2rem; border-radius: 50px; display: flex; align-items: center; gap: 1rem;
  background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.4);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
}

.realm-name { font-size: 1.3rem; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 2px; }
.aura-spin { font-size: 1.4rem; color: #fbbf24; animation: spinArray 4s linear infinite; }

/* Nút Đột Phá Thiên Kiếp */
.tribulation-breakthrough-btn {
  position: relative; border: none; background: transparent; padding: 0; cursor: pointer;
}

.btn-inner {
  background: linear-gradient(135deg, #ef4444, #991b1b); padding: 1rem 2.5rem; border-radius: 50px;
  color: #fff; font-weight: 900; font-size: 1rem; letter-spacing: 2px; position: relative; z-index: 2;
  box-shadow: inset 0 2px 0 rgba(255,255,255,0.3); display: flex; align-items: center; gap: 10px;
  transition: all 0.3s;
}

.btn-lightning-glow {
  position: absolute; inset: -5px; border-radius: 60px; background: linear-gradient(90deg, #ef4444, #fbbf24, #ef4444);
  background-size: 200%; filter: blur(15px); opacity: 0.8; z-index: 1; animation: lightningFlash 2s infinite;
}

.tribulation-breakthrough-btn:hover .btn-inner { transform: scale(1.05); background: linear-gradient(135deg, #f87171, #dc2626); }
.tribulation-breakthrough-btn:active .btn-inner { transform: scale(0.95); }

/* Progress Area (Dòng chảy linh khí) */
.qi-flow-area { margin-top: 0.5rem; }

.qi-track-cosmic {
  height: 14px; background: rgba(0, 0, 0, 0.6); border-radius: 20px; position: relative;
  border: 1px solid rgba(251, 191, 36, 0.2); box-shadow: inset 0 2px 10px rgba(0,0,0,0.8);
  overflow: hidden;
}

.qi-fill-gold {
  height: 100%; background: linear-gradient(90deg, #d97706, #fbbf24, #fef3c7);
  background-size: 200% 100%; animation: energyFlow 2s linear infinite; position: relative;
  transition: width 1s ease-in-out; box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
}

.qi-sparkles {
  position: absolute; right: 0; top: 0; width: 40px; height: 100%;
  background: radial-gradient(circle, #fff, transparent); filter: blur(3px); opacity: 0.9;
}

.qi-stats-plate { margin-top: 1rem; font-size: 1.1rem; font-weight: 800; color: #94a3b8; }
.exp-current { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5); }
.exp-divider { margin: 0 8px; opacity: 0.5; }

/* ===== 3 TRỤ ĐỘNG THIÊN (Cột Chỉ Số) ===== */
.divine-pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; position: relative; z-index: 2; }

.cosmic-pillar {
  position: relative; background: rgba(10, 15, 30, 0.8); border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 20px; padding: 2rem; backdrop-filter: blur(10px); transition: all 0.4s;
  overflow: hidden; cursor: default;
}

.pillar-glow {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 80%; height: 2px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.8), transparent); opacity: 0; transition: 0.4s;
}

.cosmic-pillar:hover { transform: translateY(-10px); background: rgba(15, 20, 40, 0.9); border-color: rgba(251, 191, 36, 0.5); box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(251, 191, 36, 0.1); }
.cosmic-pillar:hover .pillar-glow { opacity: 1; box-shadow: 0 5px 20px rgba(251, 191, 36, 0.6); }

.pillar-inner { display: flex; align-items: center; justify-content: flex-start; gap: 1.5rem; position: relative; z-index: 2;}

.stat-icon {
  width: 65px; height: 65px; border-radius: 18px; display: flex; align-items: center; justify-content: center;
  font-size: 2rem; background: rgba(251, 191, 36, 0.05); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2);
  transition: 0.4s;
}

.cosmic-pillar:hover .stat-icon { background: #fbbf24; color: #050510; transform: scale(1.1) rotate(5deg); box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }

.stat-content { display: flex; flex-direction: column; }
.stat-content label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; margin-bottom: 0.5rem; }
.stat-content strong { font-size: 1.8rem; font-weight: 900; color: #fff; line-height: 1; }
.cosmic-pillar:hover .stat-content strong { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }

/* ===== ANIMATIONS ===== */
@keyframes spinArray { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinArrayReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
@keyframes energyFlow { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
@keyframes goldShine { to { background-position: 200% center; } }
@keyframes lightningFlash { 0%, 100% { filter: blur(10px); opacity: 0.6; } 50% { filter: blur(20px); opacity: 1; } }

/* ===== MOBILE ADAPTATION ===== */
@media (max-width: 1024px) {
  .hero-core-layer { gap: 2rem; }
  .divine-pillars-grid { gap: 1rem; }
  .cosmic-pillar { padding: 1.5rem; }
  .stat-icon { width: 50px; height: 50px; font-size: 1.5rem; }
  .stat-content strong { font-size: 1.4rem; }
}

@media (max-width: 900px) {
  .cosmic-hero-array { padding: 2rem; border-radius: 20px; }
  .hero-core-layer { flex-direction: column; text-align: center; }
  .hero-destiny-chronicle { align-items: center; }
  .realm-badge-container { flex-direction: column; gap: 15px; }
  .qi-stats-plate { justify-content: center; }
  .divine-pillars-grid { grid-template-columns: 1fr; }
  .pillar-inner { justify-content: center; flex-direction: column; text-align: center; gap: 1rem; }
  .stat-content { align-items: center; }
}
</style>