import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// 各テスト後に自動でDOMをクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルなモック設定
vi.stubGlobal('alert', vi.fn());
