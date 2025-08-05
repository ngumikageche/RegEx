import React, { useState, useEffect, useCallback, useContext } from "react";
import { Modal, Button, Form, Spinner, Table, Nav } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { NotificationContext } from "../context/NotificationContext";
import {
  fetchCategories,
  fetchProducts,
  addCategory,
  deleteCategory,
  addProduct,
  deleteProduct
} from "../api/catalogue";

function Catalogue() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("productList"); // State to track active tab
  const { addNotification } = useContext(NotificationContext);

  const fetchCategoriesCallback = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data.categories || []);
    } catch (err) {
      addNotification({ message: err.message || "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchProductsCallback = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data.products || []);
    } catch (err) {
      addNotification({ message: err.message || "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchCategoriesCallback();
    fetchProductsCallback();
  }, [fetchCategoriesCallback, fetchProductsCallback]);

  const handleAddCategory = async (data) => {
    setLoading(true);
    try {
      await addCategory(data);
      setShowCategoryModal(false);
      fetchCategoriesCallback();
      addNotification({ message: "Category added successfully", type: "success" });
    } catch (err) {
      addNotification({ message: err.message || "Failed to add category", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    setLoading(true);
    try {
      await deleteCategory(id);
      fetchCategoriesCallback();
      addNotification({ message: "Category deleted successfully", type: "success" });
    } catch (err) {
      addNotification({ message: err.message || "Failed to delete category", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (data) => {
    setLoading(true);
    try {
      await addProduct(data, categories);
      setShowProductModal(false);
      fetchProductsCallback();
      addNotification({ message: "Product added successfully", type: "success" });
    } catch (err) {
      addNotification({ message: err.message || "Failed to add product", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      fetchProductsCallback();
      addNotification({ message: "Product deleted successfully", type: "success" });
    } catch (err) {
      addNotification({ message: err.message || "Failed to delete product", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const categoryForm = useForm();
  const productForm = useForm();

  // Calculate accurate counts
  const totalProducts = products.length;
  const currentUsedProducts = products.filter(prod => prod.status === "Active").length;

  return (
    <div className="content">
      <div className="container-fluid p-4">
        <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="productList" active={activeTab === "productList"} style={{ color: activeTab === "productList" ? "#6f42c1" : "#000" }}>
              Product List
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="manageCategories" active={activeTab === "manageCategories"} style={{ color: activeTab === "manageCategories" ? "#6f42c1" : "#000" }}>
              Manage Categories
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === "productList" && (
          <>
            {loading && (
              <div className="d-flex justify-content-center mb-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3>Products</h3>
                <div>
                  <Button variant="purple" style={{ marginRight: "10px" }} onClick={() => setShowProductModal(true)}>
                    Add new
                  </Button>
                  <Button variant="secondary">Import products</Button>
                  <Button variant="secondary" style={{ marginLeft: "10px" }}>Export products (Excel)</Button>
                  <Button variant="purple" style={{ marginLeft: "10px" }}><i className="fas fa-filter"></i></Button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <span>Total products: {totalProducts} | Current used: {currentUsedProducts}</span>
              </div>
              {loading ? (
                <div className="text-center"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Product name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Operation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">No products available.</td>
                      </tr>
                    ) : (
                      products.map((prod) => (
                        <tr key={prod.id}>
                          <td><img src={prod.photo || "https://via.placeholder.com/40"} alt="Product" style={{ width: "40px", height: "40px", borderRadius: "50%" }} /></td>
                          <td>{prod.name}</td>
                          <td>${prod.price || "0.00"}</td>
                          <td>{categories.find((c) => c.id === prod.category_id)?.name || "Unknown"}</td>
                          <td>
                            <span style={{ backgroundColor: prod.status === "Active" ? "#d4edda" : "#f8d7da", padding: "5px 10px", borderRadius: "10px", color: prod.status === "Active" ? "#155724" : "#721c24" }}>
                              {prod.status || "Active"}
                            </span>
                          </td>
                          <td><i className="fas fa-pen"></i> <i className="fas fa-trash" onClick={() => handleDeleteProduct(prod.id)} style={{ cursor: "pointer", marginLeft: "10px" }}></i></td>
                          <td><Button variant="primary" size="sm" onClick={() => {/* View logic */}}>View</Button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </div>
          </>
        )}

        {activeTab === "manageCategories" && (
          <>
            {loading && (
              <div className="d-flex justify-content-center mb-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3>Categories</h3>
                <div>
                  <Button variant="purple" style={{ marginRight: "10px" }} onClick={() => setShowCategoryModal(true)}>
                    Add new
                  </Button>
                  <Button variant="secondary">Import categories</Button>
                  <Button variant="secondary" style={{ marginLeft: "10px" }}>Export categories (Excel)</Button>
                  <Button variant="purple" style={{ marginLeft: "10px" }}><i className="fas fa-filter"></i></Button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <span>Total categories: {categories.length} | Current used: {categories.filter(c => c.status === "Active").length}</span>
              </div>
              {loading ? (
                <div className="text-center"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Operation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">No categories available.</td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id}>
                          <td><img src={cat.photo || "https://via.placeholder.com/40"} alt="Category" style={{ width: "40px", height: "40px", borderRadius: "50%" }} /></td>
                          <td>{cat.name}</td>
                          <td>{cat.description || "N/A"}</td>
                          <td>
                            <span style={{ backgroundColor: cat.status === "Active" ? "#d4edda" : "#f8d7da", padding: "5px 10px", borderRadius: "10px", color: cat.status === "Active" ? "#155724" : "#721c24" }}>
                              {cat.status || "Active"}
                            </span>
                          </td>
                          <td><i className="fas fa-pen"></i> <i className="fas fa-trash" onClick={() => handleDeleteCategory(cat.id)} style={{ cursor: "pointer", marginLeft: "10px" }}></i></td>
                          <td><Button variant="primary" size="sm" onClick={() => {/* View logic */}}>View</Button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </div>
          </>
        )}

        {/* Category Modal */}
        <Modal
          show={showCategoryModal}
          onHide={() => {
            setShowCategoryModal(false);
            categoryForm.reset();
          }}
          centered
          animation
          className="animate__animated animate__slideInUp"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={categoryForm.handleSubmit(handleAddCategory)}>
              <Form.Group className="mb-3" controlId="categoryName">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  {...categoryForm.register("categoryName", {
                    required: "Category name is required",
                  })}
                  isInvalid={!!categoryForm.formState.errors.categoryName}
                  placeholder="Enter category name"
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">
                  {categoryForm.formState.errors.categoryName?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="categoryDesc">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...categoryForm.register("categoryDesc")}
                  placeholder="Enter description"
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCategoryModal(false);
                    categoryForm.reset();
                  }}
                  className="btn-fill flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="btn-fill flex-1"
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "Add Category"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Product Modal */}
        <Modal
          show={showProductModal}
          onHide={() => {
            setShowProductModal(false);
            productForm.reset();
          }}
          centered
          animation
          className="animate__animated animate__slideInUp"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={productForm.handleSubmit(handleAddProduct)}>
              <Form.Group className="mb-3" controlId="productName">
                <Form.Label>Item Name</Form.Label>
                <Form.Control
                  {...productForm.register("productName", {
                    required: "Item name is required",
                  })}
                  isInvalid={!!productForm.formState.errors.productName}
                  placeholder="Enter item name"
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">
                  {productForm.formState.errors.productName?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="productDesc">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...productForm.register("productDesc")}
                  placeholder="Enter description"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="productPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  {...productForm.register("productPrice", {
                    required: "Price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                  })}
                  isInvalid={!!productForm.formState.errors.productPrice}
                  placeholder="Enter price"
                  step="0.01"
                />
                <Form.Control.Feedback type="invalid">
                  {productForm.formState.errors.productPrice?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="productCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  as="select"
                  {...productForm.register("productCategory", {
                    required: "Category is required",
                  })}
                  isInvalid={!!productForm.formState.errors.productCategory}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {productForm.formState.errors.productCategory?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowProductModal(false);
                    productForm.reset();
                  }}
                  className="btn-fill flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  type="submit"
                  className="btn-fill flex-1"
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "Add Item"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default Catalogue;