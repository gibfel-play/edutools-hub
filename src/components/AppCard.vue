<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
    <div>
      <div class="flex items-start justify-between gap-3 mb-3">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
          {{ app.category || '未分類' }}
        </span>
        <span class="text-xs text-slate-400">{{ formatDate(app.createdAt) }}</span>
      </div>

      <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
        {{ app.title }}
      </h3>
      
      <p class="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
        {{ app.description || '暫無描述資訊' }}
      </p>
    </div>

    <!-- 按鈕群組：開啟 + 下載 -->
    <div class="flex items-center gap-2">
      <!-- 開啟工具 / 網站 -->
      <a
        :href="targetUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 py-2.5 bg-slate-100 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>開啟 ↗</span>
      </a>

      <!-- 下載按鈕（僅對上傳的 HTML 小程式顯示） -->
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
</template>

<script setup>
import { ref, computed } from 'vue';
import { GAS_API_URL } from '../services/gasApi';

const props = defineProps({
  app: Object
});

const downloading = ref(false);

// 判斷是否為外部連結
const isExternalLink = computed(() => {
  return props.app.fileId && (props.app.fileId.startsWith('http://') || props.app.fileId.startsWith('https://'));
});

// 計算開啟網址
const targetUrl = computed(() => {
  if (isExternalLink.value) {
    return props.app.fileId;
  }
  return `${GAS_API_URL}?action=getAppContent&fileId=${props.app.fileId}`;
});

// 下載小程式 HTML 檔案
const downloadApp = async () => {
  if (downloading.value || isExternalLink.value) return;
  downloading.value = true;

  try {
    const downloadUrl = `${GAS_API_URL}?action=downloadApp&fileId=${props.app.fileId}`;
    const res = await fetch(downloadUrl);
    const htmlText = await res.text();

    // 建立 Blob 物件並觸發瀏覽器下載
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