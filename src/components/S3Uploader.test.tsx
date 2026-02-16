import { render, screen, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as S3Service from '../services/s3Service';
import { S3Uploader } from "./S3Uploader";

describe('S3Uploader', () => {
  // 各テストの前に実行
  beforeEach(() => {
    // 全てのMock関数の呼び出し履歴をクリア
    vi.clearAllMocks();
  });

  // テスト1: コンポーネントがレンダリングされる
  it('ファイル入力とボタンが表示される', () => {
    // 仮想DOMにレンダリング
    render(<S3Uploader />);

    // getByRole: DOM要素をアクセシビリティロール（役割）で検索
    expect(screen.getByRole('button', { name: "S3に送信" })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  // テスト2: ファイル選択でボタンが有効になる
  it('ファイルを選択するとボタンが有効になる', async () => {
    // ユーザーイベントをシミュレートするセットアップ
    const user = userEvent.setup();
    render(<S3Uploader />);

    // ファイルの入力要素を取得(hidden: trueで非表示のinput要素も対象にする)
    const fileInput = screen.getByLabelText('ファイル選択') as HTMLElement;

    // テスト用のダミーファイルを作成
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    // ユーザーがファイルを選択したアクションをシミュレート
    await user.upload(fileInput, file);

    // アップロードボタンを取得
    const uploadButton = screen.getByRole('button', { name: /S3/ });

    // ボタンが有効になるのを待機（最大1秒）してから、有効化を確認
    await waitFor(() => {
      expect(uploadButton).not.toBeDisabled();
    });
  });

  // テスト3: アップロード成功時
  it('ファイルをアップロード後、画像が表示される', async () => {
    const user = userEvent.setup();
    const mockViewUrl = 'https://s3.amazonaws.com/image.png';

    vi.spyOn(S3Service, 'uploadFileToS3').mockResolvedValue(mockViewUrl);

    render(<S3Uploader />);

    const fileInput = screen.getByLabelText('ファイル選択') as HTMLElement;
    const file = new File(['content'], 'test.png', {type: 'image/png'});
    await user.upload(fileInput, file);

    const uploadButton = screen.getByRole('button', { name: "S3に送信" });
    await user.click(uploadButton);

    // ファイル名が表示される
    await waitFor(() => {
      expect(screen.getByText(/アップロードファイル名/)).toBeInTheDocument();
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });

    // 画像が表示される
    const image = screen.getByAltText('Uploaded') as HTMLImageElement;
    expect(image.src).toBe(mockViewUrl);
  });

  // テスト4: エラーハンドリング
  it('アップロードがエラーになるとアラートが表示される', async () => {
    const user = userEvent.setup();
    // テスト用のダミーエラーを作成
    const mockError = new Error('アップロード失敗');

    // アップロード関数を失敗させるようにモック化
    vi.spyOn(S3Service, 'uploadFileToS3').mockRejectedValue(mockError);

    // alert関数の動作を記録するためのダミー関数
    const alertSpy = vi.fn();
    // グローバルのアラートをダミーに置き換える
    window.alert = alertSpy;

    render(<S3Uploader />);

    const fileInput = screen.getByLabelText('ファイル選択') as HTMLInputElement;
    const file = new File(['content'], 'test.txt');
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: "S3に送信" }));

    await waitFor(() => {
      // 特定の引数で呼ばれたかを確認
      expect(alertSpy).toHaveBeenCalledWith('アップロード失敗');
    });
  });

  // テスト5: ローディング状態
  it('アップロード中はボタンが「アップロード中...」状態になる', async () => {
    const user = userEvent.setup();

    vi.spyOn(S3Service, 'uploadFileToS3').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('url'), 100))
    );

    render(<S3Uploader />);

    const fileInput = screen.getByLabelText('ファイル選択') as HTMLInputElement;
    const file = new File(['content'], 'test.txt');
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: "S3に送信" }));

    await waitFor(() => {
      // 仮想DOMにアップロード中のボタンが存在しているかを確認
      expect(screen.getByRole('button', { name: "アップロード中..." })).toBeInTheDocument();
    });
  });
});