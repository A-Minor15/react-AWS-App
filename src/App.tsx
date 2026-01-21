import { S3Uploader } from "./components/S3Uploader";

function App() {
  return (
    <div>
      <h1>Cloud Storage Manager</h1>
      <p>AWS Lambda & S3 を利用したセキュアなアップローダー</p>
      <S3Uploader />
    </div>
  );
}

export default App;