<template>
  <div class="submit-story-page">
    <AppHeader />
    <main class="submit-story-container">
      <section class="submit-story-card">
        <h1 class="submit-story-title">{{ route.params.id ? 'Cập Nhật Truyện' : 'Đăng Truyện Mới' }}</h1>
        <form @submit.prevent="handleSubmit" class="submit-story-form">
          <StoryBasicInfoForm 
            v-model="story" 
            :default-author-name="authStore.user?.username" 
            :submitted="submitted"
            @validation-error="handleFileValidationError"
          />

          <StoryCategorySelector 
            :categories="categories" 
            v-model="story.the_loai_ids" 
            :submitted="submitted"
          />

          <StoryStatusSelects 
            v-model="story" 
            :submitted="submitted"
          />

          <div class="form-group">
            <label for="linkNguon" class="form-label"><i class="fas fa-link icon"></i> Link nguồn (nếu có)</label>
            <input 
              type="url" 
              id="linkNguon" 
              v-model="story.link_nguon" 
              class="form-input" 
              placeholder="https://example.com/source-story"
            >
          </div>

          <div class="form-group">
            <label for="mucTieu" class="form-label"><i class="fas fa-bullseye icon"></i> Mục tiêu</label>
            <textarea 
              id="mucTieu" 
              v-model="story.muc_tieu" 
              rows="4" 
              class="form-input" 
              placeholder="Mục tiêu của truyện: ví dụ như giải trí, truyền tải thông điệp, giáo dục, v.v."
            ></textarea>
            <span v-if="submitted && (!story.muc_tieu || story.muc_tieu.trim() === '')" class="error-message-inline">Mục tiêu không được để trống.</span>
          </div>

          <div class="form-group">
            <label for="doiTuongDocGia" class="form-label"><i class="fas fa-users icon"></i> Đối tượng độc giả</label>
            <textarea 
              id="doiTuongDocGia" 
              v-model="story.doi_tuong_doc_gia" 
              rows="4" 
              class="form-input" 
              placeholder="Đối tượng độc giả hướng tới: ví dụ như giới trẻ, người lớn, fan thể loại cụ thể, v.v."
            ></textarea>
            <span v-if="submitted && (!story.doi_tuong_doc_gia || story.doi_tuong_doc_gia.trim() === '')" class="error-message-inline">Đối tượng độc giả không được để trống.</span>
          </div>


          <div class="form-group">
            <label class="form-label">Nội dung chương mẫu</label>
            <ChapterContentEditor 
              v-model="story.chuong_mau" 
              :api-key="tinymceApiKey" 
            />
            <span v-if="submitted && (!story.chuong_mau || story.chuong_mau.trim() === '<p></p>' || story.chuong_mau.trim() === '')" class="error-message-inline">Nội dung chương mẫu không được để trống.</span>
          </div>
          
          <div class="form-group agree-group">
            <label class="agree-label">
              <input
                type="checkbox"
                v-model="agreeToSubmit"
                :class="{ 'is-invalid': submitted && !agreeToSubmit }"
              />
              Bạn muốn đăng truyện và xác nhận thông tin trên đã đúng.
            </label>
            <span v-if="submitted && !agreeToSubmit" class="error-message-inline">Bạn phải đồng ý xác nhận để đăng truyện.</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <i class="fas fa-upload"></i>
            {{ loading ? 'Đang xử lý...' : (route.params.id ? 'Cập Nhật Truyện' : 'Gửi Truyện') }}
          </button>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/modules/auth/auth.store';
import { useToast } from 'vue-toastification';
import { useRouter, useRoute } from 'vue-router';
import axios from '@/utils/axios'; 

import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import StoryBasicInfoForm from '@/components/forms/StoryBasicInfoForm.vue';
import StoryCategorySelector from '@/components/forms/StoryCategorySelector.vue';
import StoryStatusSelects from '@/components/forms/StoryStatusSelects.vue';
import ChapterContentEditor from '@/components/forms/ChapterContentEditor.vue';

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();

const tinymceApiKey = 'uaj7kxz5hqnxtzefohh4ix5gcm41m7bfzxbtg3oglrkv7s4a';

