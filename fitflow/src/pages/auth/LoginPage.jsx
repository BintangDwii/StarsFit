import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';

import Field from '../../components/ui/Field';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { demoMode, session, loading, signIn } = useAuth();

  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!demoMode && !loading && session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await signIn(values.email, values.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa email dan password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-brand">
          <div className="brand-icon"><Activity size={22} strokeWidth={2.5} /></div>
          <div>
            <strong>fitflow</strong>
            <span>PERSONAL TRAINING</span>
          </div>
        </div>

        <div className="login-heading">
          <h1>Selamat datang kembali</h1>
          <p>Masuk ke workspace personal training Anda.</p>
        </div>

        {demoMode ? (
          <div className="login-demo-notice">
            <strong>Demo mode aktif</strong>
            <span>
              Supabase belum terkonfigurasi. Aplikasi memakai data mock dan tidak
              memerlukan login. Salin <code>.env.example</code> ke <code>.env</code>{' '}
              untuk mengaktifkan autentikasi.
            </span>
            <button className="primary-button" onClick={() => navigate('/')}>
              Masuk ke dashboard <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <Field label="Email" required>
              <input
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) =>
                  setValues((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="nama@fitflow.test"
              />
            </Field>

            <Field label="Password" required>
              <input
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(event) =>
                  setValues((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="••••••••"
              />
            </Field>

            {error && <p className="login-error">{error}</p>}

            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
