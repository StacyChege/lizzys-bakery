import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchAdminCategories,
  createCategory,
  deleteCategory,
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
} from '../../api/adminMenu';
import type Category from '../../types/Category';
import type AdminProduct from '../../types/AdminProduct';
import mediaUrl from '../../utils/mediaUrl';

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      const firstValue = Object.values(data as Record<string, unknown>)[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') return firstValue[0];
      if (typeof firstValue === 'string') return firstValue;
    }
  }
  return 'Something went wrong. Please try again.';
}

interface ProductFormState {
  category: number | '';
  name: string;
  description: string;
  base_price: string;
  available_flavours: string; // comma-separated in the form, split on save
  is_available: boolean;
  is_made_to_order: boolean;
}

const emptyProductForm: ProductFormState = {
  category: '',
  name: '',
  description: '',
  base_price: '',
  available_flavours: '',
  is_available: true,
  is_made_to_order: true,
};

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const [editingProductId, setEditingProductId] = useState<number | 'new' | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const loadAll = useCallback(() => {
    Promise.all([fetchAdminCategories(), fetchAdminProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .catch(() => setError('Could not load the menu.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createCategory(newCategoryName, newCategoryDescription);
      setNewCategoryName('');
      setNewCategoryDescription('');
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm('Delete this category? Products using it must be reassigned or deleted first.')) return;
    try {
      await deleteCategory(id);
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  function startEditProduct(product: AdminProduct) {
    setEditingProductId(product.id);
    setProductForm({
      category: product.category,
      name: product.name,
      description: product.description,
      base_price: product.base_price,
      available_flavours: product.available_flavours.join(', '),
      is_available: product.is_available,
      is_made_to_order: product.is_made_to_order,
    });
  }

  function startNewProduct() {
    setEditingProductId('new');
    setProductForm({ ...emptyProductForm, category: categories[0]?.id ?? '' });
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (productForm.category === '' || !productForm.name.trim() || !productForm.base_price) return;

    const payload = {
      category: productForm.category,
      name: productForm.name,
      description: productForm.description,
      base_price: productForm.base_price,
      available_flavours: productForm.available_flavours
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      available_sizes: [],
      is_available: productForm.is_available,
      is_made_to_order: productForm.is_made_to_order,
    };

    try {
      if (editingProductId === 'new') {
        await createProduct(payload);
        toast.success('Product added');
      } else if (typeof editingProductId === 'number') {
        await updateProduct(editingProductId, payload);
        toast.success('Product updated');
      }
      setEditingProductId(null);
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteProduct(id);
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleUploadImage(productId: number, file: File) {
    setIsUploadingImage(true);
    try {
      await uploadProductImage(productId, file);
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!confirm('Remove this photo?')) return;
    try {
      await deleteProductImage(imageId);
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function toggleAvailability(product: AdminProduct) {
    try {
      await updateProduct(product.id, { is_available: !product.is_available });
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? '—';

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto font-body">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-script text-4xl text-bakery-pink-dark">Menu Management</h1>
          <Link to="/admin" className="text-sm text-bakery-brown/60 hover:text-bakery-pink-dark underline">
            Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <p className="text-bakery-brown/60">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            {/* --- CATEGORIES --- */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border-t-4 border-bakery-brown">
              <h2 className="font-semibold text-bakery-brown mb-3">Categories</h2>
              <ul className="space-y-1 mb-4 text-sm">
                {categories.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-1">
                    <span className="text-bakery-brown">{c.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="text-bakery-brown/40 hover:text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="flex-1 border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="bg-bakery-brown text-white font-medium px-4 rounded-full text-sm hover:bg-bakery-pink-dark"
                >
                  Add
                </button>
              </form>
            </div>

            {/* --- PRODUCTS --- */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-bakery-pink-dark">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-bakery-brown">Products</h2>
                {editingProductId === null && (
                  <button
                    onClick={startNewProduct}
                    className="bg-bakery-pink-dark text-white font-medium px-4 py-1.5 rounded-full text-sm hover:bg-bakery-brown"
                  >
                    Add Product
                  </button>
                )}
              </div>

              {editingProductId !== null && (
                <form
                  onSubmit={handleSaveProduct}
                  className="border-2 border-dashed border-bakery-pink/40 rounded-2xl p-4 mb-4 space-y-3"
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={productForm.name}
                      onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                      className="border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm((f) => ({ ...f, category: Number(e.target.value) }))
                      }
                      className="border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Choose a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    placeholder="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Base price (KES)"
                      value={productForm.base_price}
                      onChange={(e) => setProductForm((f) => ({ ...f, base_price: e.target.value }))}
                      className="border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Flavours, comma separated"
                      value={productForm.available_flavours}
                      onChange={(e) =>
                        setProductForm((f) => ({ ...f, available_flavours: e.target.value }))
                      }
                      className="border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-4 text-sm text-bakery-brown">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={productForm.is_available}
                        onChange={(e) =>
                          setProductForm((f) => ({ ...f, is_available: e.target.checked }))
                        }
                      />
                      Available
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={productForm.is_made_to_order}
                        onChange={(e) =>
                          setProductForm((f) => ({ ...f, is_made_to_order: e.target.checked }))
                        }
                      />
                      Made to order
                    </label>
                  </div>
                  {typeof editingProductId === 'number' ? (
                    <div>
                      <p className="text-sm font-medium text-bakery-brown mb-2">Photos</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {products
                          .find((p) => p.id === editingProductId)
                          ?.images.map((img) => (
                            <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-bakery-pink/30 group">
                              <img src={mediaUrl(img.image) ?? undefined} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img.id)}
                                className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImage(editingProductId, file);
                          e.target.value = '';
                        }}
                        className="text-xs text-bakery-brown/70"
                      />
                      {isUploadingImage && <p className="text-xs text-bakery-brown/50 mt-1">Uploading…</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-bakery-brown/50">
                      Save the product first, then edit it again to add photos.
                    </p>
                  )}
                  <p className="text-xs text-bakery-brown/50">
                    Size options are still managed in the Django admin for now.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-bakery-pink-dark text-white font-medium px-5 py-2 rounded-full text-sm hover:bg-bakery-brown"
                    >
                      {editingProductId === 'new' ? 'Add Product' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProductId(null)}
                      className="text-bakery-brown/60 text-sm px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <ul className="divide-y divide-bakery-cream">
                {products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className={`font-medium text-bakery-brown truncate ${!p.is_available ? 'opacity-50' : ''}`}>
                        {p.name}
                      </p>
                      <p className="text-xs text-bakery-brown/50">
                        {categoryName(p.category)} · KES {Number(p.base_price).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => toggleAvailability(p)}
                        className={`text-xs px-3 py-1 rounded-full border ${
                          p.is_available
                            ? 'border-bakery-pink-dark text-bakery-pink-dark'
                            : 'border-bakery-brown/30 text-bakery-brown/50'
                        }`}
                      >
                        {p.is_available ? 'Available' : 'Sold Out'}
                      </button>
                      <button
                        onClick={() => startEditProduct(p)}
                        className="text-sm text-bakery-brown/60 hover:text-bakery-pink-dark"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-sm text-bakery-brown/40 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
