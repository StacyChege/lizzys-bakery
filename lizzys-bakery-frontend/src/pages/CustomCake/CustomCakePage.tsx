import { useState, type FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { submitCustomCakeRequest } from '../../api/customCakes';
import { isValidEmail } from '../../utils/validateForm';
import { earliestCakeDate } from '../../utils/dateRules';

export default function CustomCakePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateNeeded, setDateNeeded] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    if (!dateNeeded) errors.dateNeeded = 'Pick the date you need the cake by';
    if (!description.trim()) errors.description = 'Tell us a bit about what you have in mind';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !dateNeeded) return;

    setIsSubmitting(true);
    try {
      await submitCustomCakeRequest({
        name,
        email,
        phone_number: phone,
        date_needed: dateNeeded.toISOString().slice(0, 10),
        description,
        budget: budget ? Number(budget) : undefined,
      });
      setSubmitted(true);
    } catch {
      toast.error('Could not send your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-bakery-pink/10 py-20 px-4">
        <div className="max-w-lg mx-auto text-center font-body">
          <p className="font-script text-4xl text-bakery-pink-dark mb-3">Request sent!</p>
          <p className="text-bakery-brown/70">
            Thanks, {name.split(' ')[0]} — we'll be in touch at {email} to talk through the details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bakery-pink/10 py-12 px-4">
      <div className="relative max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-8 pt-10 border-2 border-dashed border-bakery-pink/40">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-bakery-pink-dark shadow-md" />

        <h1 className="font-script text-4xl text-bakery-pink-dark mb-2 text-center">Custom Cake Request</h1>
        <p className="text-bakery-brown/70 mb-8 text-center">
          Tell us what you're celebrating and we'll get back to you with a quote. Requests need
          at least 5 days notice.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
          />
          {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
        </div>

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
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
          />
          {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
        </div>

        <div>
          <DatePicker
            selected={dateNeeded}
            onChange={(date: Date | null) => setDateNeeded(date)}
            minDate={earliestCakeDate()}
            placeholderText="Date you need it by"
            className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
          />
          {fieldErrors.dateNeeded && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.dateNeeded}</p>
          )}
        </div>

        <div>
          <textarea
            placeholder="Describe the cake — occasion, flavour, size, theme, anything else that helps"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink resize-none"
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
          )}
        </div>

        <div>
          <input
            type="number"
            min="0"
            placeholder="Budget in KES (optional)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-bakery-pink-dark text-white font-semibold py-2.5 rounded-full hover:bg-bakery-brown transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Sending…' : 'Send Request'}
        </button>
        </form>
      </div>
    </div>
  );
}
