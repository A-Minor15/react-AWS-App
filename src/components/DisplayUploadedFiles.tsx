import { useState } from "react";
import { GetFilelist } from "../services/s3Service";
import type { FileItem } from "../services/s3Service";

export const DisplayUploadedFiles = () => {
  const [files, setFiles] = useState<FileItem[]>([]);

  const handleGetFilelist = async () => {
    try {
      const filelist = await GetFilelist();

      setFiles(filelist);
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  };

  return (
    <div>
      <h3>アップロード済みファイル一覧</h3>
      <button onClick={handleGetFilelist}>更新</button>
      {files.length === 0 ? (
        <p>ファイルがありません。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ファイル名</th>
              <th>サイズ(byte)</th>
              <th>最終更新日</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.fileName}>
                <td>{file.fileName}</td>
                <td>{file.fileSize?.toLocaleString()}</td>
                <td>{file.lastModified ? new Date(file.lastModified).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
};