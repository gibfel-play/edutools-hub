<template>
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
    <div class="bg-white w-full h-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 class="font-bold text-lg text-slate-800">{{ app.title }}</h2>
          <p class="text-xs text-slate-500">{{ app.category }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="reloadIframe"
            class="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="重新載入"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <button
            @click="$emit('close')"
            class="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="關閉"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 bg-white relative">
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-slate-500">載入小程式中...</p>
          </div>
        </div>

        <iframe
          ref="iframeRef"
          :srcdoc="htmlContent"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
          class="w-full h-full border-0"
          @load="loading = false"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gasApi } from '../services/gasApi';

const props = defineProps({ app: Object });
defineEmits(['close']);

const htmlContent = ref('');
const loading = ref(true);
const iframeRef = ref(null);

onMounted(async () => {
  try {
    htmlContent.value = await gasApi.getAppContent(props.app.fileId);
  } catch (err) {
    alert('載入小程式失敗：' + err.message);
    loading.value = false;
  }
});

const reloadIframe = () => {
  if (iframeRef.value) {
    loading.value = true;
    iframeRef.value.srcdoc = htmlContent.value;
  }
};
</script>