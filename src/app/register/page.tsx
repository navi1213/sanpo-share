"use client"
import { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('登録が完了しました！');
        // 登録成功後にログインページなどにリダイレクトする場合は以下を追加
        // window.location.href = '/login';
      } else {
        alert(`登録に失敗しました: ${data.message}`);
      }
    } catch (error) {
      alert('エラーが発生しました。もう一度お試しください。');
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">新規登録</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border rounded-md text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">パスワード</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border rounded-md text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">パスワード確認</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border rounded-md text-gray-700"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          登録
        </button>
      </form>
    </div>
  );
};

export default Register;
