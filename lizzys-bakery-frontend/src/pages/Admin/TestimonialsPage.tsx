import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../../api/testimonials';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import type { AdminTestimonial } from '../../types/Testimonial';

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      const firstValue = Object.values(data as Record<string, unknown>)[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') return firstValue[0];
    }
  }
  return 'Something went wrong. Please try again.';
}

export default function TestimonialsPage() {
  useDocumentTitle('Admin: Testimonials');

  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newAuthor, setNewAuthor] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [newOccasion, setNewOccasion] = useState('');

  const load = useCallback(() => {
    fetchAdminTestimonials()
      .then(setTestimonials)
      .catch(() => setError('Could not load testimonials.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newAuthor.trim() || !newQuote.trim()) return;
    try {
      await createTestimonial({
        author_name: newAuthor,
        quote: newQuote,
        occasion: newOccasion,
        is_published: true,
        sort_order: testimonials.length,
      });
      setNewAuthor('');
      setNewQuote('');
      setNewOccasion('');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function togglePublished(t: AdminTestimonial) {
    try {
      await updateTestimonial(t.id, { is_published: !t.is_published });
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    try {
      await deleteTestimonial(id);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto font-body">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-script text-4xl text-bakery-pink-dark">Testimonials</h1>
          <Link to="/admin" className="text-sm text-bakery-brown/70 hover:text-bakery-pink-dark underline">
            Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <p className="text-bakery-brown/70">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-bakery-pink-dark">
            <p className="text-xs text-bakery-brown/70 mb-4">
              These show on the homepage. Unpublished ones stay here but don't appear to customers.
            </p>

            {testimonials.length === 0 ? (
              <p className="text-bakery-brown/70 text-sm mb-6">No testimonials yet.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className={`border border-bakery-pink/20 rounded-xl p-4 ${!t.is_published ? 'opacity-60' : ''}`}
                  >
                    <p className="text-sm text-bakery-brown/80 mb-2">"{t.quote}"</p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-bakery-brown">
                        <span className="font-semibold">{t.author_name}</span>
                        {t.occasion && <span className="text-bakery-brown/70"> · {t.occasion}</span>}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePublished(t)}
                          className={`text-xs px-3 py-1 rounded-full border ${
                            t.is_published
                              ? 'border-bakery-pink-dark text-bakery-pink-dark'
                              : 'border-bakery-brown/30 text-bakery-brown/70'
                          }`}
                        >
                          {t.is_published ? 'Published' : 'Hidden'}
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-sm text-bakery-brown/70 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAdd} className="border-2 border-dashed border-bakery-pink/40 rounded-2xl p-4 space-y-3">
              <h2 className="font-semibold text-bakery-brown text-sm">Add a testimonial</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Customer name"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Occasion (optional), e.g. Wedding cake"
                  value={newOccasion}
                  onChange={(e) => setNewOccasion(e.target.value)}
                  className="border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <textarea
                placeholder="What they said"
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                rows={3}
                className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm resize-none"
              />
              <button
                type="submit"
                className="bg-bakery-pink-dark text-white font-medium px-5 py-2 rounded-full text-sm hover:bg-bakery-brown"
              >
                Add Testimonial
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
