<template>
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-slate-800">新增小程式 / 連結</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
      </div>

      <!-- 類型切換頁籤 -->
      <div class="flex bg-slate-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          @click="form.type = 'file'"
          :class="['flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer', form.type === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500']"
        >
          上傳 HTML 檔案
        </button>
        <button
          type="button"
          @click="form.type = 'link'"
          :class="['flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer', form.type === 'link' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500']"
        >
          新增網站連結
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">管理密碼</label>
          <input
            v-model="form.token"
            type="password"
            required
            placeholder="請輸入管理上傳金鑰"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">名稱</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="例如：單位轉換器 或 網站名稱"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">分類</label>
            <input
              v-model="form.category"
              type="text"
              placeholder="例如：行政輔助"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <!-- 動態切換：HTML 檔案選擇器 OR 網址輸入框 -->
          <div v-if="form.type === 'file'">
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">HTML 檔案</label>
            <input
              type="file"
              accept=".html"
              :required="form.type === 'file'"
              @change="handleFileChange"
              class="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>
          <div v-else>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">網站網址 (URL)</label>
            <input
              v-model="form.url"
              type="url"
              :required="form.type === 'link'"
              placeholder="https://example.com"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">簡短描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="說明此工具/網站的功能與用途..."
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          ></textarea>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="uploading"
            class="px-5 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {{ uploading ? '處理中...' : '確認新增' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { gasApi } from '../services/gasApi';

const emit = defineEmits(['close', 'uploaded']);

const uploading = ref(false);
const selectedFile = ref(null);

const form = reactive({
  type: 'file', // 'file' 或 'link'
  token: '',
  title: '',
  category: '一般工具',
  url: '',
  description: ''
});

const handleFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};

const handleSubmit = async () => {
  if (form.type === 'file' && !selectedFile.value) return;
  uploading.value = true;

  try {
    await gasApi.uploadApp({
      token: form.token,
      metadata: {
        type: form.type,
        title: form.title,
        category: form.category,
        url: form.url,
        description: form.description
      },
      file: form.type === 'file' ? selectedFile.value : null
    });

    alert('新增成功！');
    emit('uploaded');
    emit('close');
  } catch (err) {
    alert('新增失敗：' + err.message);
  } finally {
    uploading.value = false;
  }
};
</script>