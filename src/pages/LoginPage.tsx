import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('ranger@example.com');
  const [password, setPassword] = useState('password123');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-forest-light/10 to-forest-green/10 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 h-10 w-10 rounded bg-forest-green" />
          <h1 className="text-xl font-semibold text-forest-green">AgriShield AI</h1>
          <p className="text-sm text-gray-600">Ranger Dashboard</p>
        </div>
        <label className="mb-3 block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="mb-4 w-full rounded border px-3 py-2 focus:border-forest-green focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="mb-3 block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          className="mb-6 w-full rounded border px-3 py-2 focus:border-forest-green focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded bg-forest-green px-4 py-2 font-medium text-white hover:bg-forest-hover disabled:opacity-60"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-3 text-center text-xs text-gray-500">Demo mode: any credentials work</p>
      </form>
    </div>
  );
};

export default LoginPage;
