<template>
  <div
    class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative border border-slate-200">
      <!-- 關閉按鈕 -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl cursor-pointer p-1"
      >
        ✕
      </button>

      <!-- 分類標籤 -->
      <span class="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 mb-2">
        {{ app.category || '未分類' }}
      </span>

      <!-- 標題與說明 -->
      <h4 class="text-lg font-bold text-slate-800 mb-1 px-4 leading-snug">{{ app.title }}</h4>
      <p class="text-xs text-slate-500 mb-4">請使用手機或平板相機掃描開啟</p>

      <!-- QR Code 圖片區域 -->
      <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-inner mb-4 flex items-center justify-center min-h-[256px]">
        <img
          :src="qrCodeApiUrl"
          :alt="app.title + ' QR Code'"
          class="w-64 h-64 object-contain"
          @error="handleImgError"
        />
      </div>

      <!-- 關閉視窗按鈕 -->
      <button
        @click="$emit('close')"
        class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all cursor-pointer"
      >
        關閉視窗
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  app: Object,
  gasApiUrl: String
});

defineEmits(['close']);

// 判斷是否為外部網址
const isExternalLink = computed(() => {
  return props.app.fileId && (props.app.fileId.startsWith('http://') || props.app.fileId.startsWith('https://'));
});

// 計算目標網址
const targetUrl = computed(() => {
  if (isExternalLink.value) {
    return props.app.fileId;
  }
  return `${props.gasApiUrl}?action=getAppContent&fileId=${props.app.fileId}`;
});

// 使用高相容性 QR Code API
const qrCodeApiUrl = computed(() => {
  const encodedUrl = encodeURIComponent(targetUrl.value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
});

const handleImgError = (e) => {
  const encodedUrl = encodeURIComponent(targetUrl.value);
  e.target.src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodedUrl}`;
};
</script>