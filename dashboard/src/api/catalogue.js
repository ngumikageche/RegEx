// API base and token helper
const API_BASE = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "http://localhost:8000/api";
if (!API_BASE) throw new Error("API base URL is not configured.");

const getToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found. Please log in.");
  return token;
};

// Centralized error handling with retry for transient errors
async function handleApiResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Request failed: ${res.status} ${errorText}`);
  }
  return res.json();
}

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      return await handleApiResponse(res);
    } catch (err) {
      if (i === retries - 1 || !err.message.match(/502|503/)) {
        throw err;
      }
      console.warn(`[fetchWithRetry] Attempt ${i + 1} failed, retrying...`, err);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

// Upload image for a product
export async function uploadProductImage({ file, name = "default-image", color, product_id }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  if (color) formData.append("color", color);
  formData.append("product_id", product_id);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  try {
    return await fetchWithRetry(
      `${API_BASE}/images/upload`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
        signal: controller.signal,
      },
      3
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fetch images for a product
export async function fetchProductImages(product_id) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetchWithRetry(
      `${API_BASE}/images/${product_id}`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
        signal: controller.signal,
      },
      3
    );
    return { images: Array.isArray(res.images) ? res.images : [] };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fetch categories
export async function fetchCategories() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetchWithRetry(
      `${API_BASE}/categories/`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
        signal: controller.signal,
      },
      3
    );
    return { categories: Array.isArray(res.categories) ? res.categories : [] };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fetch products
export async function fetchProducts() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetchWithRetry(
      `${API_BASE}/products/`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
        signal: controller.signal,
      },
      3
    );
    return { products: Array.isArray(res.products) ? res.products : [] };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Add category
export async function addCategory(data) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    return await fetchWithRetry(
      `${API_BASE}/categories/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: data.categoryName,
          description: data.categoryDesc,
          status: "Active",
        }),
        signal: controller.signal,
      },
      3
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// Delete category
export async function deleteCategory(id) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    return await fetchWithRetry(
      `${API_BASE}/categories/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        signal: controller.signal,
      },
      3
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// Add product
export async function addProduct(data) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    return await fetchWithRetry(
      `${API_BASE}/products/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: data.productName,
          description: data.productDesc,
          price: parseFloat(data.productPrice),
          category_id: data.productCategory,
        }),
        signal: controller.signal,
      },
      3
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// Delete product
export async function deleteProduct(id) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    return await fetchWithRetry(
      `${API_BASE}/products/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        signal: controller.signal,
      },
      3
    );
  } finally {
    clearTimeout(timeoutId);
  }
}