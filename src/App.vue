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
          @openQr="handleOpenQr"
        />
      </div>

      <div v-else class="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <p class="text-slate-500 font-medium">目前還沒有小程式，或找不到符合的搜尋結果。</p>
      </div>
    </main>

    <!-- 頁尾維護與瀏覽人次資訊 -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between px-6 max-w-7xl w-full mx-auto gap-2">
      <div>
        網站建置維護：新北市泰山區明志國小 曾旭良
      </div>
      <div class="flex items-center gap-4 text-xs bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
        <span>👀 今日瀏覽：<strong class="text-indigo-600 font-bold">{{ siteStats.today }}</strong> 次</span>
        <span class="text-slate-300">|</span>
        <span>📈 累計瀏覽：<strong class="text-indigo-600 font-bold">{{ siteStats.total }}</strong> 次</span>
      </div>
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

    <!-- 獨立全螢幕 QR Code 彈窗 (頂層掛載) -->
    <QrModal
      v-if="activeQrApp"
      :app="activeQrApp"
      :gasApiUrl="GAS_API_URL"
      @close="activeQrApp = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import AppCard from './components/AppCard.vue';
import UploadModal from './components/UploadModal.vue';
import AdminModal from './components/AdminModal.vue';
import QrModal from './components/QrModal.vue';
import { GAS_API_URL, gasApi } from './services/gasApi';

const apps = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('newest');

const siteStats = ref({ today: 0, total: 0 });

const showUploadModal = ref(false);
const showAdminModal = ref(false);
const activeQrApp = ref(null); // 當前要顯示 QR Code 的小程式

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

const initSiteStats = async () => {
  const stats = await gasApi.trackPageVisit();
  if (stats) siteStats.value = stats;
};

const handleOpenQr = (app) => {
  activeQrApp.value = app;
};

onMounted(() => {
  fetchApps();
  initSiteStats();
});

const categories = computed(() => {
  const set = new Set(apps.value.map(a => a.category).filter(Boolean));
  return Array.from(set);
});

const filteredApps = computed(() => {
  let result = apps.value.filter(app => {
    const matchesSearch = ((app.title || '') + (app.description || '')).toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !selectedCategory.value || app.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });

  return result.sort((a, b) => {
    if (sortBy.value === 'popular') {
      return (Number(b.clicks) || 0) - (Number(a.clicks) || 0);
    } else if (sortBy.value === 'oldest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });
});
</script>