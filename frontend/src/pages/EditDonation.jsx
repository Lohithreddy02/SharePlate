import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Utensils, ArrowLeft, AlertCircle, Save, Check } from 'lucide-react';
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

export const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('meals');
  const [safeCollectionDeadline, setSafeCollectionDeadline] = useState('');
  const [pickupStart, setPickupStart] = useState('');
  const [pickupEnd, setPickupEnd] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [allergens, setAllergens] = useState([]);
  const [dietaryType, setDietaryType] = useState('Vegetarian');
  const [storageCondition, setStorageCondition] = useState('Room Temperature');
  const [imageUrl, setImageUrl] = useState('');

  const toInputFormat = (dString) => {
    if (!dString) return '';
    const d = new Date(dString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    const fetchDonation = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/donations/${id}`);
        if (res.data?.success) {
          const d = res.data.donation;

          if (d.status !== 'available') {
            setError(`Cannot edit this donation because its current status is '${d.status}'. Only 'available' donations can be edited.`);
            setLoading(false);
            return;
          }

          setTitle(d.title);
          setDescription(d.description);
          setCategory(d.category);
          setQuantity(d.quantity);
          setUnit(d.unit);
          setSafeCollectionDeadline(toInputFormat(d.safeCollectionDeadline));
          setPickupStart(toInputFormat(d.pickupWindow?.start));
          setPickupEnd(toInputFormat(d.pickupWindow?.end));
          setStreet(d.pickupAddress?.street || '');
          setCity(d.pickupAddress?.city || '');
          setLandmark(d.pickupAddress?.landmark || '');
          setContactPhone(d.pickupAddress?.contactPhone || '');
          setAllergens(d.allergens || []);
          setDietaryType(d.dietaryType || 'Vegetarian');
          setStorageCondition(d.storageCondition || 'Room Temperature');
          setImageUrl(d.imageUrl || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load donation.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const toggleAllergen = (item) => {
    setAllergens((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const deadlineDate = new Date(safeCollectionDeadline);
    const windowEndDate = new Date(pickupEnd);
    const windowStartDate = new Date(pickupStart);

    if (deadlineDate <= new Date()) {
      setError('Safe collection deadline must be in the future.');
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

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        quantity: Number(quantity),
        unit,
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

      const res = await api.put(`/donations/${id}`, payload);
      if (res.data?.success) {
        navigate(`/donations/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update donation listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading donation for editing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-forest-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Edit Donation Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Update food attributes or pickup coordinates. Only unreserved listings can be edited.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Food Title / Item *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">
              Safe Collection Deadline *
            </label>
            <input
              type="datetime-local"
              required
              value={safeCollectionDeadline}
              onChange={(e) => setSafeCollectionDeadline(e.target.value)}
              className="w-full px-4 py-2.5 bg-amber-50/70 border border-amber-300 rounded-xl text-sm font-bold text-amber-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Start
              </label>
              <input
                type="datetime-local"
                required
                value={pickupStart}
                onChange={(e) => setPickupStart(e.target.value)}
                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup End
              </label>
              <input
                type="datetime-local"
                required
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pickup Street Address
            </label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Driver Contact Phone
            </label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
};

export default EditDonation;
