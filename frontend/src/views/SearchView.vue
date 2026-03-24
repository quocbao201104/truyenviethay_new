<template>
  <div class="search-view-container">
    
    <main class="main-content">
      <div class="container">
        
        <!-- THIÊN CƠ CÁC HEADER -->
        <div class="page-header animate-fadeIn">
          <h1 class="page-title-xianxia">
            <i class="fas fa-dharmachakra animate-spin-slow"></i>
            Thiên Cơ Các
          </h1>
          <p class="page-subtitle">Tầm tiên lộ - Tìm kiếm linh vật trong vạn giới</p>
          <div v-if="keyword" class="search-result-info">
            Đang cảm ứng cho: <span>"{{ keyword }}"</span>
          </div>
          <div class="header-divider"></div>
        </div>

        <div class="content-layout">
          
          <!-- BỘ LỌC LINH KHÍ (SIDEBAR) -->
          <aside class="filters-sidebar-xianxia">
            <div class="sidebar-inner">
              
              <div class="filter-block">
                <div class="block-header">
                  <i class="fas fa-wand-magic-sparkles"></i>
                  <h3>Thần Thức Tìm Kiếm</h3>
                </div>
                <div class="aura-search-wrapper">
                  <input
                    v-model="filters.keyword"
                    type="text"
                    placeholder="Nhập danh tính linh vật..."
                    class="aura-input"
                    @keydown.enter="applyFilters"
                  />
                  <button @click="applyFilters" class="aura-btn">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>

              <!-- Genre Filter (Phân Loại Căn Cơ) -->
              <div class="filter-block">
                <div class="block-header">
                  <i class="fas fa-scroll"></i>
                  <h3>Phân Loại</h3>
                </div>
                <div v-if="loadingGenres" class="filter-loading">
                  <i class="fas fa-yin-yang fa-spin"></i>
                </div>
                <div v-else class="genre-grid-xianxia">
                  <label
                    v-for="genre in genres"
                    :key="genre.id_theloai"
                    class="genre-chip"
                    :class="{ 'active': filters.selectedGenres.includes(genre.id_theloai) }"
                  >
                    <input
                      type="checkbox"
                      :value="genre.id_theloai"
                      v-model="filters.selectedGenres"
                      @change="applyFilters"
                      hidden
                    />
                    <span class="chip-text">{{ genre.ten_theloai }}</span>
                  </label>
                </div>
              </div>

              <!-- Status Filter (Trạng Thái Tu Vi) -->
              <div class="filter-block">
                <div class="block-header">
                  <i class="fas fa-hourglass-half"></i>
                  <h3>Trạng Thái</h3>
                </div>
                <div class="status-options">
                  <label v-for="opt in [{v:'', l:'Tất Cả'}, {v:'dang_ra', l:'Đang Ra'}, {v:'hoan_thanh', l:'Đã Viên Mãn'}]" 
                         :key="opt.v" class="status-pill">
                    <input type="radio" :value="opt.v" v-model="filters.status" @change="applyFilters" hidden />
                    <span class="pill-btn" :class="{ 'active': filters.status === opt.v }">{{ opt.l }}</span>
                  </label>
                </div>
              </div>

              <!-- Sort Filter (Thứ Tự Thiên Bảng) -->
              <div class="filter-block">
                <div class="block-header">
                  <i class="fas fa-sort-amount-down"></i>
                  <h3>Thứ Tự Thiên Bảng</h3>
                </div>
                <div class="custom-select-wrapper">
                  <select v-model="filters.sortBy" @change="applyFilters" class="xianxia-select">
                    <option value="thoi_gian_cap_nhat">Mới Cập Nhật</option>
                    <option value="luot_xem">Xem Nhiều Nhất</option>
                    <option value="luot_thich">Được Yêu Thích</option>
                    <option value="ten_truyen">Tên A-Z</option>
                  </select>
                </div>
              </div>

              <!-- Clear Button -->
              <button @click="clearAllFilters" class="clear-btn-xianxia">
                <i class="fas fa-trash-restore"></i>
                Xóa Bỏ Ám Ký
              </button>
            </div>
          </aside>

          <!-- KẾT QUẢ HIỂN THỊ -->
          <section class="results-container-xianxia">
            
            <div class="results-top-bar">
               <div class="count-badge">
                 <i class="fas fa-list-ul"></i>
                 <span>Tìm thấy <strong class="text-emerald-400">{{ totalResults }}</strong> linh vật</span>
               </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-aura-overlay">
               <div class="aura-spinner">
                 <div class="dot"></div>
                 <div class="dot"></div>
                 <div class="dot"></div>
               </div>
               <p>Đang cảm ứng vạn giới...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="state-box error">
              <i class="fas fa-exclamation-triangle"></i>
              <p>Thiên cơ nhiễu loạn: {{ error }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="stories.length === 0" class="state-box empty">
              <i class="fas fa-ghost"></i>
              <h3>Không tìm thấy linh vật</h3>
              <p>Thử thay đổi ám ký hoặc linh lực tìm kiếm</p>
            </div>

            <!-- Stories Grid -->
            <div v-else class="stories-grid-xianxia">
              <NewStoryCard
                v-for="story in stories"
                :key="story.id"
                :story="story"
              />
            </div>

            <!-- PHÂN TRANG (PAGINATION) -->
            <div v-if="totalPages > 1" class="xianxia-pagination">
              <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-nav">
                <i class="fas fa-chevron-left"></i>
              </button>

              <div class="page-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="['page-num', { active: page === currentPage }]"
                >
                  {{ page }}
                </button>
              </div>

              <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-nav">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NewStoryCard from '@/modules/storyText/components/NewStoryCard.vue';
import axios from '@/utils/axios';

const route = useRoute();
const router = useRouter();

// State
const loading = ref(false);
const loadingGenres = ref(false);
const error = ref<string | null>(null);
const stories = ref<any[]>([]);
const genres = ref<any[]>([]);
const totalResults = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);

