import type { GridColDef } from "@mui/x-data-grid";

export const columns: GridColDef[] = [
  {
    field: "fileName",
    headerName: "ファイル名",
    flex: 2,
    editable: true
  },
  {
    field: "fileSize",
    headerName: "サイズ(byte)",
    flex: 1,
    valueFormatter: (value: number) => value?.toLocaleString(),
  },
  {
    field: "lastModified",
    headerName: "最終更新日",
    flex: 1,
    valueFormatter: (value: string) => {
      if (!value) return '-';
      return new Date(value).toLocaleString();
    },
  }
];