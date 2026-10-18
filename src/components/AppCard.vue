<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative">
    <div>
      <div class="flex items-start justify-between gap-2 mb-3">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
          {{ app.category || '未分類' }}
        </span>
        
        <div class="flex items-center gap-2">
          <!-- 🔥 熱門標籤 (點擊次數 >= 10 顯示) -->
          <span v-if="(app.clicks || 0) >= 10" class="px-2 py-0.5 text-xs font-bold rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1 animate-pulse">
            🔥 熱門
          </span>
          <span class="text-xs text-slate-400">{{ formatDate(app.createdAt) }}</span>
        </div>
      </div>

      <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
        {{ app.title }}
      </h3>
      
      <p class="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
        {{ app.description || '暫無描述資訊' }}
      </p>
    </div>

    <div>
      <!-- 點擊熱度統計提示 -->
      <div class="flex items-center justify-between text-xs text-slate-400 mb-2 px-0.5">
        <span>使用次數：<strong class="text-slate-600 font-semibold">{{ currentClicks }}</strong> 次</span>
      </div>

      <!-- 按鈕群組 -->
      <div class="flex items-center gap-2">
        <!-- 開啟工具 / 網站 -->
        <a
          :href="targetUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click="handleOpen"
          class="flex-1 py-2.5 bg-slate-100 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>開啟 ↗</span>
        </a>

        <!-- 下載按鈕 (僅對 HTML 小程式顯示) -->
        <button
          v-if="!isExternalLink"
          @click="downloadApp"
          :disabled="downloading"
          class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="下載小程式 HTML 檔"
        >
          <svg v-if="!downloading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <div v-else class="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs font-semibold">下載</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { GAS_API_URL, gasApi } from '../services/gasApi';

const props = defineProps({
  app: Object
});

const downloading = ref(false);
const currentClicks = ref(props.app.clicks || 0);

// 判斷是否為外部網址
const isExternalLink = computed(() => {
  return props.app.fileId && (props.app.fileId.startsWith('http://') || props.app.fileId.startsWith('https://'));
});

// 計算目標 URL
const targetUrl = computed(() => {
  if (isExternalLink.value) {
    return props.app.fileId;
  }
  return `${GAS_API_URL}?action=getAppContent&fileId=${props.app.fileId}`;
});

// 處理點擊事件：即時前端計數 +1 並向 GAS 後端發送更新
const handleOpen = () => {
  currentClicks.value += 1;
  gasApi.trackClick(props.app.id);
};

// 下載小程式
const downloadApp = async () => {
  if (downloading.value || isExternalLink.value) return;
  downloading.value = true;

  try {
    const downloadUrl = `${GAS_API_URL}?action=downloadApp&fileId=${props.app.fileId}`;
    const res = await fetch(downloadUrl);
    const htmlText = await res.text();

    const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.app.title || 'app'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('下載失敗：' + err.message);
  } finally {
    downloading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
};
</script>