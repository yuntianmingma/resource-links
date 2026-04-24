import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Category from './pages/Category';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter basename="/resource-links">
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<Category />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
