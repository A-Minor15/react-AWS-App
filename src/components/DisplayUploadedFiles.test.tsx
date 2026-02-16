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
    vi.spyOn(s3Service, 'UpdateFileName').mockResolvedValue(undefined);
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

  it('ファイル名のセルを編集して確定すると、更新関数が呼ばれる', async () => {
    const { user } = setup();

    // 更新ボタンを押下
    await user.click(screen.getByRole("button", { name: "更新" }));

    // 編集したいファイル名のセルを見つける
    const fileCell = await screen.findByRole('gridcell', { name: 'test-document.pdf' });

    // ダブルクリックして編集モードに以降
    await user.dblClick(fileCell);

    // 編集用の入力欄が表示されるのを待ち、新しいファイル名を入力
    const input = await screen.findByRole('textbox');
    await user.clear(input);
    await user.type(input, 'new-name.txt{enter}'); // Enterで確定

    // 表示が更新されているか確認
    expect(s3Service.UpdateFileName).toHaveBeenCalledWith('test-document.pdf', 'new-name.txt');
  });

  it('API更新が失敗した場合はエラーメッセージが表示される', async () => {
    vi.spyOn(s3Service, 'UpdateFileName').mockRejectedValue(new Error('更新失敗'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "更新" }));

    const fileCell = await screen.findByRole('gridcell', { name: 'test-document.pdf' });
    await user.dblClick(fileCell);
    await user.type(await screen.findByRole('textbox'), 'new-name.txt{enter}');
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('ファイル名の更新に失敗しました。');
    });
  });
});