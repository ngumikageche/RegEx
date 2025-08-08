import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Modal, Button, Form, Spinner, Table, Nav, Placeholder } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { NotificationContext } from "../context/NotificationContext";
import {
  fetchCategories,
  fetchProducts,
  addCategory,
  deleteCategory,
  addProduct,
  deleteProduct,
  uploadProductImage,
  fetchProductImages,
} from "../api/catalogue";
import { debounce } from "lodash";

function Catalogue() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productImages, setProductImages] = useState({}); // { [productId]: imageUrl }
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductViewModal, setShowProductViewModal] = useState(false);
  const [showCategoryViewModal, setShowCategoryViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [productImageFile, setProductImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState("productList");
  const { addNotification } = useContext(NotificationContext);

  // Memoize addNotification to ensure stability
  const memoizedAddNotification = useMemo(() => addNotification, [addNotification]);

  const fetchCategoriesCallback = useCallback(
    debounce(async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategories();
        setCategories(data.categories || []);
      } catch (err) {
        const message = err.message.includes("401") ? "Please log in to fetch categories" : err.message || "Network error";
        memoizedAddNotification({ message, type: "error" });
      } finally {
        setLoadingCategories(false);
      }
    }, 500), // Increased debounce delay
    [memoizedAddNotification]
  );

  const fetchProductsCallback = useCallback(
    debounce(async () => {
      setLoadingProducts(true);
      try {
        const data = await fetchProducts();
        const prods = data.products || [];
        const imagesMap = { ...productImages }; // Preserve existing images
        await Promise.all(
          prods.map(async (prod) => {
            if (!imagesMap[prod.id]) { // Skip if image already cached
              try {
                const imgRes = await fetchProductImages(prod.id);
                if (imgRes.images && imgRes.images.length > 0) {
                  imagesMap[prod.id] = imgRes.images[0].url;
                }
              } catch (e) {
                memoizedAddNotification({ message: `Failed to load image for product ${prod.name}`, type: "error" });
              }
            }
          })
        );
        React.startTransition(() => {
          setProducts(prods);
          setProductImages(imagesMap);
        });
      } catch (err) {
        const message = err.message.includes("401") ? "Please log in to fetch products" : err.message || "Network error";
        memoizedAddNotification({ message, type: "error" });
      } finally {
        setLoadingProducts(false);
      }
    }, 50000),
    [memoizedAddNotification, productImages]
  );

  useEffect(() => {
    fetchCategoriesCallback();
    fetchProductsCallback();
    return () => {
      fetchCategoriesCallback.cancel();
      fetchProductsCallback.cancel();
    };
  }, [fetchCategoriesCallback, fetchProductsCallback]);

  const handleAddCategory = async (data) => {
    setLoadingAction(true);
    try {
      const newCategory = await addCategory(data);
      setShowCategoryModal(false);
      categoryForm.reset();
      // Optimistic update
      setCategories((prev) => [...prev, { id: newCategory.id, name: data.categoryName, description: data.categoryDesc, status: "Active" }]);
      memoizedAddNotification({ message: "Category added successfully", type: "success" });
    } catch (err) {
      const message = err.message.includes("401") ? "Please log in to add a category" : err.message || "Failed to add category";
      memoizedAddNotification({ message, type: "error" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    setLoadingAction(true);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id)); // Optimistic update
      memoizedAddNotification({ message: "Category deleted successfully", type: "success" });
    } catch (err) {
      const message = err.message.includes("401") ? "Please log in to delete a category" : err.message || "Failed to delete category";
      memoizedAddNotification({ message, type: "error" });
      fetchCategoriesCallback(); // Fallback to refetch if delete fails
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddProduct = async (data) => {
    setLoadingAction(true);
    try {
      const productRes = await addProduct(data);
      const productId = productRes?.id || productRes?.product?.id;
      const newProduct = {
        id: productId,
        name: data.productName,
        description: data.productDesc,
        price: data.productPrice,
        category_id: data.productCategory,
        status: "Active",
      };
      let imageUrl = null;
      if (productImageFile && productId) {
        try {
          const imageRes = await uploadProductImage({
            file: productImageFile,
            name: data.productName || "product-image",
            product_id: productId,
          });
          imageUrl = imageRes.url;
        } catch (imgErr) {
          memoizedAddNotification({ message: imgErr.message || "Product added but image upload failed", type: "error" });
        }
      }
      setShowProductModal(false);
      setProductImageFile(null);
      productForm.reset();
      // Optimistic update
      React.startTransition(() => {
        setProducts((prev) => [...prev, newProduct]);
        if (imageUrl) {
          setProductImages((prev) => ({ ...prev, [productId]: imageUrl }));
        }
      });
      memoizedAddNotification({ message: "Product added successfully", type: "success" });
    } catch (err) {
      const message = err.message.includes("401") ? "Please log in to add a product" :
                      err.message.includes("403") ? "You don't have permission to add a product" :
                      err.message || "Failed to add product";
      memoizedAddNotification({ message, type: "error" });
      fetchProductsCallback(); // Fallback to refetch if add fails
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setLoadingAction(true);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((prod) => prod.id !== id)); // Optimistic update
      setProductImages((prev) => {
        const newImages = { ...prev };
        delete newImages[id];
        return newImages;
      });
      memoizedAddNotification({ message: "Product deleted successfully", type: "success" });
    } catch (err) {
      const message = err.message.includes("401") ? "Please log in to delete a product" : err.message || "Failed to delete product";
      memoizedAddNotification({ message, type: "error" });
      fetchProductsCallback(); // Fallback to refetch if delete fails
    } finally {
      setLoadingAction(false);
    }
  };

  const handleViewProduct = (prod) => {
    setSelectedProduct(prod);
    setShowProductViewModal(true);
  };

  const handleViewCategory = (cat) => {
    setSelectedCategory(cat);
    setShowCategoryViewModal(true);
  };

  const categoryForm = useForm();
  const productForm = useForm();

  // Calculate accurate counts
  const totalProducts = products.length;
  const currentUsedProducts = products.filter(prod => prod.status === "Active").length;

  // Memoized table components to prevent unnecessary re-renders
  const ProductTable = React.memo(({ products, productImages, categories, handleDeleteProduct, handleViewProduct }) => (
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
        {products.map((prod) => (
          <tr key={prod.id}>
            <td>
              <img
                src={productImages[prod.id] || prod.photo || ""}
                alt={`Product ${prod.name}`}
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
              />
            </td>
            <td>{prod.name}</td>
            <td>${prod.price || "0.00"}</td>
            <td>{categories.find((c) => c.id === prod.category_id)?.name || "Unknown"}</td>
            <td>
              <span style={{ backgroundColor: prod.status === "Active" ? "#d4edda" : "#f8d7da", padding: "5px 10px", borderRadius: "10px", color: prod.status === "Active" ? "#155724" : "#721c24" }}>
                {prod.status || "Active"}
              </span>
            </td>
            <td>
              <i className="fas fa-pen" aria-label={`Edit product ${prod.name}`} style={{ cursor: "pointer" }}></i>
              <i
                className="fas fa-trash"
                aria-label={`Delete product ${prod.name}`}
                onClick={() => handleDeleteProduct(prod.id)}
                style={{ cursor: "pointer", marginLeft: "10px" }}
              ></i>
            </td>
            <td><Button variant="primary" size="sm" onClick={() => handleViewProduct(prod)}>View</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  ));

  const CategoryTable = React.memo(({ categories, handleDeleteCategory, handleViewCategory }) => (
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
        {categories.map((cat) => (
          <tr key={cat.id}>
            <td>
              <img
                src={cat.photo || ""}
                alt={`Category ${cat.name}`}
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
              />
            </td>
            <td>{cat.name}</td>
            <td>{cat.description || "N/A"}</td>
            <td>
              <span style={{ backgroundColor: cat.status === "Active" ? "#d4edda" : "#f8d7da", padding: "5px 10px", borderRadius: "10px", color: cat.status === "Active" ? "#155724" : "#721c24" }}>
                {cat.status || "Active"}
              </span>
            </td>
            <td>
              <i className="fas fa-pen" aria-label={`Edit category ${cat.name}`} style={{ cursor: "pointer" }}></i>
              <i
                className="fas fa-trash"
                aria-label={`Delete category ${cat.name}`}
                onClick={() => handleDeleteCategory(cat.id)}
                style={{ cursor: "pointer", marginLeft: "10px" }}
              ></i>
            </td>
            <td><Button variant="primary" size="sm" onClick={() => handleViewCategory(cat)}>View</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  ));

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

        {(loadingCategories || loadingProducts || loadingAction) && (
          <div className="d-flex justify-content-center mb-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {activeTab === "productList" && (
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Products</h3>
              <div>
                <Button variant="purple" style={{ marginRight: "10px" }} onClick={() => setShowProductModal(true)}>
                  Add new
                </Button>
                <Button variant="secondary">Import products</Button>
                <Button variant="secondary" style={{ marginLeft: "10px" }}>Export products (Excel)</Button>
                <Button variant="purple" style={{ marginLeft: "10px" }}><i className="fas fa-filter" aria-label="Filter products"></i></Button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <span>Total products: {totalProducts} | Current used: {currentUsedProducts}</span>
            </div>
            {loadingProducts ? (
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
                  {Array(5).fill().map((_, index) => (
                    <tr key={index}>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={4} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={6} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={3} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={5} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={4} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={2} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={2} /></Placeholder></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : products.length === 0 ? (
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
                  <tr>
                    <td colSpan="7" className="text-center">No products available.</td>
                  </tr>
                </tbody>
              </Table>
            ) : (
              <ProductTable
                products={products}
                productImages={productImages}
                categories={categories}
                handleDeleteProduct={handleDeleteProduct}
                handleViewProduct={handleViewProduct}
              />
            )}
          </div>
        )}

        {activeTab === "manageCategories" && (
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Categories</h3>
              <div>
                <Button variant="purple" style={{ marginRight: "10px" }} onClick={() => setShowCategoryModal(true)}>
                  Add new
                </Button>
                <Button variant="secondary">Import categories</Button>
                <Button variant="secondary" style={{ marginLeft: "10px" }}>Export categories (Excel)</Button>
                <Button variant="purple" style={{ marginLeft: "10px" }}><i className="fas fa-filter" aria-label="Filter categories"></i></Button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <span>Total categories: {categories.length} | Current used: {categories.filter(c => c.status === "Active").length}</span>
            </div>
            {loadingCategories ? (
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
                  {Array(5).fill().map((_, index) => (
                    <tr key={index}>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={4} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={6} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={5} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={4} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={2} /></Placeholder></td>
                      <td><Placeholder as="div" animation="glow"><Placeholder xs={2} /></Placeholder></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : categories.length === 0 ? (
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
                  <tr>
                    <td colSpan="6" className="text-center">No categories available.</td>
                  </tr>
                </tbody>
              </Table>
            ) : (
              <CategoryTable
                categories={categories}
                handleDeleteCategory={handleDeleteCategory}
                handleViewCategory={handleViewCategory}
              />
            )}
          </div>
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
                  disabled={loadingAction}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="btn-fill flex-1"
                  disabled={loadingAction}
                >
                  {loadingAction ? <Spinner animation="border" size="sm" /> : "Add Category"}
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
            setProductImageFile(null);
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
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {productForm.formState.errors.productCategory?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="productImage">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (!file.type.startsWith("image/")) {
                        memoizedAddNotification({ message: "Please upload a valid image file", type: "error" });
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        memoizedAddNotification({ message: "Image size must be less than 5MB", type: "error" });
                        return;
                      }
                      setProductImageFile(file);
                    }
                  }}
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowProductModal(false);
                    productForm.reset();
                    setProductImageFile(null);
                  }}
                  className="btn-fill flex-1"
                  disabled={loadingAction}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  type="submit"
                  className="btn-fill flex-1"
                  disabled={loadingAction}
                >
                  {loadingAction ? <Spinner animation="border" size="sm" /> : "Add Item"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Product View Modal */}
        <Modal
          show={showProductViewModal}
          onHide={() => setShowProductViewModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Product Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <>
                <p><strong>Name:</strong> {selectedProduct.name}</p>
                <p><strong>Price:</strong> ${selectedProduct.price || "0.00"}</p>
                <p><strong>Category:</strong> {categories.find((c) => c.id === selectedProduct.category_id)?.name || "Unknown"}</p>
                <p><strong>Status:</strong> {selectedProduct.status || "Active"}</p>
                {productImages[selectedProduct.id] && (
                  <img
                    src={productImages[selectedProduct.id]}
                    alt={`Product ${selectedProduct.name}`}
                    style={{ width: "100px" }}
                    onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
                  />
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProductViewModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Category View Modal */}
        <Modal
          show={showCategoryViewModal}
          onHide={() => setShowCategoryViewModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Category Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCategory && (
              <>
                <p><strong>Name:</strong> {selectedCategory.name}</p>
                <p><strong>Description:</strong> {selectedCategory.description || "N/A"}</p>
                <p><strong>Status:</strong> {selectedCategory.status || "Active"}</p>
                {selectedCategory.photo && (
                  <img
                    src={selectedCategory.photo}
                    alt={`Category ${selectedCategory.name}`}
                    style={{ width: "100px" }}
                    onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
                  />
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCategoryViewModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Catalogue;