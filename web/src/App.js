import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TaskDetail } from './pages/TaskDetail';
import { TaskList } from './pages/TaskList';
export default function App() {
    return (_jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(TaskList, {}) }), _jsx(Route, { path: "/tasks/:id", element: _jsx(TaskDetail, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
