import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function Login() {
  const { user, signIn, loading } = useAuth();
  const location = useLocation();

  // If already logged in, redirect to dashboard/tasks or their original destination
  if (user) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center bg-gradient-to-b from-indigo-50 to-white pb-6 border-b border-slate-100">
          <div className="mx-auto w-16 h-16 flex items-center justify-center mb-6">
            <Logo className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">工程時程管理系統</h1>
          <p className="text-sm text-slate-500">品洲科技有限公司 | 專案維護與廠區管理</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              系統存取限制
            </h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              為確保工程資料安全，請使用您的帳戶進行登入。<br />
              未經授權無法檢視或編輯專案時程。
            </p>
          </div>

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Mail className="w-5 h-5" />
            )}
            使用 Google 帳號登入 / 註冊
          </button>
          
          <p className="text-[10px] text-center text-slate-400 mt-6">
            點擊登入即表示您同意本系統之使用規範與隱私權政策。
          </p>
        </div>
      </div>
    </div>
  );
}
