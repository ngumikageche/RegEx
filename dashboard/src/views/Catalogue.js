import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Spinner, Card, ListGroup, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { UserContext } from "../context/UserContext";
import { NotificationContext } from "../context/NotificationContext";
import { FaEdit, FaTrash, FaBoxOpen, FaTags, FaSearch } from "react-icons/fa";

// Modal Component
const CatalogueModal = ({ show, onClose, title, children }) => (
  <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{children}</Modal.Body>
  </Modal>
);

CatalogueModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};


function Catalogue() {
  const { user } = useContext(UserContext);
  const { addNotification } = useContext(NotificationContext);
  const isAdmin = user?.role === "admin";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = "http://127.0.0.1:5000";
  const getToken = () => localStorage.getItem("auth_token");

 // Fetch categories
 const fetchCategories = useCallback(async () => {
 setIsLoading(true);
 try {
 const res = await fetch(`${API_BASE}/categories/`, {
 headers: { Authorization: `Bearer ${getToken()}` },
 });
 if (!res.ok) throw new Error("Failed to fetch categories");
 const data = await res.json();
 setCategories(data.categories || []);
 } catch (err) {
 addNotification({ message: err.message || "Error fetching categories", type: "error" });
 } finally {
 setIsLoading(false);
 }
 }, [addNotification]);

 // Fetch products
 const fetchProducts = useCallback(async () => {
 setIsLoading(true);
 try {
 const res = await fetch(`${API_BASE}/products/`, {
 headers: { Authorization: `Bearer ${getToken()}` },
 });
 if (!res.ok) throw new Error("Failed to fetch products");
 const data = await res.json();
 setProducts(data.products || []);
 } catch (err) {
 addNotification({ message: err.message || "Error fetching products", type: "error" });
 } finally {
 setIsLoading(false);
 }
 }, [addNotification]);

 // Initial data fetch
 useEffect(() => {
 fetchCategories();
 fetchProducts();
 }, [fetchCategories, fetchProducts]);

 // Add or update category
 const handleSaveCategory = async (e) => {
 e.preventDefault();
 if (!categoryName.trim()) {
 addNotification({ message: "Category name is required", type: "error" });
 return;
 }
 setIsLoading(true);
 const url = editCategory
 ? `${API_BASE}/categories/${editCategory.id}`
 : `${API_BASE}/categories/`;
 const method = editCategory ? "PUT" : "POST";
 try {
 const res = await fetch(url, {
 method,
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${getToken()}`,
 },
 body: JSON.stringify({ name: categoryName, description: categoryDesc }),
 });
 if (!res.ok) throw new Error(`Failed to ${editCategory ? "update" : "add"} category`);
 addNotification({
 message: `Category ${editCategory ? "updated" : "added"} successfully`,
 type: "success",
 });
 setCategoryName("");
 setCategoryDesc("");
 setEditCategory(null);
 setShowCategoryModal(false);
 fetchCategories();
 } catch (err) {
 addNotification({
 message: err.message || `Error ${editCategory ? "updating" : "adding"} category`,
 type: "error",
 });
 } finally {
 setIsLoading(false);
 }
 };

 // Delete category
 const handleDeleteCategory = async (id) => {
 if (!window.confirm("Are you sure you want to delete this category?")) return;
 setIsLoading(true);
 try {
 const res = await fetch(`${API_BASE}/categories/${id}`, {
 method: "DELETE",
 headers: { Authorization: `Bearer ${getToken()}` },
 });
 if (!res.ok) throw new Error("Failed to delete category");
 addNotification({ message: "Category deleted successfully", type: "success" });
 fetchCategories();
 } catch (err) {
 addNotification({ message: err.message || "Error deleting category", type: "error" });
 } finally {
 setIsLoading(false);
 }
 };

 // Add or update product
 const handleSaveProduct = async (e) => {
 e.preventDefault();
 if (!productName.trim() || !productPrice || !productCategory) {
 addNotification({ message: "Please fill in all required fields", type: "error" });
 return;
 }
 const price = parseFloat(productPrice);
 if (isNaN(price) || price < 0) {
 addNotification({ message: "Please enter a valid price", type: "error" });
 return;
 }
 const cat = categories.find((c) => c.name === productCategory);
 if (!cat) {
 addNotification({ message: "Selected category is invalid", type: "error" });
 return;
 }
 setIsLoading(true);
 const url = editProduct ? `${API_BASE}/products/${editProduct.id}` : `${API_BASE}/products/`;
 const method = editProduct ? "PUT" : "POST";
 try {
 const res = await fetch(url, {
 method,
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${getToken()}`,
 },
 body: JSON.stringify({
 name: productName,
 description: productDesc,
 price: price,
 category_id: cat.id,
 }),
 });
 if (!res.ok) throw new Error(`Failed to ${editProduct ? "update" : "add"} product`);
 addNotification({
 message: `Product ${editProduct ? "updated" : "added"} successfully`,
 type: "success",
 });
 setProductName("");
 setProductDesc("");
 setProductPrice("");
 setProductCategory("");
 setEditProduct(null);
 setShowProductModal(false);
 fetchProducts();
 } catch (err) {
 addNotification({
 message: err.message || `Error ${editProduct ? "updating" : "adding"} product`,
 type: "error",
 });
 } finally {
 setIsLoading(false);
 }
 };

 // Delete product
 const handleDeleteProduct = async (id) => {
 if (!window.confirm("Are you sure you want to delete this product?")) return;
 setIsLoading(true);
 try {
 const res = await fetch(`${API_BASE}/products/${id}`, {
 method: "DELETE",
 headers: { Authorization: `Bearer ${getToken()}` },
 });
 if (!res.ok) throw new Error("Failed to delete product");
 addNotification({ message: "Product deleted successfully", type: "success" });
 fetchProducts();
 } catch (err) {
 addNotification({ message: err.message || "Error deleting product", type: "error" });
 } finally {
 setIsLoading(false);
 }
 };

 // Edit category handler
 const handleEditCategory = (category) => {
 setEditCategory(category);
 setCategoryName(category.name);
 setCategoryDesc(category.description || "");
 setShowCategoryModal(true);
 };

 // Edit product handler
 const handleEditProduct = (product) => {
 setEditProduct(product);
 setProductName(product.name);
 setProductDesc(product.description || "");
 setProductPrice(product.price.toString());
 const category = categories.find((c) => c.id === product.category_id);
 setProductCategory(category ? category.name : "");
 setShowProductModal(true);
 };


  // Memoized filtered products
  const filteredProducts = useMemo(
    () =>
      products.filter((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );


  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4 fw-bold display-5">
        <FaBoxOpen className="me-2 text-primary" />Product Catalogue
      </h1>

      {/* Search Bar */}
      <div className="mb-4 d-flex justify-content-center align-items-center gap-2">
        <Form.Control
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-50"
          aria-label="Search products"
        />
        <FaSearch className="text-muted" />
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center mb-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      <div className="row g-4">
        {/* Category Section */}
        <div className="col-md-6">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <FaTags className="text-secondary" />
                <Card.Title as="h5" className="mb-0">Categories</Card.Title>
                <Badge bg="info" pill>{categories.length}</Badge>
              </div>
              {isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditCategory(null);
                    setCategoryName("");
                    setCategoryDesc("");
                    setShowCategoryModal(true);
                  }}
                  disabled={isLoading}
                >
                  + Add
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {categories.length === 0 && !isLoading && (
                  <ListGroup.Item className="text-muted text-center py-5">
                    <FaTags className="mb-2 text-secondary" style={{ fontSize: 32 }} />
                    <div>No categories available</div>
                  </ListGroup.Item>
                )}
                {categories.map((cat) => (
                  <ListGroup.Item key={cat.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-semibold">{cat.name}</span>
                      {cat.description && (
                        <div className="text-muted small">{cat.description}</div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="d-flex gap-1">
                        <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditCategory(cat)}
                            disabled={isLoading}
                            aria-label={`Edit ${cat.name} category`}
                          >
                            <FaEdit />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={isLoading}
                            aria-label={`Delete ${cat.name} category`}
                          >
                            <FaTrash />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </div>

        {/* Product Section */}
        <div className="col-md-6">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <FaBoxOpen className="text-success" />
                <Card.Title as="h5" className="mb-0">Products</Card.Title>
                <Badge bg="success" pill>{products.length}</Badge>
              </div>
              {isAdmin && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    setEditProduct(null);
                    setProductName("");
                    setProductDesc("");
                    setProductPrice("");
                    setProductCategory("");
                    setShowProductModal(true);
                  }}
                  disabled={isLoading}
                >
                  + Add
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {filteredProducts.length === 0 && !isLoading && (
                  <ListGroup.Item className="text-muted text-center py-5">
                    <FaBoxOpen className="mb-2 text-success" style={{ fontSize: 32 }} />
                    <div>No products available</div>
                  </ListGroup.Item>
                )}
                {filteredProducts.map((prod) => (
                  <ListGroup.Item key={prod.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-semibold">{prod.name}</span>
                      <div className="text-muted small">
                        {categories.find((c) => c.id === prod.category_id)?.name || "Unknown"} • $
                        {parseFloat(prod.price).toFixed(2)}
                      </div>
                      {prod.description && (
                        <div className="text-muted small">{prod.description}</div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="d-flex gap-1">
                        <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditProduct(prod)}
                            disabled={isLoading}
                            aria-label={`Edit ${prod.name} product`}
                          >
                            <FaEdit />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteProduct(prod.id)}
                            disabled={isLoading}
                            aria-label={`Delete ${prod.name} product`}
                          >
                            <FaTrash />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Category Modal */}
      <CatalogueModal
        show={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditCategory(null);
          setCategoryName("");
          setCategoryDesc("");
        }}
        title={editCategory ? "Edit Category" : "Add Category"}
      >
        <Form onSubmit={handleSaveCategory} autoComplete="off">
          <Form.Group className="mb-3" controlId="categoryName">
            <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="categoryDesc">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter description"
              value={categoryDesc}
              onChange={(e) => setCategoryDesc(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowCategoryModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editCategory ? "Update Category" : "Add Category"}
            </Button>
          </div>
        </Form>
      </CatalogueModal>

      {/* Product Modal */}
      <CatalogueModal
        show={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditProduct(null);
          setProductName("");
          setProductDesc("");
          setProductPrice("");
          setProductCategory("");
        }}
        title={editProduct ? "Edit Product" : "Add Product"}
      >
        <Form onSubmit={handleSaveProduct} autoComplete="off">
          <Form.Group className="mb-3" controlId="productName">
            <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="productDesc">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter description"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="productPrice">
            <Form.Label>Price <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter price"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="productCategory">
            <Form.Label>Category <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowProductModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editProduct ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </Form>
      </CatalogueModal>
    </div>
  );
}

export default Catalogue;