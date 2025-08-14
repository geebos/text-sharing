import { ShareHistory } from './types';

const STORAGE_KEY = 'text-sharing-history';

/**
 * 获取分享历史记录
 * @returns ShareHistory[] 分享历史记录数组
 */
export const getHistory = (): ShareHistory[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('获取分享历史失败:', error);
    return [];
  }
};

/**
 * 添加新的分享历史记录
 * @param history ShareHistory 要添加的历史记录
 */
export const addHistory = (history: ShareHistory): void => {
  if (typeof window === 'undefined') return;
  try {
    const currentHistory = getHistory();
    // 检查是否已存在相同 id 的记录，避免重复添加
    const existingIndex = currentHistory.findIndex(item => item.id === history.id);
    if (existingIndex !== -1) {
      // 如果已存在，更新记录
      currentHistory[existingIndex] = history;
    } else {
      // 如果不存在，添加到数组开头（最新的在前面）
      currentHistory.unshift(history);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentHistory));
  } catch (error) {
    console.error('添加分享历史失败:', error);
  }
};

/**
 * 清空所有分享历史记录
 */
export const clearHistory = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('清空分享历史失败:', error);
  }
};

/**
 * 删除指定 id 的分享历史记录
 * @param id string 要删除的记录 id
 */
export const deleteHistory = (id: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const currentHistory = getHistory();
    const filteredHistory = currentHistory.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('删除分享历史失败:', error);
  }
};

/**
 * 获取有效的分享历史记录（未过期的）
 * @returns ShareHistory[] 有效的分享历史记录数组
 */
export const getValidHistory = (): ShareHistory[] => {
  const history = getHistory();
  const now = new Date();
  return history.filter(item => new Date(item.expiresAt) > now);
};

/**
 * 获取已过期的分享历史记录
 * @returns ShareHistory[] 已过期的分享历史记录数组
 */
export const getExpiredHistory = (): ShareHistory[] => {
  const history = getHistory();
  const now = new Date();
  return history.filter(item => new Date(item.expiresAt) <= now);
};

/**
 * 清理已过期的分享历史记录
 */
export const cleanExpiredHistory = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const validHistory = getValidHistory();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validHistory));
  } catch (error) {
    console.error('清理过期历史失败:', error);
  }
};
