import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TaskDetail } from './pages/TaskDetail';
import { TaskList } from './pages/TaskList';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TaskList />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