const story = ref({
  ten_truyen: '',
  tac_gia: authStore.user?.username || '', 
  mo_ta: '',
  the_loai_ids: [], 
  trang_thai: 'Đang ra', 
  tinh_trang: 'Đang viết', 
  trang_thai_viet: 'Bản nháp', 
  link_nguon: '', // Khởi tạo trường mới
  muc_tieu: '',    // Khởi tạo trường mới
  doi_tuong_doc_gia: '', // Khởi tạo trường mới
  chuong_mau: '', 
  anh_bia: null, 
  user_id: authStore.user?.id,
});

const categories = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false); 
const fileErrors = ref({ anh_bia: '' });
const agreeToSubmit = ref(false); 

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/theloai'); 
    categories.value = response.data.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách thể loại:', error);
    toast.error('Không thể tải danh sách thể loại.');
  }
};

const handleFileValidationError = ({ field, message }) => {
  fileErrors.value[field] = message;
};

const validateForm = () => {
  let isValid = true;
  errorMessage.value = ''; 
  fileErrors.value.anh_bia = ''; 

  if (!story.value.ten_truyen || story.value.ten_truyen.trim() === '') {
    isValid = false;
    errorMessage.value = 'Tên truyện không được để trống.';
  }
  if (!story.value.tac_gia || story.value.tac_gia.trim() === '') {
    isValid = false;
    errorMessage.value = 'Tên tác giả không được để trống.';
  }
  if (!story.value.mo_ta || story.value.mo_ta.trim() === '') {
    isValid = false;
    errorMessage.value = 'Mô tả không được để trống.';
  }
  if (!story.value.the_loai_ids || story.value.the_loai_ids.length === 0) {
    isValid = false;
    errorMessage.value = 'Vui lòng chọn ít nhất một thể loại.';
  }
  if (!story.value.trang_thai) {
    isValid = false;
    errorMessage.value = 'Trạng thái truyện không được để trống.';
  }
  if (!story.value.tinh_trang) {
    isValid = false;
    errorMessage.value = 'Tình trạng truyện không được để trống.';
  }
  if (!story.value.trang_thai_viet) {
    isValid = false;
    errorMessage.value = 'Trạng thái viết truyện không được để trống.';
  }
  // NEW: Validate Mục tiêu
  if (!story.value.muc_tieu || story.value.muc_tieu.trim() === '') {
    isValid = false;
    errorMessage.value = 'Mục tiêu không được để trống.';
  }
  // NEW: Validate Đối tượng độc giả
  if (!story.value.doi_tuong_doc_gia || story.value.doi_tuong_doc_gia.trim() === '') {
    isValid = false;
    errorMessage.value = 'Đối tượng độc giả không được để trống.';
  }
  if (!story.value.chuong_mau || story.value.chuong_mau.trim() === '<p></p>' || story.value.chuong_mau.trim() === '') {
    isValid = false;
    errorMessage.value = 'Nội dung chương mẫu không được để trống.';
  }
  if (!story.value.anh_bia) {
    isValid = false;
    fileErrors.value.anh_bia = 'Ảnh bìa là bắt buộc.';
    errorMessage.value = 'Ảnh bìa là bắt buộc.'; 
  } else {
    if (fileErrors.value.anh_bia) {
      isValid = false; 
      errorMessage.value = fileErrors.value.anh_bia; 
    }
  }

  if (!agreeToSubmit.value) {
    isValid = false;
    errorMessage.value = 'Bạn phải đồng ý xác nhận để đăng truyện.';
  }

  if (!isValid && errorMessage.value) {
    toast.error(errorMessage.value);
  }

  return isValid;
};

