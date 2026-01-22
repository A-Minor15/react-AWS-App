import { fetchAuthSession } from "aws-amplify/auth";

interface UploadResponse {
  uploadUrl: string;
  viewUrl: string;
}

/**
 * バックエンドから署名付きURLを取得し、S3へアップロード
 */
export const uploadFileToS3 = async (file: File): Promise<string> => {
  const endpoint = import.meta.env.VITE_API_ENDPOINT;

  // 現在のログインセッションから「IDトークン」を取得
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();

  if (!idToken) {
    throw new Error("ログインが必要です");
  }

  // バックエンドからURLを取得
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": idToken,
    },
    body: JSON.stringify({ fileName: file.name }),
  });

  if (!response.ok) {
    throw new Error(`APIエラー：${response.status}`)
  }

  const { uploadUrl, viewUrl }: UploadResponse = await response.json();

  // S3へ直接アップロード
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadRes.ok) throw new Error("S3へのアップロードに失敗しました");

  return viewUrl;
};