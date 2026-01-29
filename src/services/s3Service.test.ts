import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadFileToS3 } from "./s3Service";

// =========モジュール全体をモック化==============
// vi.mock()は最初に実行されるため、ファイルの最上部に配置
vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn(),
}));

// モック化されたモジュールをインポート
import * as AuthModule from 'aws-amplify/auth';

describe('s3Service - uploadFileToS3', () => {
  // テスト実行前の処理
  beforeEach(() => {
    // 全てのMock関数の呼び出し履歴をクリア
    vi.clearAllMocks();
  });

  // テスト1: 正常系（ハッピーパス）
  // 目的: アップロード処理が正常に完了することを検証
  it('ファイルを正常にアップロード', async () => {
    // ========== Arrange（準備フェーズ） ==========
    // テストに必要なダミーデータを準備
    // ファイルオブジェクトをシミュレート
    // 第1引数: ファイルの内容, 第2引数: ファイル名, 第3引数: MIME type
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    // AWS Amplifyから返されるIDトークン（認証用）
    const mockIdToken = 'mock-id-token-123';

    // バックエンドから返されるS3アップロード用URL
    const mockUploadUrl = 'https://s3.amazonaws.com/upload-url';

    // アップロード完了後のファイル表示URL
    const mockViewUrl = 'https://s3.amazonaws.com/view-url';

    // ========== Mockの設定 ==========
    // AWS Amplifyの認証モック
    // 実際のAWS APIを呼び出さずに、テストデータを返す
    (AuthModule.fetchAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      tokens: {
        // IDトークン: ユーザー認証用
        idToken: {
          payload: {},
          toString: () => mockIdToken,
        },
        // アクセストークン: API呼び出し権限用
        accessToken: {
          payload: {},
          toString: () => 'mock-access-token',
        },
      },
    });

    // fetch関数をモック化（2回の呼び出しに対応）
    globalThis.fetch = vi.fn()
      // 1回目: バックエンドへのリクエスト（URLを取得）
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          uploadUrl: mockUploadUrl,
          viewUrl: mockViewUrl,
        }))
      )
      // 2回目: S3へのアップロードリクエスト
      .mockResolvedValueOnce(
        new Response('', { status: 200 })
      );

    // ========== Act（実行フェーズ） ==========
    // 実際にテスト対象の関数を実行
    const result = await uploadFileToS3(mockFile);

    // ========== Assert（検証フェーズ） ==========
    // テストの結果が期待通りか確認

    // 返り値がモックURLと一致することを確認
    expect(result).toBe(mockViewUrl);

    // fetch関数が正確に2回呼ばれたことを確認
    // （1回目: URL取得、2回目: S3アップロード）
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  // テスト2: エラーケース
  it('ログインしていない場合はエラーをスローする', async () => {
    const mockFile = new File(['test content'], 'test.txt');

    (AuthModule.fetchAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      tokens: undefined,
    });

    await expect(uploadFileToS3(mockFile)).rejects.toThrow('ログインが必要です');
  });

  // テスト3: APIエラーケース
  it('APIエラーの場合は例外をスローする', async () => {
    const mockFile = new File(['test content'], 'test.txt');
    const mockIdToken = 'mock-id-token-123';

    (AuthModule.fetchAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      tokens: {
        // IDトークン: ユーザー認証用
        idToken: {
          payload: {},
          toString: () => mockIdToken,
        },
        // アクセストークン: API呼び出し権限用
        accessToken: {
          payload: {},
          toString: () => 'mock-access-token',
        },
      },
    });

    // fetch関数をモック化（2回の呼び出しに対応）
    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      new Response('Not Found', { status: 404 })
    );

    await expect(uploadFileToS3(mockFile)).rejects.toThrow(
      'APIエラー：404'
    );
  });
});