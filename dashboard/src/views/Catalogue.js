import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { NotificationContext } from "../context/NotificationContext";
import { useContext } from "react";

function Catalogue() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useContext(NotificationContext);

  const API_BASE = "https://api.regisamtech.co.ke";
  const getToken = () => localStorage.getItem("auth_token");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        addNotification({ message: "Failed to fetch categories", type: "error" });
      }
    } catch (err) {
      addNotification({ message: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        addNotification({ message: "Failed to fetch products", type: "error" });
      }
    } catch (err) {
      addNotification({ message: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const handleAddCategory = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: data.categoryName, description: data.categoryDesc }),
      });
      if (res.ok) {
        setShowCategoryModal(false);
        fetchCategories();
        addNotification({ message: "Category added successfully", type: "success" });
      } else {
        addNotification({ message: "Failed to add category", type: "error" });
      }
    } catch (err) {
      addNotification({ message: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        fetchCategories();
        addNotification({ message: "Category deleted successfully", type: "success" });
      } else {
        addNotification({ message: "Failed to delete category", type: "error" });
      }
    } catch (err) {
      addNotification({ message: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (data) => {
    const cat = categories.find((c) => c.name === data.productCategory);
    if (!cat) {
      addNotification({ message: "Invalid category selected", type: "error" });
      return;
    }
    setLoading(true);
    try {
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
      if (res.ok) {
        setShowProductModal(false);
        fetchProducts();
        addNotification({ message: "Product added successfully", type: "success" });
      } else {
        addNotification({ message: "Failed to add product", type: "error" });
      }
    } catch (err) {
      addNotification({ message: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        fetchProducts();
        addNotification({ message: "Product deleted successfully", type: "success" });
      } else {
        addNotification({ message: "Failed to delete product", type: "error" });
      }
    } catch (err) {
      addNotification({ message: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const categoryForm = useForm();
  const productForm = useForm();

  return (
    <div className="content">
      <div className="container-fluid p-4">
        <h1 className="text-center mb-5 text-primary">Catalogue</h1>
        {loading && (
          <div className="d-flex justify-content-center mb-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
        <div className="row">
          <div className="col-lg-6 col-md-12 mb-4">
            <div className="card animate__animated animate__fadeIn">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="card-title">Categories</h3>
                  <Button
                    variant="primary"
                    onClick={() => setShowCategoryModal(true)}
                    className="btn-fill"
                  >
                    <i className="fas fa-plus me-2"></i> Add Category
                  </Button>
                </div>
              </div>
              <div className="card-body">
                {categories.length === 0 ? (
                  <p className="text-muted text-center">No categories yet.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {categories.map((cat) => (
                      <li
                        key={cat.id}
                        className="list-group-item animate__animated animate__fadeInLeft"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">{cat.name}</h5>
                            {cat.description && (
                              <p className="text-muted mb-0">{cat.description}</p>
                            )}
                          </div>
                          <Button
                            variant="link"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-danger"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-12 mb-4">
            <div className="card animate__animated animate__fadeIn">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="card-title">Items</h3>
                  <Button
                    variant="success"
                    onClick={() => setShowProductModal(true)}
                    className="btn-fill"
                  >
                    <i className="fas fa-plus me-2"></i> Add Item
                  </Button>
                </div>
              </div>
              <div className="card-body">
                {products.length === 0 ? (
                  <p className="text-muted text-center">No items yet.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {products.map((prod) => (
                      <li
                        key={prod.id}
                        className="list-group-item animate__animated animate__fadeInRight"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">{prod.name}</h5>
                            <p className="text-muted mb-0">
                              {categories.find((c) => c.id === prod.category_id)?.name ||
                                "Unknown"}{" "}
                              &bull; ${prod.price}
                            </p>
                            {prod.description && (
                              <p className="text-muted mb-0">{prod.description}</p>
                            )}
                          </div>
                          <Button
                            variant="link"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-danger"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

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
          <Modal.Header>
            <Modal.Title>Add Category</Modal.Title>
            <Button
              variant="link"
              onClick={() => {
                setShowCategoryModal(false);
                categoryForm.reset();
              }}
              className="text-muted"
            >
              <i className="fas fa-times"></i>
            </Button>
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
          <Modal.Header>
            <Modal.Title>Add Item</Modal.Title>
            <Button
              variant="link"
              onClick={() => {
                setShowProductModal(false);
                productForm.reset();
              }}
              className="text-muted"
            >
              <i className="fas fa-times"></i>
            </Button>
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