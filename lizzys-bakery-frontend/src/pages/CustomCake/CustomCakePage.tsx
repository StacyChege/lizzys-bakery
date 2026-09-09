import { useState, useEffect, type FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { submitCustomCakeRequest } from '../../api/customCakes';
import { fetchBlockedDates } from '../../api/orders';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { isValidEmail } from '../../utils/validateForm';
import { earliestAllowedDate, formatDateForApi, parseApiDate } from '../../utils/dateRules';

const TOTAL_STEPS = 7;
const MAX_REFERENCE_IMAGES = 3;

const OCCASION_OPTIONS = ['Wedding', 'Birthday', 'Graduation', 'Baby Shower', 'Anniversary', 'Other'];
const FLAVOUR_OPTIONS = ['Vanilla', 'Chocolate', 'Red Velvet', 'Lemon', 'Marble', 'Other'];
const FILLING_OPTIONS = ['Buttercream', 'Cream Cheese', 'Ganache', 'Fruit Compote', 'Other'];
const FROSTING_OPTIONS = ['Buttercream', 'Fondant', 'Drip Icing', 'Naked Cake', 'Other'];
const TOPPING_OPTIONS = ['Fresh Flowers', 'Macarons', 'Fresh Fruit', 'Edible Toppers', 'Custom Message/Name'];
const COLOUR_SWATCHES: { name: string; hex: string }[] = [
  { name: 'Pink', hex: '#F06292' },
  { name: 'Cream', hex: '#FFF3D6' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#E53935' },
  { name: 'Burgundy', hex: '#7B1E3A' },
  { name: 'Blue', hex: '#5B9BD5' },
  { name: 'Purple', hex: '#9B59B6' },
  { name: 'Green', hex: '#7CB342' },
  { name: 'Black', hex: '#2B2B2B' },
];

function resolveOther(preset: string, other: string): string {
  return preset === 'Other' ? other.trim() : preset;
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function CustomCakePage() {
  useDocumentTitle('Design Your Cake');
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');

  // Step 1 — Occasion
  const [occasion, setOccasion] = useState('');
  const [occasionOther, setOccasionOther] = useState('');

  // Step 2 — Size & Servings
  const [tierCount, setTierCount] = useState(1);
  const [servings, setServings] = useState('');

  // Step 3 — Flavour & Filling
  const [flavour, setFlavour] = useState('');
  const [flavourOther, setFlavourOther] = useState('');
  const [filling, setFilling] = useState('');
  const [fillingOther, setFillingOther] = useState('');

  // Step 4 — Frosting & Colour Theme
  const [frostingStyle, setFrostingStyle] = useState('');
  const [frostingOther, setFrostingOther] = useState('');
  const [colours, setColours] = useState<string[]>([]);

  // Step 5 — Toppings & Decoration
  const [toppings, setToppings] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');

  // Step 6 — Reference Photos
  const [referenceImages, setReferenceImages] = useState<File[]>([]);

  // Step 7 — Date Needed & Contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateNeeded, setDateNeeded] = useState<Date | null>(null);
  const [specialNotes, setSpecialNotes] = useState('');
  const [budget, setBudget] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchBlockedDates()
      .then((dates) => setBlockedDates(dates.map((d) => parseApiDate(d.date))))
      .catch(() => {});
  }, []);

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return occasion !== '' && (occasion !== 'Other' || occasionOther.trim() !== '');
      case 3:
        return (
          flavour !== '' && (flavour !== 'Other' || flavourOther.trim() !== '') &&
          filling !== '' && (filling !== 'Other' || fillingOther.trim() !== '')
        );
      case 4:
        return frostingStyle !== '' && (frostingStyle !== 'Other' || frostingOther.trim() !== '');
      default:
        return true;
    }
  }

  function goNext() {
    if (!canProceed()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleReferenceFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files).slice(0, MAX_REFERENCE_IMAGES - referenceImages.length);
    setReferenceImages((current) => [...current, ...incoming].slice(0, MAX_REFERENCE_IMAGES));
  }

  function removeReferenceImage(index: number) {
    setReferenceImages((current) => current.filter((_, i) => i !== index));
  }

  function validateStep7(): boolean {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    if (!dateNeeded) errors.dateNeeded = 'Pick the date you need the cake by';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep7() || !dateNeeded) return;

    setIsSubmitting(true);
    try {
      await submitCustomCakeRequest({
        name,
        email,
        phone_number: phone,
        date_needed: formatDateForApi(dateNeeded),
        occasion: resolveOther(occasion, occasionOther),
        tier_count: tierCount,
        servings: servings ? Number(servings) : undefined,
        flavour: resolveOther(flavour, flavourOther),
        filling: resolveOther(filling, fillingOther),
        frosting_style: resolveOther(frostingStyle, frostingOther),
        colour_theme: colours.join(', '),
        toppings: toppings.join(', '),
        custom_message: customMessage || undefined,
        special_notes: specialNotes || undefined,
        budget: budget ? Number(budget) : undefined,
        reference_images: referenceImages,
      });
      setFirstName(name.split(' ')[0]);
      setSubmitted(true);
    } catch {
      toast.error('Could not send your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center font-body">
          <p className="font-script text-4xl text-bakery-pink-dark mb-3">Request sent!</p>
          <p className="text-bakery-brown/70">
            Thanks, {firstName} — we'll be in touch at {email} to talk through the details and send you a quote.
          </p>
        </div>
      </div>
    );
  }

  const optionButtonClass = (isSelected: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
      isSelected
        ? 'bg-bakery-pink-dark text-white border-bakery-pink-dark'
        : 'bg-white text-bakery-brown border-bakery-pink/30 hover:border-bakery-pink-dark'
    }`;

  return (
    <div className="py-12 px-4">
      <div className="relative max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-8 pt-10 border-2 border-dashed border-bakery-pink/40">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-bakery-pink-dark shadow-md" />

        <h1 className="font-script text-4xl text-bakery-pink-dark mb-1 text-center">Design Your Cake</h1>
        <p className="text-bakery-brown/70 mb-6 text-center text-sm">
          A few quick questions and we'll send you a quote. Requests need at least 5 days notice.
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-bakery-brown/70 mb-1.5">
            <span>Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="h-1.5 bg-bakery-pink/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-bakery-pink-dark rounded-full transition-all"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1 — Occasion */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-bakery-brown">What's the occasion?</h2>
              <div className="flex flex-wrap gap-2">
                {OCCASION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOccasion(opt)}
                    className={optionButtonClass(occasion === opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {occasion === 'Other' && (
                <input
                  type="text"
                  placeholder="Tell us the occasion"
                  value={occasionOther}
                  onChange={(e) => setOccasionOther(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
              )}
            </div>
          )}

          {/* Step 2 — Size & Servings */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-bakery-brown mb-2">How many tiers?</h2>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTierCount(n)}
                      className={optionButtonClass(tierCount === n)}
                    >
                      {n} tier{n > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-bakery-brown mb-2">Roughly how many servings?</h2>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 30 (optional)"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
                <p className="text-xs text-bakery-brown/70 mt-1">
                  We'll send an estimated price range based on this before confirming a final quote.
                </p>
              </div>
            </div>
          )}

          {/* Step 3 — Flavour & Filling */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-bakery-brown mb-2">Sponge flavour</h2>
                <div className="flex flex-wrap gap-2">
                  {FLAVOUR_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFlavour(opt)}
                      className={optionButtonClass(flavour === opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {flavour === 'Other' && (
                  <input
                    type="text"
                    placeholder="Tell us the flavour"
                    value={flavourOther}
                    onChange={(e) => setFlavourOther(e.target.value)}
                    className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                  />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-bakery-brown mb-2">Filling</h2>
                <div className="flex flex-wrap gap-2">
                  {FILLING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFilling(opt)}
                      className={optionButtonClass(filling === opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {filling === 'Other' && (
                  <input
                    type="text"
                    placeholder="Tell us the filling"
                    value={fillingOther}
                    onChange={(e) => setFillingOther(e.target.value)}
                    className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 4 — Frosting & Colour Theme */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-bakery-brown mb-2">Frosting style</h2>
                <div className="flex flex-wrap gap-2">
                  {FROSTING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFrostingStyle(opt)}
                      className={optionButtonClass(frostingStyle === opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {frostingStyle === 'Other' && (
                  <input
                    type="text"
                    placeholder="Tell us the frosting style"
                    value={frostingOther}
                    onChange={(e) => setFrostingOther(e.target.value)}
                    className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                  />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-bakery-brown mb-2">Colour theme (pick any)</h2>
                <div className="flex flex-wrap gap-3">
                  {COLOUR_SWATCHES.map((c) => {
                    const isSelected = colours.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColours((cur) => toggleInList(cur, c.name))}
                        className="flex flex-col items-center gap-1"
                        title={c.name}
                      >
                        <span
                          className={`w-9 h-9 rounded-full border-2 ${
                            isSelected ? 'border-bakery-pink-dark scale-110' : 'border-bakery-brown/15'
                          } transition-transform`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[10px] text-bakery-brown/70">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5 — Toppings & Decoration */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-bakery-brown mb-2">Toppings & decoration (pick any)</h2>
                <div className="flex flex-wrap gap-2">
                  {TOPPING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setToppings((cur) => toggleInList(cur, opt))}
                      className={optionButtonClass(toppings.includes(opt))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-bakery-brown mb-2">Message to write on the cake</h2>
                <input
                  type="text"
                  placeholder="e.g. Happy Birthday Amani! (optional)"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
              </div>
            </div>
          )}

          {/* Step 6 — Reference Photos */}
          {step === 6 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-bakery-brown">
                Have a reference photo? (optional, up to {MAX_REFERENCE_IMAGES})
              </h2>
              <p className="text-xs text-bakery-brown/70">
                Upload a photo of a cake you love so we understand the look you're going for.
              </p>
              <div className="flex flex-wrap gap-2">
                {referenceImages.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-bakery-pink/30">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeReferenceImage(i)}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {referenceImages.length < MAX_REFERENCE_IMAGES && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-bakery-pink/40 flex items-center justify-center text-bakery-pink-dark text-2xl cursor-pointer hover:border-bakery-pink-dark">
                    +
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleReferenceFiles(e.target.files)}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Step 7 — Date Needed & Contact */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-bakery-brown">Date needed & your contact details</h2>
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <DatePicker
                  selected={dateNeeded}
                  onChange={(date: Date | null) => setDateNeeded(date)}
                  minDate={earliestAllowedDate()}
                  excludeDates={blockedDates}
                  placeholderText="Date you need it by"
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
                {fieldErrors.dateNeeded && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.dateNeeded}</p>
                )}
              </div>
              <div>
                <textarea
                  placeholder="Any special notes or allergies? (optional)"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  placeholder="Your budget in KES (optional)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-pink"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="flex items-center gap-1 text-sm text-bakery-brown/70 hover:text-bakery-pink-dark disabled:opacity-0"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                className="flex items-center gap-1 bg-bakery-pink-dark text-white font-semibold px-6 py-2.5 rounded-full hover:bg-bakery-brown transition-colors disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-bakery-pink-dark text-white font-semibold px-6 py-2.5 rounded-full hover:bg-bakery-brown transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Send Request'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
