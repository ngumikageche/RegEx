import React, { useState, useEffect } from "react";

function Catalogue() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDesc, setCategoryDesc] = useState("");
    const [productName, setProductName] = useState("");
    const [productDesc, setProductDesc] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productCategory, setProductCategory] = useState("");

    const API_BASE = "http://127.0.0.1:5000";
    const getToken = () => localStorage.getItem("auth_token");

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        // eslint-disable-next-line
    }, []);

    const fetchCategories = async() => {
        try {
            const res = await fetch(`${API_BASE}/categories/`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (err) {}
    };

    const fetchProducts = async() => {
        try {
            const res = await fetch(`${API_BASE}/products/`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (err) {}
    };

    const handleAddCategory = async(e) => {
        e.preventDefault();
        if (!categoryName) return;
        try {
            const res = await fetch(`${API_BASE}/categories/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ name: categoryName, description: categoryDesc }),
            });
            if (res.ok) {
                setCategoryName("");
                setCategoryDesc("");
                fetchCategories();
            }
        } catch (err) {}
    };

    const handleDeleteCategory = async(id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            const res = await fetch(`${API_BASE}/categories/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) fetchCategories();
        } catch (err) {}
    };

    const handleAddProduct = async(e) => {
        e.preventDefault();
        if (!productName || !productPrice || !productCategory) return;
        const cat = categories.find((c) => c.name === productCategory);
        if (!cat) return;
        try {
            const res = await fetch(`${API_BASE}/products/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    name: productName,
                    description: productDesc,
                    price: productPrice,
                    category_id: cat.id,
                }),
            });
            if (res.ok) {
                setProductName("");
                setProductDesc("");
                setProductPrice("");
                setProductCategory("");
                fetchProducts();
            }
        } catch (err) {}
    };

    const handleDeleteProduct = async(id) => {
        if (!window.confirm("Delete this item?")) return;
        try {
            const res = await fetch(`${API_BASE}/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) fetchProducts();
        } catch (err) {}
    };

    return ( <
            div className = "max-w-5xl mx-auto p-6" >
            <
            h1 className = "text-3xl font-bold mb-8 text-center" > Catalogue < /h1> <
            div className = "flex flex-col md:flex-row gap-8" > { /* Category Section */ } <
            div className = "flex-1 bg-white rounded-lg shadow p-6" >
            <
            h2 className = "text-xl font-semibold mb-4" > Add Category < /h2> <
            form onSubmit = { handleAddCategory }
            className = "space-y-4 mb-6" >
            <
            input type = "text"
            placeholder = "Category Name"
            value = { categoryName }
            onChange = {
                (e) => setCategoryName(e.target.value)
            }
            required className = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" /
            >
            <
            textarea placeholder = "Description"
            value = { categoryDesc }
            onChange = {
                (e) => setCategoryDesc(e.target.value)
            }
            className = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" /
            >
            <
            button type = "submit"
            className = "w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition" >
            Add Category <
            /button> < /
            form > <
            h3 className = "text-lg font-medium mb-2" > Categories < /h3> <
            ul className = "space-y-2" > {
                categories.length === 0 && ( <
                    li className = "text-gray-400" > No categories yet. < /li>
                )
            } {
                categories.map((cat) => ( <
                    li key = { cat.id }
                    className = "bg-gray-100 rounded px-3 py-2 flex flex-col" >
                    <
                    span className = "font-semibold" > { cat.name } < /span> {
                    cat.description && < span className = "text-sm text-gray-600" > { cat.description } < /span>} <
                    button onClick = {
                        () => handleDeleteCategory(cat.id)
                    }
                    className = "mt-2 self-end text-xs text-red-500 hover:underline" >
                    Delete <
                    /button> < /
                    li >
                ))
            } <
            /ul> < /
            div >

            { /* Product Section */ } <
            div className = "flex-1 bg-white rounded-lg shadow p-6" >
            <
            h2 className = "text-xl font-semibold mb-4" > Add Item < /h2> <
            form onSubmit = { handleAddProduct }
            className = "space-y-4 mb-6" >
            <
            input type = "text"
            placeholder = "Item Name"
            value = { productName }
            onChange = {
                (e) => setProductName(e.target.value)
            }
            required className = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" /
            >
            <
            textarea placeholder = "Description"
            value = { productDesc }
            onChange = {
                (e) => setProductDesc(e.target.value)
            }
            className = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" /
            >
            <
            input type = "number"
            placeholder = "Price"
            value = { productPrice }
            onChange = {
                (e) => setProductPrice(e.target.value)
            }
            required min = "0"
            step = "0.01"
            className = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" /
            >
            <
            select value = { productCategory }
            onChange = {
                (e) => setProductCategory(e.target.value)
            }
            required className = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" >
            <
            option value = "" > Select Category < /option> {
            categories.map((cat) => ( <
                option key = { cat.id }
                value = { cat.name } > { cat.name } <
                /option>
            ))
        } <
        /select> <
    button
    type = "submit"
    className = "w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition" >
        Add Item <
        /button> < /
    form > <
        h3 className = "text-lg font-medium mb-2" > Items < /h3> <
    ul className = "space-y-2" > {
            products.length === 0 && ( <
                li className = "text-gray-400" > No items yet. < /li>
            )
        } {
            products.map((prod) => ( <
                li key = { prod.id }
                className = "bg-gray-100 rounded px-3 py-2 flex flex-col" >
                <
                span className = "font-semibold" > { prod.name } < /span> <
                span className = "text-sm text-gray-600" > {
                    (() => {
                        const cat = categories.find((c) => c.id === prod.category_id);
                        return cat ? cat.name : "Unknown";
                    })()
                } & bull; $ { prod.price } <
                /span> {
                prod.description && < span className = "text-xs text-gray-500 mt-1" > { prod.description } < /span>} <
                button onClick = {
                    () => handleDeleteProduct(prod.id)
                }
                className = "mt-2 self-end text-xs text-red-500 hover:underline" >
                Delete <
                /button> < /
                li >
            ))
        } <
        /ul> < /
    div > <
        /div> < /
    div >
);
}

export default Catalogue;