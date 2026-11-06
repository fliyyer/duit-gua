import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icon';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = () => {
  const { login, register, loginWithGoogle, loginAsGuest, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const validate = () => {
    setErrorMsg('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Masukkan alamat email yang valid.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return false;
    }
    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Silakan masukkan nama atau panggilan Anda.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err: any) {
      console.error(err);
      let message = 'Terjadi kesalahan saat masuk. Periksa kembali email dan kata sandi.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Email atau kata sandi yang Anda masukkan salah.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email ini sudah terdaftar. Silakan gunakan tab Masuk.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter kombinasi.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Format email tidak valid.';
      } else if (err.message) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let message = 'Gagal masuk dengan Google.';

      if (err.code === 'auth/operation-not-allowed') {
        message = 'Provider Google belum diaktifkan di Firebase Console! Buka Firebase Console > Authentication > Sign-in method > klik Google > aktifkan (Enable) & simpan email support.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = `Domain '${window.location.hostname}' belum terdaftar di Authorized Domains Firebase! Buka Firebase Console > Authentication > Settings > Authorized domains > Tambahkan '${window.location.hostname}'.`;
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Pop-up login Google diblokir browser. Mohon izinkan jendela pop-up di browser Anda.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Proses login Google dibatalkan karena jendela ditutup.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Koneksi jaringan gagal saat menghubungi Google Auth. Periksa koneksi internet Anda.';
      } else if (err.message) {
        message = `${err.message} (${err.code || 'Google Auth Error'})`;
      }

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMsg('Masukkan email yang valid untuk reset kata sandi.');
      return;
    }
    setForgotLoading(true);
    setErrorMsg('');
    try {
      await resetPassword(forgotEmail.trim());
      setSuccessMsg(`Tautan reset kata sandi telah dikirim ke ${forgotEmail}`);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim email reset kata sandi.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fdfbf7] dark:bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground border-2 border-border shadow-brutal-md mb-1">
            <Icon name="wallet" className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Duit Gua
          </h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground max-w-xs mx-auto">
            Catat duit cerdas, anti bokek dan keuangan terencana dengan rapi.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border-2 border-border rounded-2xl shadow-brutal-md p-5 sm:p-7 space-y-5">
          {/* Tab Switcher: Masuk vs Daftar */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl border-2 border-border gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`py-2 text-xs sm:text-sm font-extrabold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-card text-foreground border-2 border-border shadow-brutal-xs'
                  : 'text-muted-foreground hover:text-foreground border-2 border-transparent'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`py-2 text-xs sm:text-sm font-extrabold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-card text-foreground border-2 border-border shadow-brutal-xs'
                  : 'text-muted-foreground hover:text-foreground border-2 border-transparent'
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border-2 border-destructive text-destructive text-xs font-bold flex items-start gap-2 shadow-brutal-xs">
              <Icon name="info" className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border-2 border-emerald-600 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-start gap-2 shadow-brutal-xs">
              <Icon name="check" className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground block">
                  Nama Lengkap / Panggilan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Icon name="user" className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rahmat"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-background border-2 border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-brutal-xs transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-foreground block">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Icon name="mail" className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-background border-2 border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-brutal-xs transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-foreground">
                  Kata Sandi
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Lupa sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Icon name="lock" className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-background border-2 border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-brutal-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground block">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Icon name="lock" className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi di atas"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-background border-2 border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-brutal-xs transition-all"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-border text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="text-xs font-bold text-muted-foreground select-none cursor-pointer">
                  Ingat sesi saya
                </label>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs sm:text-sm border-2 border-border shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Icon name={mode === 'login' ? 'log-in' : 'sparkles'} className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Masuk ke Duit Gua' : 'Buat Akun Gratis'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t-2 border-border w-full" />
            <span className="bg-card px-3 text-[11px] font-extrabold uppercase text-muted-foreground relative tracking-wider">
              atau
            </span>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-card hover:bg-accent text-foreground font-extrabold text-xs sm:text-sm border-2 border-border shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <Icon name="google" className="w-4 h-4" />
            <span>Lanjutkan dengan Google</span>
          </button>

          {/* Guest Mode Entry */}
          <div className="pt-1">
            <button
              type="button"
              onClick={loginAsGuest}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-extrabold text-xs border-2 border-amber-500/40 border-dashed transition-all flex items-center justify-center gap-2"
            >
              <Icon name="user" className="w-3.5 h-3.5" />
              <span>Masuk sebagai Tamu (Mode Offline Lokal)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-card border-2 border-border rounded-2xl shadow-brutal-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base font-heading">Reset Kata Sandi</h3>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-lg border-2 border-border flex items-center justify-center hover:bg-accent text-muted-foreground"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Masukkan alamat email Anda, kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3 py-2 text-xs bg-background border-2 border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-brutal-xs"
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold border-2 border-border rounded-xl hover:bg-accent"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 text-xs font-extrabold bg-primary text-primary-foreground border-2 border-border rounded-xl shadow-brutal-xs hover:bg-primary/90"
                >
                  {forgotLoading ? 'Mengirim...' : 'Kirim Tautan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
