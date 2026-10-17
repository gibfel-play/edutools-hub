// 請替換為您第一階段部署獲得的 Web App URL
export const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyCveNdjufvdfmnjUCWUbkqTdDV7yxHWG5SD79mNnBPD_C9AGRa6R5g9SznoMlAqCgo/exec';

export const gasApi = {
  /**
   * 獲取公開的小程式清單
   */
  async getApps() {
    const res = await fetch(`${GAS_API_URL}?action=getApps`);
    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message);
    return json.data || json;
  },

  /**
   * 管理者獲取包含隱藏檔案的完整清單
   */
  async getAllAppsAdmin(token) {
    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getAllAppsAdmin', token })
    });
    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message);
    return json.data;
  },

  /**
   * 根據 fileId 獲取小程式 HTML 原始碼
   */
  async getAppContent(fileId) {
    const res = await fetch(`${GAS_API_URL}?action=getAppContent&fileId=${fileId}`);
    return await res.text();
  },

  /**
   * 上傳小程式 / 網址
   */
  async uploadApp({ token, metadata, file }) {
    let contentBase64 = '';
    
    if (file) {
      contentBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const payload = {
      action: 'uploadApp',
      token,
      metadata,
      file: {
        name: file ? file.name : '',
        contentBase64
      }
    };

    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message);
    return json.data;
  },

  /**
   * 刪除小程式
   */
  async deleteApp({ token, id }) {
    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteApp', token, id })
    });
    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message);
    return json;
  },

  /**
   * 更新小程式資料 (編輯標題、說明、分類、狀態/隱藏)
   */
  async updateApp({ token, app }) {
    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateApp', token, app })
    });
    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message);
    return json;
  }
};