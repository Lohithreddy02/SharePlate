import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  Clock, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Cooked Meals',
  'Bakery & Bread',
  'Fresh Produce',
  'Dairy Products',
  'Packaged Foods',
  'Beverages',
  'Other'
];

const UNITS = ['meals', 'kg', 'packets', 'servings', 'boxes', 'liters', 'portions'];
const ALLERGEN_OPTIONS = ['Dairy', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'];

// Preset photo options
const PRESET_IMAGES = [
  { label: 'Cooked Meals', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Artisan Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pasta / Casserole', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80' },
  { label: 'Breakfast Packs', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' }
];

export const CreateDonation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper to format default datetime strings (local ISO)
  const getInitialDates = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toInputFormat = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const prep = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const deadline = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const windowStart = now;
    const windowEnd = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    return {
      prep: toInputFormat(prep),
      deadline: toInputFormat(deadline),
      start: toInputFormat(windowStart),
      end: toInputFormat(windowEnd)
    };
  };

  const initialDates = getInitialDates();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [quantity, setQuantity] = useState(25);
  const [unit, setUnit] = useState('meals');
  const [preparationTime, setPreparationTime] = useState(initialDates.prep);
  const [safeCollectionDeadline, setSafeCollectionDeadline] = useState(initialDates.deadline);
  const [pickupStart, setPickupStart] = useState(initialDates.start);
  const [pickupEnd, setPickupEnd] = useState(initialDates.end);

  const [street, setStreet] = useState(user?.address || '');
  const [city, setCity] = useState('Metro City');
  const [landmark, setLandmark] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const [allergens, setAllergens] = useState([]);
  const [dietaryType, setDietaryType] = useState('Vegetarian');
  const [storageCondition, setStorageCondition] = useState('Hot/Heated');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleAllergen = (item) => {
    setAllergens((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-validations
    const deadlineDate = new Date(safeCollectionDeadline);
    const windowEndDate = new Date(pickupEnd);
    const windowStartDate = new Date(pickupStart);
    const now = new Date();

    if (deadlineDate <= now) {
      setError('Safe collection deadline must be a future date and time.');
      return;
    }

    if (windowEndDate <= windowStartDate) {
      setError('Pickup window end time must be after the start time.');
      return;
    }

    if (windowEndDate > deadlineDate) {
      setError('Pickup window cannot extend beyond the safe collection deadline.');
      return;
    }

    if (Number(quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        quantity: Number(quantity),
        unit,
        preparationTime: new Date(preparationTime).toISOString(),
        safeCollectionDeadline: deadlineDate.toISOString(),
        pickupWindow: {
          start: windowStartDate.toISOString(),
          end: windowEndDate.toISOString()
        },
        pickupAddress: {
          street: street.trim(),
          city: city.trim(),
          landmark: landmark.trim(),
          contactPhone: contactPhone.trim()
        },
        allergens,
        dietaryType,
        storageCondition,
        imageUrl: imageUrl.trim()
      };

      const res = await api.post('/donations', payload);
      if (res.data?.success) {
        navigate(`/donations/${res.data.donation._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish surplus food listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-forest-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Publish Surplus Food Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Specify quantity, preparation details, safe collection window, and pickup coordinates for verified recipient organizations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Basic Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-forest-800 flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            1. Food Item & Quantity
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Food Title / Menu Item *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 50 Servings of Fresh Vegetable Biryani with Raita"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Food Description & Packaging *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe preparation hygiene, whether it is packed in individual containers or large catering trays, reheating instructions, etc."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Dietary & Storage */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-forest-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            2. Dietary Attributes & Storage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dietary Type
              </label>
              <select
                value={dietaryType}
                onChange={(e) => setDietaryType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Eggitarian">Eggitarian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storage Condition
              </label>
              <select
                value={storageCondition}
                onChange={(e) => setStorageCondition(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              >
                <option value="Room Temperature">Room Temperature</option>
                <option value="Refrigerated">Refrigerated (Cold 4°C)</option>
                <option value="Hot/Heated">Hot/Heated (Warmers 60°C+)</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Declared Allergens (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((alg) => {
                const selected = allergens.includes(alg);
                return (
                  <button
                    key={alg}
                    type="button"
                    onClick={() => toggleAllergen(alg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selected
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    <span>{alg}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timestamps & Windows */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-forest-800 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            3. Safe Handling Timeframe & Pickup Window
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preparation Time *
              </label>
              <input
                type="datetime-local"
                required
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                Safe Collection Deadline * (Must pick up before)
              </label>
              <input
                type="datetime-local"
                required
                value={safeCollectionDeadline}
                onChange={(e) => setSafeCollectionDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-amber-50/60 border border-amber-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold text-amber-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Window Starts *
              </label>
              <input
                type="datetime-local"
                required
                value={pickupStart}
                onChange={(e) => setPickupStart(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Window Ends *
              </label>
              <input
                type="datetime-local"
                required
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Pickup Address */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-forest-800 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            4. Pickup Location & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 450 Oak Boulevard, Kitchen Backdoor"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Metro City"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Landmark / Specific Gate
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Loading Dock B"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Contact Phone for Driver *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Visual Image Presets */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-forest-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            5. Photo / Listing Image
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setImageUrl(preset.url)}
                className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all group ${
                  imageUrl === preset.url ? 'border-forest-700 ring-2 ring-forest-400' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-[10px] text-white font-bold text-center px-1">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custom Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.example.com/food.jpg"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
        >
          {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span>Publish Surplus Food Listing</span>
        </button>
      </form>
    </div>
  );
};

export default CreateDonation;
