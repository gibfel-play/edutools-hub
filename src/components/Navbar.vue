<template>
  <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
        H
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800">MJES EduTools Hub</h1>
        <p class="text-xs text-slate-500">教育應用小工具</p>
      </div>
    </div>

    <div class="flex flex-1 max-w-xl items-center gap-3">
      <div class="relative flex-1">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="搜尋小程式或關鍵字..."
          class="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all outline-none"
        />
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>

      <select
        :value="selectedCategory"
        @change="$emit('update:selectedCategory', $event.target.value)"
        class="px-3 py-2 bg-slate-100 hover:bg-slate-200/70 border border-transparent focus:border-indigo-500 rounded-xl text-sm text-slate-700 transition-all outline-none"
      >
        <option value="">全部分類</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <button
      @click="$emit('openUpload')"
      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      上傳小程式
    </button>
  </header>
</template>

<script setup>
defineProps({
  searchQuery: String,
  selectedCategory: String,
  categories: Array
});
defineEmits(['update:searchQuery', 'update:selectedCategory', 'openUpload']);
</script>