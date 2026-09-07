import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api/auth';
import { isValidEmail } from '../../utils/validateForm';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !isValidEmail(email)) {
      setFieldError('Enter a valid email address');
      return;
    }
    setFieldError('');
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
    } finally {
      // Always show the same success state, whether or not the email is
      // registered — the backend deliberately doesn't reveal that either.
      setIsSubmitting(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="relative bg-white rounded-3xl shadow-lg p-8 pt-10 w-full max-w-sm border-2 border-dashed border-bakery-pink/40">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-bakery-pink-dark shadow-md" />

        <h1 className="font-script text-4xl text-bakery-pink-dark text-center mb-2">Forgot Password?</h1>

        {submitted ? (
          <p className="text-center text-bakery-brown/70 font-body text-sm">
            If an account exists for {email}, we've sent a link to reset your password. It
            expires in 30 minutes.
          </p>
        ) : (
          <>
            <p className="text-center text-bakery-brown/70 font-body text-sm mb-6">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
                {fieldError && <p className="text-red-500 text-xs mt-1">{fieldError}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-bakery-pink-dark text-white font-semibold py-2.5 rounded-full hover:bg-bakery-brown transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
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
