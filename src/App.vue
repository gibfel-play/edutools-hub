<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
    <!-- 頂部導覽列 -->
    <Navbar
      v-model:searchQuery="searchQuery"
      v-model:selectedCategory="selectedCategory"
      v-model:sortBy="sortBy"
      :categories="categories"
      @openUpload="showUploadModal = true"
      @openAdmin="showAdminModal = true"
    />

    <!-- 主要內容區 -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-6">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="filteredApps.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AppCard
          v-for="app in filteredApps"
          :key="app.id"
          :app="app"
        />
      </div>

      <div v-else class="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <p class="text-slate-500 font-medium">目前還沒有小程式，或找不到符合的搜尋結果。</p>
      </div>
    </main>

    <!-- 頁尾維護資訊 -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-sm text-slate-500">
      網站建置維護：新北市泰山區明志國小 曾旭良
    </footer>

    <!-- 上傳彈窗 -->
    <UploadModal
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="fetchApps"
    />

    <!-- 管理後台彈窗 -->
    <AdminModal
      v-if="showAdminModal"
      :apps="apps"
      @close="showAdminModal = false"
      @refresh="fetchApps"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import AppCard from './components/AppCard.vue';
import UploadModal from './components/UploadModal.vue';
import AdminModal from './components/AdminModal.vue';
import { gasApi } from './services/gasApi';

const apps = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('newest'); // 預設排序方式：最新上架 ('newest', 'popular', 'oldest')

const showUploadModal = ref(false);
const showAdminModal = ref(false);

const fetchApps = async () => {
  loading.value = true;
  try {
    apps.value = await gasApi.getApps();
  } catch (err) {
    console.error('獲取清單失敗:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchApps);

const categories = computed(() => {
  const set = new Set(apps.value.map(a => a.category).filter(Boolean));
  return Array.from(set);
});

// 關鍵字搜尋、分類過濾與動態排序
const filteredApps = computed(() => {
  let result = apps.value.filter(app => {
    const matchesSearch = ((app.title || '') + (app.description || '')).toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !selectedCategory.value || app.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });

  // 排序處理
  return result.sort((a, b) => {
    if (sortBy.value === 'popular') {
      // 熱度排序：點擊數由多到少
      return (Number(b.clicks) || 0) - (Number(a.clicks) || 0);
    } else if (sortBy.value === 'oldest') {
      // 依建立時間：由舊到新
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else {
      // 最新上架 (預設)：由新到舊
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });
});
</script>