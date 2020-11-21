import './App.css';
import '@shopify/polaris/dist/styles.css';
import { AppProvider, EmptyState } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import useToken from './useToken';

function App() {
  const { error, token, shopOrigin } = useToken();

  if (error) return <div>error</div>;

  if (!token) return <div>Loading...</div>;

  return (
    <div className="App">
      <AppProvider>
        <AppBridgeProvider config={{ apiKey: process.env.REACT_APP_API_KEY, shopOrigin, forceRedirect: !Boolean(process.env.REACT_APP_DEBUG_MODE) }}>
          <EmptyState
            heading="Manage your inventory transfers"
            action={{content: 'Add transfer'}}
            secondaryAction={{content: 'Learn more', url: 'https://help.shopify.com'}}
            image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
          >
            <p>Track and receive your incoming inventory from suppliers.</p>
          </EmptyState>
        </AppBridgeProvider>
      </AppProvider>      
    </div>
  );
}

export default App;
