import { ConfigProvider } from 'antd';
import BoardOverview from './components/dashboard/BoardOverview';

export default function App() {
  return (
    <ConfigProvider>
      <main className="app-content">
        <BoardOverview />
      </main>
    </ConfigProvider>
  );
}
