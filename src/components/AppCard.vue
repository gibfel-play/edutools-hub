<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative">
    <div>
      <div class="flex items-start justify-between gap-2 mb-3">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
          {{ app.category || '未分類' }}
        </span>
        
        <div class="flex items-center gap-2">
          <span v-if="(app.clicks || 0) >= 10" class="px-2 py-0.5 text-xs font-bold rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1 animate-pulse">
            🔥 熱門
          </span>
          <span class="text-xs text-slate-400">{{ formatDate(app.createdAt) }}</span>
        </div>
      </div>

      <!-- 標題與 QR Code 按鈕 -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 flex-1">
          {{ app.title }}
        </h3>
        
        <!-- QR Code 圖示按鈕 -->
        <button
          @click="showQrModal = true"
          class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer shrink-0"
          title="顯示 QR Code 供掃描"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m0 4h2m-4-11h.01M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6z"/>
          </svg>
        </button>
      </div>
      
      <p class="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
        {{ app.description || '暫無描述資訊' }}
      </p>
    </div>

    <div>
      <div class="flex items-center justify-between text-xs text-slate-400 mb-2 px-0.5">
        <span>使用次數：<strong class="text-slate-600 font-semibold">{{ currentClicks }}</strong> 次</span>
      </div>

      <div class="flex items-center gap-2">
        <a
          :href="targetUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click="handleOpen"
          class="flex-1 py-2.5 bg-slate-100 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>開啟 ↗</span>
        </a>

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

    <!-- QR Code 放大彈窗 Modal -->
    <div
      v-if="showQrModal"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="showQrModal = false"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative border border-slate-200 animate-in fade-in zoom-in duration-200">
        <button
          @click="showQrModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl cursor-pointer"
        >
          ✕
        </button>

        <span class="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 mb-2">
          {{ app.category || '未分類' }}
        </span>

        <h4 class="text-lg font-bold text-slate-800 mb-1 px-4">{{ app.title }}</h4>
        <p class="text-xs text-slate-500 mb-4">請使用手機或平板相機掃描開啟</p>

        <!-- Google Chart QR Code 圖片 -->
        <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-inner mb-4">
          <img
            :src="qrCodeApiUrl"
            :alt="app.title + ' QR Code'"
            class="w-64 h-64 object-contain"
          />
        </div>

        <button
          @click="showQrModal = false"
          class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all cursor-pointer"
        >
          關閉視窗
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
const showQrModal = ref(false);
const currentClicks = ref(props.app.clicks || 0);

const isExternalLink = computed(() => {
  return props.app.fileId && (props.app.fileId.startsWith('http://') || props.app.fileId.startsWith('https://'));
});

const targetUrl = computed(() => {
  if (isExternalLink.value) {
    return props.app.fileId;
  }
  return `${GAS_API_URL}?action=getAppContent&fileId=${props.app.fileId}`;
});

// 使用 Google Chart API 動態產生放大版 QR Code (300x300)
const qrCodeApiUrl = computed(() => {
  const encodedUrl = encodeURIComponent(targetUrl.value);
  return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodedUrl}&choe=UTF-8`;
});

const handleOpen = () => {
  currentClicks.value += 1;
  gasApi.trackClick(props.app.id);
};

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