// Filters
const filters = ref({
  keyword: '',
  selectedGenres: [] as number[],
  status: '',
  sortBy: 'thoi_gian_cap_nhat',
});

// Computed Pages
const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const keyword = computed(() => filters.value.keyword);

// Methods
const fetchGenres = async () => {
  loadingGenres.value = true;
  try {
    const response = await axios.get('/api/theloai');
    genres.value = response.data.data || [];
  } catch (err) {
    genres.value = [];
  } finally {
    loadingGenres.value = false;
  }
};

const buildQueryParams = () => {
  const params: any = {
    page: currentPage.value,
    limit: 18,
    sort_by: filters.value.sortBy,
    order: 'DESC',
  };
  if (filters.value.keyword?.trim()) params.keyword = filters.value.keyword.trim();
  if (filters.value.status) params.trang_thai = filters.value.status;
  if (filters.value.selectedGenres.length > 0) params.category_ids = filters.value.selectedGenres.join(',');
  return params;
};

const fetchStories = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = buildQueryParams();
    const response = await axios.get('/api/truyen/public', { params });
    stories.value = response.data.data || [];
    totalResults.value = response.data.pagination?.total || 0;
    totalPages.value = response.data.pagination?.total_pages || 1;
    currentPage.value = response.data.pagination?.current_page || 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm';
    stories.value = [];
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  updateURL();
};

const clearAllFilters = () => {
  filters.value = { keyword: '', selectedGenres: [], status: '', sortBy: 'thoi_gian_cap_nhat' };
  currentPage.value = 1;
  updateURL();
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  updateURL();
};

const updateURL = () => {
  const query: any = {};
  if (filters.value.keyword) query.keyword = filters.value.keyword;
  if (filters.value.status) query.status = filters.value.status;
  if (filters.value.sortBy !== 'thoi_gian_cap_nhat') query.sort = filters.value.sortBy;
  if (filters.value.selectedGenres.length > 0) query.genres = filters.value.selectedGenres.join(',');
  if (currentPage.value > 1) query.page = currentPage.value;
  router.replace({ query });
};

const loadFromURL = () => {
  const query = route.query;
  filters.value.keyword = (query.keyword as string) || '';
  filters.value.status = (query.status as string) || '';
  filters.value.sortBy = (query.sort as string) || 'thoi_gian_cap_nhat';
  if (query.genres) {
    filters.value.selectedGenres = (query.genres as string).split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
  }
  currentPage.value = parseInt(query.page as string) || 1;
};

onMounted(() => {
  fetchGenres();
  loadFromURL();
  fetchStories();
});

watch(() => route.query, () => {
  if (route.name === 'SearchView') {
    loadFromURL();
    fetchStories();
  }
});
</script>

<style scoped>
/* ===== CONTAINER & GLOBAL ===== */
.search-view-container {
  min-height: 100vh;
  background-color: #111a28;
  background-image: 
    radial-gradient(circle at 15% 30%, rgba(138, 113, 196, 0.045) 0%, transparent 40%),
    radial-gradient(circle at 85% 70%, rgba(92, 133, 214, 0.04) 0%, transparent 40%);
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 44px 20px 84px;
}

