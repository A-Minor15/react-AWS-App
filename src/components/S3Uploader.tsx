import { useRef, useState } from 'react';
import { uploadFileToS3 } from '../services/s3Service';

export const S3Uploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null); // 画像URL用のステート
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイルアップロード
  const handleUpload = async () => {
    if (!file) return; // ガード句

    const currentFileName = file.name;
    setIsUploading(true); // アップロード開始
    setImageUrl(null); // 前の画像を削除

    try {
      const viewUrl = await uploadFileToS3(file);

      setImageUrl(viewUrl);
      setUploadedFileName(currentFileName);

      setFile(null); // ステートをクリア
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // 実際のinput表示を空にする
      }
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <label>
        ファイル選択
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isUploading} // 通信中はファイル選択不可
        />
      </label>
      <button
        onClick={handleUpload}
        disabled={isUploading || !file}
      >
        {isUploading ? "アップロード中..." : "S3に送信"}
      </button>

      {/* アップロード完了後のファイル名表示 */}
      {uploadedFileName && !isUploading && (
        <p>
          アップロードファイル名： <strong>{uploadedFileName}</strong>
        </p>
      )}

      {/* URLがあれば画像を表示する */}
      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      )}
    </div>
  );
}