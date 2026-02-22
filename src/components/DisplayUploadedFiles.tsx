import DeleteIcon from '@mui/icons-material/Delete';
import { Box } from "@mui/material";
import { DataGrid, GridActionsCellItem, type GridActionsColDef, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import type { FileItem } from "../services/s3Service";
import { DeleteFile, GetFilelist } from "../services/s3Service";
import { baseColumns } from "./fileColumns";

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

  const actionColumn: GridActionsColDef<FileItem> = {
    field: "actions",
    type: "actions",
    getActions: (params) => [
      <GridActionsCellItem
        key="delete"
        label="削除"
        showInMenu={false}
        icon={<DeleteIcon />}
        onClick={() => handleDelete(params.row.fileName)}
      />
    ],
    width: 120,
  };

  const columns: GridColDef[] = [...baseColumns, actionColumn];

  const handleDelete = async (key: string) => {
    if (!confirm(`本当に削除しますか？\n${key}`)) return;

    try {
      await DeleteFile(key);
      alert("削除しました");
      await handleGetFilelist(); // 再取得
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
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
          />
        </Box>
      )}

    </div>
  );
};