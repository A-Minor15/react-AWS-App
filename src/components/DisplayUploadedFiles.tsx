import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import type { FileItem } from "../services/s3Service";
import { GetFilelist } from "../services/s3Service";
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