const handleSubmit = async () => {
  submitted.value = true; 
  
  if (!validateForm()) {
    return; 
  }

  loading.value = true;
  errorMessage.value = ''; 

  const isEditMode = !!route.params.id;
  const storyId = route.params.id; 

  const formData = new FormData();
  formData.append('ten_truyen', story.value.ten_truyen);
  formData.append('tac_gia', story.value.tac_gia);
  formData.append('mo_ta', story.value.mo_ta);
  formData.append('trang_thai', story.value.trang_thai);
  formData.append('tinh_trang', story.value.tinh_trang);
  formData.append('trang_thai_viet', story.value.trang_thai_viet);
  formData.append('link_nguon', story.value.link_nguon); // NEW
  formData.append('muc_tieu', story.value.muc_tieu);     // NEW
  formData.append('doi_tuong_doc_gia', story.value.doi_tuong_doc_gia); // NEW
  formData.append('chuong_mau', story.value.chuong_mau);
  formData.append('user_id', story.value.user_id);
  
  if (story.value.anh_bia) {
    formData.append('anh_bia', story.value.anh_bia);
  }

  story.value.the_loai_ids.forEach(id => {
    formData.append('theloai_ids[]', id); 
  });

  try {
    let response;
    if (isEditMode) {
        response = await axios.put(`/api/truyen/${storyId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    } else {
        response = await axios.post('/api/truyen', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
    
    toast.success(response.data.message);
    router.push({ name: 'Home' }); 
  } catch (error) {
    console.error('Lỗi khi đăng truyện:', error);
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
      toast.error(error.response.data.message);
    } else {
      errorMessage.value = 'Đã xảy ra lỗi khi đăng truyện. Vui lòng thử lại.';
      toast.error('Đã xảy ra lỗi khi đăng truyện. Vui lòng thử lại.');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  
  if (route.params.id) {
    const fetchStoryDetails = async () => {
        try {
            loading.value = true;
            const res = await axios.get(`/api/truyen/${route.params.id}`);
            const data = res.data;
            // Populate form
            story.value = {
                ten_truyen: data.ten_truyen || '',
                tac_gia: data.tac_gia || '',
                mo_ta: data.mo_ta || '',
                the_loai_ids: data.genres ? data.genres.map(g => g.id_theloai) : [],
                trang_thai: data.trang_thai || 'Đang ra',
                tinh_trang: data.tinh_trang || 'Đang viết',
                trang_thai_viet: data.trang_thai_viet || 'Bản nháp',
                link_nguon: data.link_nguon || '',
                muc_tieu: data.muc_tieu || '',
                doi_tuong_doc_gia: data.doi_tuong_doc_gia || '',
                chuong_mau: data.noi_dung_chuong_dau || '', // Adjust based on API structure
                anh_bia: null, // Keep null to avoid re-upload if not changed
                user_id: authStore.user?.id,
            };
            // Note: Handling existing image preview might require extra UI logic, keeping it simple for now
            
        } catch (error) {
            console.error("Error loading story for edit:", error);
            toast.error("Không thể tải thông tin truyện.");
            router.push({ name: 'AuthorStoryManagement' });
        } finally {
            loading.value = false;
        }
    };
    fetchStoryDetails();
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Sora:wght@400;600&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

.submit-story-page {
  min-height: 100vh;
  background: #1a1d29; 
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.submit-story-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.submit-story-card {
  background: rgba(26, 29, 41, 0.9);
  backdrop-filter: blur(15px);
  border: 2px solid #4caf50; 
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 0 25px rgba(76, 175, 80, 0.25); 
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fade-in 0.8s ease-in;
}

.submit-story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 35px rgba(76, 175, 80, 0.35);
}

.submit-story-title {
  font-family: "Sora", sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: #4caf50; 
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.submit-story-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #cccccc;
}

.form-input {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.3); 
  border-radius: 0.5rem;
  color: #ffffff;
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #4caf50; 
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.form-input.is-invalid {
  border-color: #ef4444; 
}

.agree-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.agree-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Manrope", sans-serif;
  font-size: 0.9rem;
  color: #ffffff;
}

.agree-label input {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #4caf50; 
}
.agree-label input.is-invalid {
  outline: 2px solid #ef4444; 
}

.submit-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(90deg, #4caf50, #66bb6a); 
  color: #ffffff; 
  font-family: "Sora", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.submit-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.submit-btn:hover::after {
  width: 250px;
  height: 250px;
}

.submit-btn i {
  margin-right: 0.5rem;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(90deg, #333, #555);
  box-shadow: none;
  color: #cccccc;
}

.error-message {
  color: #ff6b6b;
  margin-top: 1rem;
  text-align: center;
}

.error-message-inline {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  margin-left: 5px;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .submit-story-container {
    padding: 1.5rem 1rem;
  }

  .submit-story-card {
    padding: 1.5rem;
  }

  .submit-story-title {
    font-size: 1.75rem;
  }
  
  .form-input {
    font-size: 0.9rem;
  }

  .submit-btn {
    padding: 0.5rem 1.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .submit-story-card {
    padding: 1rem;
  }

  .submit-story-title {
    font-size: 1.5rem;
  }
  
  .form-group {
    gap: 0.3rem;
  }

  .form-label {
    font-size: 0.95rem;
  }

  .form-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    border-radius: 0.75rem;
  }

  .error-message-inline {
    font-size: 0.8rem;
    margin-top: 0.1rem;
  }

  .submit-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>