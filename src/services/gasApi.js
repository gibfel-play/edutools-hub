// 請替換為您第一階段部署獲得的 Web App URL
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyCveNdjufvdfmnjUCWUbkqTdDV7yxHWG5SD79mNnBPD_C9AGRa6R5g9SznoMlAqCgo/exec';

export const gasApi = {
  /**
   * 獲取所有公開的小程式清單
   */
  async getApps() {
    const res = await fetch(`${GAS_API_URL}?action=getApps`);
    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message);
    return json.data || json;
  },

  /**
   * 根據 fileId 獲取小程式 HTML 原始碼
   */
  async getAppContent(fileId) {
    const res = await fetch(`${GAS_API_URL}?action=getAppContent&fileId=${fileId}`);
    return await res.text();
  },

  /**
   * 上傳小程式
   */
  async uploadApp({ token, metadata, file }) {
    let contentBase64 = '';
    
    // 如果有檔案才進行 Base64 編碼
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
  }
}