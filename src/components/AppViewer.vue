<template>
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
    <div class="bg-white w-full h-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 class="font-bold text-lg text-slate-800">{{ app.title }}</h2>
          <p class="text-xs text-slate-500">{{ app.category }}</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- 如果是外部連結，提供在新分頁開啟的按鈕 -->
          <a
            v-if="isExternalLink"
            :href="app.fileId"
            target="_blank"
            class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            title="在新分頁開啟"
          >
            新分頁開啟 ↗
          </a>
          <button
            @click="$emit('close')"
            class="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="關閉"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="flex-1 bg-white relative">
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-slate-500">載入應用中...</p>
          </div>
        </div>

        <iframe
          ref="iframeRef"
          :src="isExternalLink ? app.fileId : undefined"
          :srcdoc="!isExternalLink ? htmlContent : undefined"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
          class="w-full h-full border-0"
          @load="loading = false"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { gasApi } from '../services/gasApi';

const props = defineProps({ app: Object });
defineEmits(['close']);

const htmlContent = ref('');
const loading = ref(true);

// 判斷 fileId 是否為 http 開頭的網址
const isExternalLink = computed(() => {
  return props.app.fileId && props.app.fileId.startsWith('http');
});

onMounted(async () => {
  if (isExternalLink.value) {
    loading.value = false;
  } else {
    try {
      htmlContent.value = await gasApi.getAppContent(props.app.fileId);
    } catch (err) {
      alert('載入小程式失敗：' + err.message);
      loading.value = false;
    }
  }
});
</script>