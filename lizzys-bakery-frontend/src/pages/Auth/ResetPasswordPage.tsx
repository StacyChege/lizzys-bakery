import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { confirmPasswordReset } from '../../api/auth';

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      const firstValue = Object.values(data as Record<string, unknown>)[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') return firstValue[0];
      if (typeof firstValue === 'string') return firstValue;
    }
  }
  return 'Could not reset your password. The link may have expired — request a new one.';
}

export default function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!uid || !token) return;

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(uid, token, newPassword);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="relative bg-white rounded-3xl shadow-lg p-8 pt-10 w-full max-w-sm border-2 border-dashed border-bakery-pink/40">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-bakery-pink-dark shadow-md" />

        <h1 className="font-script text-4xl text-bakery-pink-dark text-center mb-6">Reset Password</h1>

        {done ? (
          <p className="text-center text-bakery-brown/70 font-body text-sm">
            Your password has been reset. Taking you to sign in…
          </p>
        ) : (
          <>
            {error && (
              <p className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4 font-body">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-bakery-pink-dark text-white font-semibold py-2.5 rounded-full hover:bg-bakery-brown transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm font-body mt-5">
          <Link to="/login" className="text-bakery-pink-dark font-medium">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
