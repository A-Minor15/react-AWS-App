import type { GridColDef } from "@mui/x-data-grid";

export const columns: GridColDef[] = [
  {
    field: "fileName",
    headerName: "ファイル名",
    flex: 1
  },
  {
    field: "fileSize",
    headerName: "サイズ[B]",
    flex: 1,
    valueFormatter: (value: number) => value?.toLocaleString(),
  },
  {
    field: "lastModified",
    headerName: "更新日",
    flex: 1,
    valueFormatter: (value: string) => {
      if (!value) return '-';
      return new Date(value).toLocaleString();
    },
  }
];