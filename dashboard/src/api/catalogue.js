// API utility functions for catalogue
const API_BASE = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;
const getToken = () => localStorage.getItem("auth_token");

export async function fetchCategories() {
    const res = await fetch(`${API_BASE}/categories/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

export async function fetchProducts() {
    const res = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

export async function addCategory(data) {
    const res = await fetch(`${API_BASE}/categories/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: data.categoryName, description: data.categoryDesc, status: "Active" }),
    });
    if (!res.ok) throw new Error("Failed to add category");
    return res.json();
}

export async function deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to delete category");
    return res.json();
}

export async function addProduct(data, categories) {
    const cat = categories.find((c) => c.name === data.productCategory);
    if (!cat) throw new Error("Invalid category selected");
    const res = await fetch(`${API_BASE}/products/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
            name: data.productName,
            description: data.productDesc,
            price: data.productPrice,
            category_id: cat.id,
        }),
    });
    if (!res.ok) throw new Error("Failed to add product");
    return res.json();
}

export async function deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
}