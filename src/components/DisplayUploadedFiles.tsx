import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import type { FileItem } from "../services/s3Service";
import { GetFilelist, UpdateFileName } from "../services/s3Service";
import { columns } from "./fileColumns.ts";


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

  const handleProcessRowUpdate = async (newRow: FileItem, oldRow: FileItem) => {
    // 名前が変わっていない場合は何もしない
    if (newRow.fileName === oldRow.fileName) return oldRow;

    try {
      // APIを呼び出し、完了を待つ
      await UpdateFileName(oldRow.fileName, newRow.fileName);

      // 成功したらローカルの状態(files)を更新する
      const updatedFiles = files.map((file) =>
        file.fileName === oldRow.fileName ? newRow : file
      );
      setFiles(updatedFiles);
    } catch (err) {
      alert(`ファイル名の更新に失敗しました。`);
      // 失敗したら元の値に戻す
      return oldRow;
    }
  };

  return (
    <div>
      <div className="fileListArea">
        <h3>アップロード済みファイル一覧</h3>
        <button onClick={handleGetFilelist}>
          更新
        </button>
      </div>

      {files.length === 0 ? (
        <p>ファイルがありません。</p>
      ) : (
        <Box>
          <DataGrid
            rows={files}
            columns={columns}
            getRowId={(row) => row.fileName}
            processRowUpdate={handleProcessRowUpdate}
          />
        </Box>
      )}

    </div>
  );
};