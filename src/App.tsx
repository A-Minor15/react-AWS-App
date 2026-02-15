import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { DisplayUploadedFiles } from "./components/DisplayUploadedFiles";
import { S3Uploader } from "./components/S3Uploader";

// Amplifyの設定
Amplify.configure({
  Auth: {
    Cognito: {
      // ユーザープールID
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      // アプリクライアントID
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      loginWith: {
        email: true
      }
    }
  }
});

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main style={{
          flexGrow: '1',
          }}>
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h1>My File Uploader</h1>
            <div style={{ textAlign: 'right' }}>
              <span>ユーザー： {user?.signInDetails?.loginId}</span>
              <button
                onClick={signOut}
                style={{ margin: '10px' }}
              >
                ログアウト
              </button>
            </div>
          </header>

          {/* ログイン成功時のみ表示されるメインコンテンツ */}
          <div className="content">
            <S3Uploader />
            <DisplayUploadedFiles />
          </div>

        </main>
      )}
    </Authenticator>
  );
}

export default App;