/* ===== PAGE HEADER XIANXIA ===== */
.page-header {
  text-align: center;
  margin-bottom: 56px;
  position: relative;
}

.page-title-xianxia {
  font-family: 'Cinzel', serif; /* Font cổ điển, phù hợp với "Thiên Cơ Các" */
  font-size: 3.3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 6px;
  /* Dải màu Tím - Bạc - Tím */
  background: linear-gradient(to right, #9b7ad3, #f8fafc, #7f99d3);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-flex;
  align-items: center;
  gap: 20px;
  filter: none;
}

.page-title-xianxia i {
  color: #9b7ad3;
  filter: none;
}

.page-subtitle {
  color: var(--app-text-muted);
  text-transform: uppercase;
  letter-spacing: 4px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: 15px;
}

.search-result-info {
  margin-top: 20px;
  font-size: 1rem;
  color: var(--app-text-muted);
  font-style: italic;
}

.search-result-info span {
  color: #d0b5f0;
  font-weight: 800;
  text-shadow: none;
}

.header-divider {
  height: 1px;
  width: 400px;
  background: linear-gradient(90deg, transparent, rgba(155, 122, 211, 0.8), transparent);
  margin: 30px auto;
  position: relative;
}
.header-divider::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 8px; height: 8px;
  background: #9b7ad3;
  box-shadow: none;
}

/* ===== LAYOUT ===== */
.content-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 44px;
  align-items: start;
}

/* ===== SIDEBAR FILTERS (KÍNH MỜ TÍM) ===== */
.filters-sidebar-xianxia {
  background: rgba(21, 31, 47, 0.78);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  padding: 24px;
  position: sticky;
  top: 40px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  box-shadow: var(--app-shadow-1);
}

/* Custom Scrollbar cho Sidebar */
.filters-sidebar-xianxia::-webkit-scrollbar { width: 4px; }
.filters-sidebar-xianxia::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.24); border-radius: 4px; }

