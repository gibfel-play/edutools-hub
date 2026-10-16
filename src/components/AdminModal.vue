<template>
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-slate-800">管理後台 (編輯 / 隱藏 / 刪除)</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
      </div>

      <!-- 登入驗證區塊 -->
      <div v-if="!authenticated" class="py-12 flex flex-col items-center justify-center">
        <p class="text-sm text-slate-600 mb-3">請輸入管理密碼以開啟管理介面：</p>
        <div class="flex gap-2">
          <input
            v-model="token"
            type="password"
            placeholder="管理密碼"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
          <button @click="authenticated = true" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium cursor-pointer">
            登入
          </button>
        </div>
      </div>

      <!-- 列表管理區塊 -->
      <div v-else class="flex-1 overflow-y-auto space-y-3 pr-1">
        <div v-for="app in appList" :key="app.id" class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-slate-800">{{ app.title }}</span>
              <span :class="['px-2 py-0.5 text-xs font-semibold rounded-md', app.status === 'hidden' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700']">
                {{ app.status === 'hidden' ? '隱藏中' : '顯示中' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 line-clamp-1">{{ app.description || '無描述' }}</p>
          </div>

          <!-- 操作按鈕 -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- 隱藏/顯示 切換 -->
            <button
              @click="toggleStatus(app)"
              class="px-3 py-1.5 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {{ app.status === 'hidden' ? '取消隱藏' : '隱藏' }}
            </button>

            <!-- 刪除按鈕 -->
            <button
              @click="handleDelete(app.id)"
              class="px-3 py-1.5 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors cursor-pointer"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gasApi } from '../services/gasApi';

const props = defineProps({ apps: Array });
const emit = defineEmits(['close', 'refresh']);

const authenticated = ref(false);
const token = ref('');
const appList = ref([]);

onMounted(() => {
  appList.value = JSON.parse(JSON.stringify(props.apps));
});

// 切換隱藏/顯示
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

// 刪除項目
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