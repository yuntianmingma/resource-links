import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(password);
    if (ok) {
      navigate('/admin');
    } else {
      setError('密码错误');
      setPassword('');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2><Icon name="lock" size={22} /> 管理员登录</h2>
        <input
          type="password"
          placeholder="请输入管理员密码"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          autoFocus
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit">登录</button>
      </form>
    </div>
  );
}
