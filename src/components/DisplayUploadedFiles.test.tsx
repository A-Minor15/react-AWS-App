import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as S3Service from '../services/s3Service';
import { DisplayUploadedFiles } from "./DisplayUploadedFiles";

describe('DisplayUploadedFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期表示ではファイルをリストに表示しない', async () => {
    // 仮想DOMにレンダリング
    render(<DisplayUploadedFiles />);

    // h3タグ検証
    expect(screen.getByRole('heading', { level: 3, name: "アップロード済みファイル一覧"})).toBeInTheDocument();

    // 更新ボタン検証
    expect(screen.getByRole('button', { name: "更新" })).toBeInTheDocument();

    // ファイルなしの表示検証
    expect(screen.getByText("ファイルがありません。")).toBeInTheDocument();
  });

  it('更新ボタンを押すと、ファイル一覧が表示される', async () => {
    // モックデータを作成
    const mockFiles: S3Service.FileListResponse = {
      files: [
        {
          fileName: 'test-document.pdf',
          fileSize: 1024,
          lastModified: '2024-05-20T10:00:00Z',
        },
        {
          fileName: 'image.png',
          fileSize: 2048,
          lastModified: '2024-05-21T12:00:00Z',
        },
      ],
    };

    // GetFilelistの戻り値をモック化
    vi.spyOn(S3Service, 'GetFilelist').mockResolvedValue(mockFiles.files);

    // 仮想DOMにレンダリング
    render(<DisplayUploadedFiles />);

    // 更新ボタンを押下
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "更新" }));

    // テーブルヘッダー：ファイル名
    expect(screen.getByRole('columnheader', { name: "ファイル名" })).toBeInTheDocument();
    // テーブルヘッダー：サイズ(byte)
    expect(screen.getByRole('columnheader', { name: "サイズ(byte)" })).toBeInTheDocument();
    // テーブルヘッダー：最終更新日
    expect(screen.getByRole('columnheader', { name: "最終更新日" })).toBeInTheDocument();

    // テーブルデータを取得
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRows = rows.slice(1); // 先頭のヘッダ行を除去

    // テーブルデータの長さを検証
    expect(dataRows).toHaveLength(mockFiles.files.length);

    for (let i=0; i < dataRows.length; i++) {
      const file = mockFiles.files[i];

      // テーブルデータ: fileName
      expect(within(dataRows[i]).getByText(file.fileName)).toBeInTheDocument();
      // テーブルデータ: fileSize
      expect(within(dataRows[i]).getByText(file.fileSize.toLocaleString())).toBeInTheDocument();
      // テーブルデータ: lastModified
      const expectedDate = new Date(file.lastModified).toLocaleString();
      expect(within(dataRows[i]).getByText(expectedDate)).toBeInTheDocument();
    }
  });

  it('エラー時にアラートが表示される', async () => {
    // エラーをモック
    vi.spyOn(S3Service, 'GetFilelist').mockRejectedValue(new Error('テストエラー'));
    // アラートをモック化
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // 仮想DOMにレンダリング
    render(<DisplayUploadedFiles />);

    // 更新ボタン
    const updateButton = screen.getByRole('button', { name: "更新" });

    // 更新ボタンクリック
    const user = userEvent.setup();
    await user.click(updateButton);

    // テストエラーのalertが表示される
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('テストエラー');
    });
  })
});