.filter-block {
  margin-bottom: 32px;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.block-header i {
  color: #9b7ad3;
  font-size: 1.1rem;
  filter: none;
}

.block-header h3 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Aura Search Input */
.aura-search-wrapper {
  display: flex;
  gap: 10px;
}

.aura-input {
  flex: 1;
  background: rgba(12, 18, 29, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.9rem;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.aura-input:focus {
  border-color: rgba(155, 122, 211, 0.3);
  box-shadow: 0 0 0 3px rgba(155, 122, 211, 0.08);
  outline: none;
}
.aura-input::placeholder { color: var(--app-text-subtle); }

.aura-btn {
  background: rgba(155, 122, 211, 0.14);
  color: #e6d8fb;
  border: none;
  border-radius: 14px;
  width: 48px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  border: 1px solid rgba(155, 122, 211, 0.18);
}

.aura-btn:hover {
  transform: translateY(-1px);
  background: rgba(155, 122, 211, 0.2);
  color: #f0e7fd;
}

/* Genre Grid (Chip Thể Loại) */
.genre-grid-xianxia {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.genre-chip {
  background: rgba(12, 18, 29, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.genre-chip .chip-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--app-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 1.4;
}

.genre-chip:hover {
  border-color: rgba(155, 122, 211, 0.2);
  background: rgba(155, 122, 211, 0.05);
  transform: translateY(-1px);
}

.genre-chip.active {
  background: rgba(155, 122, 211, 0.12);
  border-color: rgba(155, 122, 211, 0.28);
  box-shadow: none;
}

.genre-chip.active .chip-text {
  color: #e2d4f4;
  text-shadow: none;
}

/* Status Pills */
.status-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pill-btn {
  display: block;
  padding: 13px 18px;
  background: rgba(12, 18, 29, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--app-text-muted);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  text-align: center;
}

.pill-btn:hover { background: rgba(155, 122, 211, 0.05); }

.pill-btn.active {
  background: rgba(155, 122, 211, 0.12);
  border-left: 3px solid #9b7ad3;
  border-color: rgba(155, 122, 211, 0.2) rgba(155, 122, 211, 0.12) rgba(155, 122, 211, 0.12) #9b7ad3;
  color: #e4d7f6;
}

/* Select */
.custom-select-wrapper { position: relative; }
.custom-select-wrapper::after {
  content: '\f107'; font-family: 'Font Awesome 6 Free'; font-weight: 900;
  position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
  color: #9b7ad3; pointer-events: none;
}

.xianxia-select {
  appearance: none;
  width: 100%;
  background: rgba(12, 18, 29, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  padding: 14px 16px;
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.xianxia-select:focus { border-color: rgba(155, 122, 211, 0.3); box-shadow: 0 0 0 3px rgba(155, 122, 211, 0.08); }
.xianxia-select option { background: #151e2d; color: #e2e8f0; }

/* Clear Button */
.clear-btn-xianxia {
  width: 100%;
  padding: 16px;
  background: rgba(223, 120, 135, 0.06);
  border: 1px dashed rgba(223, 120, 135, 0.24);
  color: #e59ba8;
  border-radius: 14px;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.clear-btn-xianxia:hover {
  background: rgba(223, 120, 135, 0.14);
  color: #ffe4e8;
  border-style: solid;
  box-shadow: none;
  transform: translateY(-1px);
}

/* ===== RESULTS SECTION ===== */
.results-top-bar {
  margin-bottom: 34px;
  display: flex;
  align-items: center;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(21, 31, 47, 0.82);
  backdrop-filter: none;
  padding: 11px 20px;
  border-radius: 50px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  font-size: 0.9rem;
  color: #cbd5e1;
  box-shadow: var(--app-shadow-1);
}

.count-badge i { color: #9b7ad3; }

.stories-grid-xianxia {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 30px 26px;
}

/* State Boxes (Loading/Error/Empty) */
.state-box {
  text-align: center;
  padding: 120px 20px;
  background: rgba(21, 31, 47, 0.7);
  border-radius: 24px;
  border: 1px dashed rgba(148, 163, 184, 0.16);
  backdrop-filter: none;
}

.state-box i { font-size: 5rem; margin-bottom: 25px; color: #6e5a9a; opacity: 0.42; }
.state-box h3 { font-size: 1.2rem; color: #e2e8f0; margin-bottom: 10px; }
.state-box.error i { color: #df7887; opacity: 0.5; }

/* ===== PAGINATION ===== */
.xianxia-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 68px;
}

.page-nav {
  width: 48px;
  height: 48px;
  background: rgba(21, 31, 47, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  color: #9b7ad3;
  cursor: pointer;
  transition: all 0.3s;
  display: flex; align-items: center; justify-content: center;
}

.page-nav:disabled { opacity: 0.2; cursor: not-allowed; }
.page-nav:hover:not(:disabled) { background: rgba(155, 122, 211, 0.08); border-color: rgba(155, 122, 211, 0.22); transform: translateY(-1px); }

.page-numbers { display: flex; gap: 10px; }

.page-num {
  width: 48px;
  height: 48px;
  background: rgba(21, 31, 47, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  color: var(--app-text-muted);
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  display: flex; align-items: center; justify-content: center;
}

.page-num:hover { background: rgba(155, 122, 211, 0.08); color: #e4d7f6; }

.page-num.active {
  background: rgba(155, 122, 211, 0.18);
  color: #fff;
  border-color: rgba(155, 122, 211, 0.28);
  box-shadow: none;
}

/* ===== ANIMATIONS ===== */
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 12s infinite linear;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

/* Aura Spinner */
.loading-aura-overlay {
  text-align: center;
  padding: 120px 0;
  background: rgba(21, 31, 47, 0.7);
  border-radius: 24px;
  backdrop-filter: none;
}

.loading-aura-overlay p { color: #cdb5ea; font-weight: 600; letter-spacing: 1px; margin-top: 15px; }

.aura-spinner { display: flex; justify-content: center; gap: 12px; margin-bottom: 15px; }

.aura-spinner .dot {
  width: 14px; height: 14px;
  background: #9b7ad3; border-radius: 50%;
  animation: aura-bounce 1.4s infinite ease-in-out both;
  box-shadow: none;
}

.aura-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.aura-spinner .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes aura-bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1.0); opacity: 1; }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .content-layout { grid-template-columns: 280px 1fr; gap: 25px; }
}

@media (max-width: 768px) {
  .content-layout { grid-template-columns: 1fr; }
  .filters-sidebar-xianxia { position: static; max-height: none; margin-bottom: 20px; }
  .page-title-xianxia { font-size: 2.2rem; letter-spacing: 3px; }
  .stories-grid-xianxia { grid-template-columns: repeat(2, 1fr); gap: 18px 14px; }
  .page-num, .page-nav { width: 40px; height: 40px; }
}
</style>
