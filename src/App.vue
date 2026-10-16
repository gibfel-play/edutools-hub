<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
    <Navbar
      v-model:searchQuery="searchQuery"
      v-model:selectedCategory="selectedCategory"
      :categories="categories"
      @openUpload="showUploadModal = true"
    />

    <main class="flex-1 max-w-7xl w-full mx-auto p-6">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="filteredApps.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AppCard
          v-for="app in filteredApps"
          :key="app.id"
          :app="app"
          @run="currentApp = $event"
        />
      </div>

      <div v-else class="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <p class="text-slate-500 font-medium">目前還沒有上傳小程式，或找不到符合的搜尋結果。</p>
      </div>
    </main>

    <AppViewer
      v-if="currentApp"
      :app="currentApp"
      @close="currentApp = null"
    />

    <UploadModal
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="fetchApps"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import AppCard from './components/AppCard.vue';
import AppViewer from './components/AppViewer.vue';
import UploadModal from './components/UploadModal.vue';
import { gasApi } from './services/gasApi';

const apps = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const currentApp = ref(null);
const showUploadModal = ref(false);

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

const filteredApps = computed(() => {
  return apps.value.filter(app => {
    const matchesSearch = ((app.title || '') + (app.description || '')).toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !selectedCategory.value || app.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});
</script>