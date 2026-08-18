import { useState, useEffect } from 'react';
import { fetchCategories } from '../../api/categories';
import fetchProducts  from '../../api/products';
import type Category from '../../types/Category';
import type Product from '../../types/Product';
import useDebounce from '../../hooks/useDebounce';
import ProductCard from '../../components/ProductCard';

export default function MenuPage() {
  // --- STATE ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // '' means "All Categories"
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 400); // Waits 400ms after user stops typing

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true); // Initial page load
  const [isFiltering, setIsFiltering] = useState(false); // Loading filtered results
  const [error, setError] = useState('');

  // --- 1. INITIAL LOAD (Runs ONCE when page opens) ---
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [categoriesData, productsData] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch {
        setError('Could not load the menu. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // --- 2. FILTERED FETCH (Runs whenever selectedCategory or debouncedSearch changes) ---
  useEffect(() => {
    // Skip this on the very first mount since loadInitialData already ran above
    if (isLoading) return;

    async function loadFilteredProducts() {
      setIsFiltering(true);
      try {
        // Send selectedCategory (or undefined if 'All') & debouncedSearch query to Django
        const filteredData = await fetchProducts(
          selectedCategory || undefined,
          debouncedSearch || undefined
        );
        setProducts(filteredData);
      } catch {
        setError('Failed to fetch filtered products.');
      } finally {
        setIsFiltering(false);
      }
    }

    loadFilteredProducts();
  }, [selectedCategory, debouncedSearch, isLoading]);

  // --- CONDITIONAL RENDERING (Initial Load) ---
  if (isLoading) {
    return (
      <div className="text-center py-20 font-body text-bakery-brown">
        Loading the menu…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 font-body text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-body">
      {/* Page Header */}
      <h1 className="font-script text-4xl text-bakery-pink-dark mb-6 text-center sm:text-left">
        Our Menu
      </h1>

      {/* --- SEARCH BAR --- */}
      <div className="mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-bakery-pink/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink text-bakery-brown placeholder:text-bakery-brown/40"
        />
      </div>

      {/* --- CATEGORY FILTER PILLS (Mobile horizontal scroll enabled) --- */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {/* 'All' Category Pill */}
        <button
          onClick={() => setSelectedCategory('')}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ''
              ? 'bg-bakery-pink text-white'
              : 'bg-bakery-cream text-bakery-brown hover:bg-bakery-pink/20'
          }`}
        >
          All
        </button>

        {/* Dynamic Category Pills fetched from Django */}
        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-bakery-pink text-white'
                  : 'bg-bakery-cream text-bakery-brown hover:bg-bakery-pink/20'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* --- PRODUCTS GRID --- */}
      {isFiltering ? (
        <div className="text-center py-12 text-bakery-brown/60">
          Updating menu...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-script text-3xl text-bakery-pink-dark mb-2">
            Nothing here yet!
          </p>
          <p className="text-bakery-brown/60">
            {debouncedSearch
              ? `No treats matching "${debouncedSearch}". Try a different search.`
              : selectedCategory
              ? "No products in this category right now — check back soon."
              : "The menu is empty. Please check back later."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}