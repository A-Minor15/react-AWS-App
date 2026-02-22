import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as s3Service from '../services/s3Service';
import { DisplayUploadedFiles } from "./DisplayUploadedFiles";

// モックデータ
const MOCK_FILES = [
  {fileName: 'test-document.pdf', fileSize: 1024, lastModified: '2024-05-20T10:00:00Z' },
  {fileName: 'image.png', fileSize: 2048, lastModified: '2024-05-21T12:00:00Z' },
];

vi.mock('../services/s3Service', async () => ({
  UpdateFileName: vi.fn(),
  GetFilelist: vi.fn(),
}));

describe('DisplayUploadedFiles', () => {
  const setup = () => ({
    user: userEvent.setup(),
    ...render(<DisplayUploadedFiles />),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトで成功する値を設定
    vi.spyOn(s3Service, 'GetFilelist').mockResolvedValue(MOCK_FILES);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期表示ではファイルをリストに表示しない', async () => {
    setup();
    // h3タグ検証
    expect(screen.getByRole('heading', { level: 3, name: "アップロード済みファイル一覧"})).toBeInTheDocument();
    // 更新ボタン検証
    expect(screen.getByRole('button', { name: "更新" })).toBeInTheDocument();
    // ファイルなしの表示検証
    expect(screen.getByText("ファイルがありません。")).toBeInTheDocument();
  });

  it('更新ボタンを押すと、ファイル一覧が表示される', async () => {
    const { user } = setup();

    // 更新ボタンを押下;
    await user.click(screen.getByRole("button", { name: "更新" }));

    // テーブルヘッダーの存在確認
    ["ファイル名", "サイズ(byte)", "最終更新日"].forEach(text => {
      expect(screen.getByRole('columnheader', { name: text })).toBeInTheDocument();
    });

    MOCK_FILES.forEach(file => {
      expect(screen.getByText(file.fileName)).toBeInTheDocument();
      expect(screen.getByText(file.fileSize.toLocaleString())).toBeInTheDocument();
      const formattedDate = new Date(file.lastModified).toLocaleString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  it('エラー時にアラートが表示される', async () => {
    // エラーをモック
    vi.spyOn(s3Service, 'GetFilelist').mockRejectedValue(new Error('テストエラー'));
    // アラートをモック化
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { user } = setup();

    // 更新ボタン
    const updateButton = screen.getByRole('button', { name: "更新" });

    // 更新ボタンクリック
    await user.click(updateButton);

    // テストエラーのalertが表示される
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('テストエラー');
    });
  })
});