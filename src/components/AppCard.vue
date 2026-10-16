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

    <!-- 一律以新分頁開啟 Target URL -->
    <a
      :href="targetUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="w-full py-2.5 bg-slate-100 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
    >
      <span>開啟工具 ↗</span>
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { GAS_API_URL } from '../services/gasApi';

const props = defineProps({
  app: Object
});

// 計算要開啟的 URL：若為 http 開頭則直接開啟，否則透過 GAS getAppContent 網址開啟 HTML 檔案
const targetUrl = computed(() => {
  if (props.app.fileId && (props.app.fileId.startsWith('http://') || props.app.fileId.startsWith('https://'))) {
    return props.app.fileId;
  }
  return `${GAS_API_URL}?action=getAppContent&fileId=${props.app.fileId}`;
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
};
</script>