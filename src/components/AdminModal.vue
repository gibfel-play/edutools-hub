<template>
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-slate-800">管理後台 (資料編輯 / 隱藏 / 刪除)</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 cursor-pointer text-xl">✕</button>
      </div>

      <!-- 登入驗證區塊 -->
      <div v-if="!authenticated" class="py-12 flex flex-col items-center justify-center">
        <p class="text-sm text-slate-600 mb-3">請輸入管理密碼以開啟管理介面：</p>
        <form @submit.prevent="handleLogin" class="flex gap-2">
          <input
            v-model="token"
            type="password"
            placeholder="管理密碼"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50">
            {{ loading ? '驗證中...' : '登入管理' }}
          </button>
        </form>
      </div>

      <!-- 列表管理區塊 -->
      <div v-else class="flex-1 overflow-y-auto space-y-4 pr-1">
        <div v-if="loading" class="text-center py-10 text-slate-400">資料載入中...</div>
        
        <div v-else v-for="app in appList" :key="app.id" class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span class="text-xs text-slate-400">ID: {{ app.id }}</span>
            <span :class="['px-2 py-0.5 text-xs font-semibold rounded-md', app.status === 'hidden' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200']">
              {{ app.status === 'hidden' ? '🙈 已隱藏 (僅管理者可見)' : '👁️ 正常顯示中' }}
            </span>
          </div>

          <!-- 編輯表單欄位 -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">名稱 / 標題</label>
              <input
                v-model="app.title"
                type="text"
                class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">分類標籤</label>
              <input
                v-model="app.category"
                type="text"
                list="category-options"
                placeholder="選擇或直接輸入分類"
                class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
              <datalist id="category-options">
                <option value="英語學習"></option>
                <option value="行政輔助"></option>
                <option value="教學輔助"></option>
                <option value="評量測驗"></option>
                <option value="簡報圖表"></option>
                <option value="生活工具"></option>
                <option value="一般工具"></option>
              </datalist>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">說明描述</label>
              <input
                v-model="app.description"
                type="text"
                class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <!-- 操作按鈕列 -->
          <div class="flex justify-end items-center gap-2 pt-1">
            <button
              @click="saveApp(app)"
              class="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              💾 儲存修改內容
            </button>
            <button
              @click="toggleStatus(app)"
              :class="['px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer', app.status === 'hidden' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100']"
            >
              {{ app.status === 'hidden' ? '👁️ 取消隱藏' : '🙈 隱藏檔案' }}
            </button>
            <button
              @click="handleDelete(app.id)"
              class="px-3.5 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
            >
              🗑️ 刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { gasApi } from '../services/gasApi';

const emit = defineEmits(['close', 'refresh']);

const authenticated = ref(false);
const loading = ref(false);
const token = ref('');
const appList = ref([]);

const handleLogin = async () => {
  if (!token.value) return;
  loading.value = true;
  try {
    const data = await gasApi.getAllAppsAdmin(token.value);
    appList.value = data;
    authenticated.value = true;
  } catch (err) {
    alert('驗證失敗：' + err.message);
  } finally {
    loading.value = false;
  }
};

const saveApp = async (app) => {
  try {
    await gasApi.updateApp({
      token: token.value,
      app: app
    });
    alert('「' + app.title + '」修改成功！');
    emit('refresh');
  } catch (err) {
    alert('儲存失敗：' + err.message);
  }
};

const toggleStatus = async (app) => {
  const newStatus = app.status === 'hidden' ? 'published' : 'hidden';
  try {
    await gasApi.updateApp({
      token: token.value,
      app: { ...app, status: newStatus }
    });
    app.status = newStatus;
    emit('refresh');
  } catch (err) {
    alert('操作失敗：' + err.message);
  }
};

const handleDelete = async (id) => {
  if (!confirm('確定要永久刪除此項目嗎？')) return;
  try {
    await gasApi.deleteApp({ token: token.value, id });
    appList.value = appList.value.filter(a => a.id !== id);
    emit('refresh');
  } catch (err) {
    alert('刪除失敗：' + err.message);
  }
};
</script>