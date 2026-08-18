import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validateForm';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');       // server/API error
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!email) errors.email = 'Email is required';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Password is required';   // no length check here — see note above
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // backend returns 401 for wrong credentials — show one generic message, don't reveal which field was wrong
      setError('Incorrect email or password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-bakery-cream px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm border border-bakery-pink/20">
        <h1 className="font-script text-4xl text-bakery-pink-dark text-center mb-1">Lizzy's Bakery</h1>
        <p className="font-body text-sm text-center text-bakery-brown/70 mb-6">Welcome back</p>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4 font-body">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-body">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-bakery-pink text-white font-semibold py-2 rounded-lg hover:bg-bakery-pink-dark transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm font-body mt-5 text-bakery-brown/70">
          Don't have an account? <Link to="/register" className="text-bakery-pink-dark font-medium">Register</Link>
        </p>
        <p className="text-center text-sm font-body mt-2">
          <Link to="/menu" className="text-bakery-brown/60 underline">Continue as guest</Link>
        </p>
      </div>
    </div>
  );
}