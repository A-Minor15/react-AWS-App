import { S3Uploader } from "./components/S3Uploader";
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

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
        <main style={{ padding: '20px' }}>
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

          <hr />

          {/* ログイン成功時のみ表示されるメインコンテンツ */}
          <S3Uploader />
        </main>
      )}
    </Authenticator>
  );
}

export default App;