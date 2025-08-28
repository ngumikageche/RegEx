import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Modal, Button, Form, Spinner, Table, Nav, Placeholder } from "react-bootstrap";
import CategoryModal from "../components/Modals/CategoryModal";
import ProductModal from "../components/Modals/ProductModal";
import ProductViewModal from "../components/Modals/ProductViewModal";
import CategoryViewModal from "../components/Modals/CategoryViewModal";
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
// import "./Catalogue.css";
import noImagePlaceholder from "../assets/img/No-Image-Placeholder.svg.png";

function Catalogue() {
  const [categories, setCategories] = useState(() => {
    const cached = sessionStorage.getItem("categories");
    return cached ? JSON.parse(cached) : [];
  });
  const [products, setProducts] = useState(() => {
    const cached = sessionStorage.getItem("products");
    return cached ? JSON.parse(cached) : [];
  });
  const [productImages, setProductImages] = useState(() => JSON.parse(localStorage.getItem("productImages") || "{}"));
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductViewModal, setShowProductViewModal] = useState(false);
  const [showCategoryViewModal, setShowCategoryViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productImageFile, setProductImageFile] = useState(null);
  // For Product Images tab file preview modal
  const [uploadPreviewFile, setUploadPreviewFile] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState(null);
  const [showUploadPreviewModal, setShowUploadPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("productList");
  const { addNotification } = useContext(NotificationContext);

  const FALLBACK_IMAGE = noImagePlaceholder;

  // Memoize addNotification to ensure stability
  const memoizedAddNotification = useMemo(() => addNotification, [addNotification]);

  const fetchCategoriesCallback = useCallback(
    debounce(async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategories();
        const newCategories = data?.categories ?? [];
        // Only update if changed
        if (JSON.stringify(newCategories) !== JSON.stringify(categories)) {
          setCategories(newCategories);
          sessionStorage.setItem("categories", JSON.stringify(newCategories));
        }
      } catch (err) {
        const message = err.message.includes("401") ? "Please log in to fetch categories" : err.message || "Network error";
        memoizedAddNotification({ message, type: "error" });
      } finally {
        setLoadingCategories(false);
      }
    }, 500),
    [memoizedAddNotification, categories]
  );

  const fetchProductsCallback = useCallback(
    debounce(async () => {
      setLoadingProducts(true);
      try {
        const data = await fetchProducts();
        const prods = data?.products ?? [];
        // Only update if changed
        if (JSON.stringify(prods) !== JSON.stringify(products)) {
          const imagesMap = { ...productImages };
          await Promise.all(
            prods.map(async (prod) => {
              if (!imagesMap[prod.id]) {
                try {
                  const imgRes = await fetchProductImages(prod.id);
                  if (imgRes?.images?.length > 0) {
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
          sessionStorage.setItem("products", JSON.stringify(prods));
        }
      } catch (err) {
        const message = err.message.includes("401") ? "Please log in to fetch products" : err.message || "Network error";
        memoizedAddNotification({ message, type: "error" });
      } finally {
        setLoadingProducts(false);
      }
    }, 500),
    [memoizedAddNotification, productImages, products]
  );

  useEffect(() => {
    fetchCategoriesCallback();
    fetchProductsCallback();
    return () => {
      fetchCategoriesCallback.cancel();
      fetchProductsCallback.cancel();
    };
  }, [fetchCategoriesCallback, fetchProductsCallback]);

  useEffect(() => {
    localStorage.setItem("productImages", JSON.stringify(productImages));
  }, [productImages]);

  // Cleanup object URL when it changes or component unmounts
  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [uploadPreviewUrl]);

  const handleAddCategory = async (data) => {
    setLoadingAction(true);
    try {
      const newCategory = await addCategory(data);
      setShowCategoryModal(false);
      categoryForm.reset();
      setCategories((prev) => [
        ...prev,
        { id: newCategory.id, name: data.categoryName, description: data.categoryDesc, status: "Active" },
      ]);
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
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      memoizedAddNotification({ message: "Category deleted successfully", type: "success" });
    } catch (err) {
      const message = err.message.includes("401") ? "Please log in to delete a category" : err.message || "Failed to delete category";
      memoizedAddNotification({ message, type: "error" });
      fetchCategoriesCallback();
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddProduct = async (data) => {
    setLoadingAction(true);
    try {
      const productRes = await addProduct(data);
      const productId = productRes?.id || productRes?.product?.id;
      let imageUrl = null;
      if (productImageFile) {
        const imageRes = await uploadProductImage({
          file: productImageFile,
          name: data.productName,
          product_id: productId,
        });
        imageUrl = imageRes?.url;
      }
      const newProduct = {
        id: productId,
        name: data.productName,
        description: data.productDesc,
        price: data.productPrice,
        category_id: data.productCategory,
        status: "Active",
      };
      setShowProductModal(false);
      setProductImageFile(null);
      productForm.reset();
      React.startTransition(() => {
        setProducts((prev) => [...prev, newProduct]);
        if (imageUrl) {
          setProductImages((prev) => ({ ...prev, [productId]: imageUrl }));
        }
      });
      memoizedAddNotification({ message: "Product added successfully", type: "success" });
    } catch (err) {
      const message = err.message.includes("401")
        ? "Please log in to add a product"
        : err.message.includes("403")
        ? "You don't have permission to add a product"
        : err.message || "Failed to add product";
      memoizedAddNotification({ message, type: "error" });
      fetchProductsCallback();
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setLoadingAction(true);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((prod) => prod.id !== id));
      setProductImages((prev) => {
        const newImages = { ...prev };
        delete newImages[id];
        return newImages;
      });
      memoizedAddNotification({ message: "Product deleted successfully", type: "success" });
    } catch (err) {
      const message = err.message.includes("401") ? "Please log in to delete a product" : err.message || "Failed to delete product";
      memoizedAddNotification({ message, type: "error" });
      fetchProductsCallback();
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

  const totalProducts = products.length;
  const currentUsedProducts = products.filter((prod) => prod.status === "Active").length;

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
                src={productImages[prod.id] || prod.photo || FALLBACK_IMAGE}
                alt={`Product ${prod.name}`}
                className="product-image"
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== FALLBACK_IMAGE) {
                    img.onerror = null;
                    img.src = FALLBACK_IMAGE;
                  }
                }}
              />
            </td>
            <td>{prod.name}</td>
            <td>${prod.price || "0.00"}</td>
            <td>{categories.find((c) => c.id === prod.category_id)?.name || "Unknown"}</td>
            <td>
              <span className={prod.status === "Active" ? "status-active" : "status-inactive"}>
                {prod.status || "Active"}
              </span>
            </td>
            <td>
              <i
                className="fas fa-trash"
                aria-label={`Delete product ${prod.name}`}
                title="Delete product"
                onClick={() => handleDeleteProduct(prod.id)}
                style={{ cursor: "pointer" }}
              ></i>
            </td>
            <td>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleViewProduct(prod)}
                aria-label={`View product ${prod.name}`}
              >
                View
              </Button>
            </td>
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
                src={cat.photo || FALLBACK_IMAGE}
                alt={`Category ${cat.name}`}
                className="category-image"
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== FALLBACK_IMAGE) {
                    img.onerror = null;
                    img.src = FALLBACK_IMAGE;
                  }
                }}
              />
            </td>
            <td>{cat.name}</td>
            <td>{cat.description || "N/A"}</td>
            <td>
              <span className={cat.status === "Active" ? "status-active" : "status-inactive"}>
                {cat.status || "Active"}
              </span>
            </td>
            <td>
              <i
                className="fas fa-trash"
                aria-label={`Delete category ${cat.name}`}
                title="Delete category"
                onClick={() => handleDeleteCategory(cat.id)}
                style={{ cursor: "pointer" }}
              ></i>
            </td>
            <td>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleViewCategory(cat)}
                aria-label={`View category ${cat.name}`}
              >
                View
              </Button>
            </td>
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
            <Nav.Link
              eventKey="manageCategories"
              active={activeTab === "manageCategories"}
              style={{ color: activeTab === "manageCategories" ? "#6f42c1" : "#000" }}
            >
              Manage Categories
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="productList"
              active={activeTab === "productList"}
              style={{ color: activeTab === "productList" ? "#6f42c1" : "#000" }}
            >
              Product List
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="productImages"
              active={activeTab === "productImages"}
              style={{ color: activeTab === "productImages" ? "#6f42c1" : "#000" }}
            >
              Product Images
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
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Products</h3>
              <div>
                <Button
                  variant="purple"
                  className="btn-purple"
                  style={{ marginRight: "10px" }}
                  onClick={() => setShowProductModal(true)}
                  aria-label="Add new product"
                >
                  Add new
                </Button>
                <Button variant="secondary" aria-label="Import products">
                  Import products
                </Button>
                <Button
                  variant="secondary"
                  style={{ marginLeft: "10px" }}
                  aria-label="Export products to Excel"
                >
                  Export products (Excel)
                </Button>
                <Button
                  variant="purple"
                  className="btn-purple"
                  style={{ marginLeft: "10px" }}
                  aria-label="Filter products"
                >
                  <i className="fas fa-filter"></i>
                </Button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <span>Total products: {totalProducts} | Current used: {currentUsedProducts}</span>
            </div>
        {/* Show loading animation only if loading and no products yet, else show table or empty message */}
        {loadingProducts && products.length === 0 ? (
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
                  <td>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={4} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={6} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={3} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={5} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={4} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={2} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={2} />
                    </Placeholder>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : products.length === 0 ? (
          <div className="text-center py-4">No items available.</div>
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
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Categories</h3>
              <div>
                <Button
                  variant="purple"
                  className="btn-purple"
                  style={{ marginRight: "10px" }}
                  onClick={() => setShowCategoryModal(true)}
                  aria-label="Add new category"
                >
                  Add new
                </Button>
                <Button variant="secondary" aria-label="Import categories">
                  Import categories
                </Button>
                <Button
                  variant="secondary"
                  style={{ marginLeft: "10px" }}
                  aria-label="Export categories to Excel"
                >
                  Export categories (Excel)
                </Button>
                <Button
                  variant="purple"
                  className="btn-purple"
                  style={{ marginLeft: "10px" }}
                  aria-label="Filter categories"
                >
                  <i className="fas fa-filter"></i>
                </Button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <span>
                Total categories: {categories.length} | Current used:{" "}
                {categories.filter((c) => c.status === "Active").length}
              </span>
            </div>
            {/* Show loading animation only if loading and no categories yet, else show table or empty message */}
            {loadingCategories && categories.length === 0 ? (
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
                      <td>
                        <Placeholder as="div" animation="glow">
                          <Placeholder xs={4} />
                        </Placeholder>
                      </td>
                      <td>
                        <Placeholder as="div" animation="glow">
                          <Placeholder xs={6} />
                        </Placeholder>
                      </td>
                      <td>
                        <Placeholder as="div" animation="glow">
                          <Placeholder xs={5} />
                        </Placeholder>
                      </td>
                      <td>
                        <Placeholder as="div" animation="glow">
                          <Placeholder xs={4} />
                        </Placeholder>
                      </td>
                      <td>
                        <Placeholder as="div" animation="glow">
                          <Placeholder xs={2} />
                        </Placeholder>
                      </td>
                      <td>
                        <Placeholder as="div" animation="glow">
                          <Placeholder xs={2} />
                        </Placeholder>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : categories.length === 0 ? (
              <div className="text-center py-4">No items available.</div>
            ) : (
              <CategoryTable
                categories={categories}
                handleDeleteCategory={handleDeleteCategory}
                handleViewCategory={handleViewCategory}
              />
            )}
          </div>
        )}

        {activeTab === "productImages" && (
          <div className="container">
            <h3>Upload Product Image</h3>
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const productId = form.productId.value;
                const file = form.productImage.files[0];
                if (!productId) {
                  memoizedAddNotification({ message: "Please select a product", type: "error" });
                  return;
                }
                if (!file) {
                  memoizedAddNotification({ message: "Please select an image file", type: "error" });
                  return;
                }
                if (!file.type.startsWith("image/")) {
                  memoizedAddNotification({ message: "Please upload a valid image file", type: "error" });
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  memoizedAddNotification({ message: "Image size must be less than 5MB", type: "error" });
                  return;
                }
                setUploadingImage(true);
                try {
                  const imageRes = await uploadProductImage({
                    file,
                    name: products.find((p) => p.id == productId)?.name || "product-image",
                    product_id: productId,
                  });
                  setProductImages((prev) => ({ ...prev, [productId]: imageRes?.url }));
                  memoizedAddNotification({ message: "Image uploaded successfully", type: "success" });
                  // Reset file input and preview state
                  form.productImage.value = null;
                  if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
                  setUploadPreviewUrl(null);
                  setUploadPreviewFile(null);
                } catch (err) {
                  memoizedAddNotification({ message: err.message || "Failed to upload image", type: "error" });
                } finally {
                  setUploadingImage(false);
                }
              }}
            >
              <Form.Group className="mb-3" controlId="productId">
                <Form.Label>Select Product</Form.Label>
                <Form.Control as="select" name="productId" required>
                  <option value="">Select Product</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3" controlId="productImage">
                <Form.Label>Image</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="file"
                    name="productImage"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadPreviewFile(file);
                        // Revoke previous URL if exists before creating a new one
                        if (uploadPreviewUrl) {
                          URL.revokeObjectURL(uploadPreviewUrl);
                        }
                        const url = URL.createObjectURL(file);
                        setUploadPreviewUrl(url);
                      } else {
                        setUploadPreviewFile(null);
                        if (uploadPreviewUrl) {
                          URL.revokeObjectURL(uploadPreviewUrl);
                        }
                        setUploadPreviewUrl(null);
                      }
                    }}
                  />
                  {uploadPreviewFile && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowUploadPreviewModal(true)}
                    >
                      Preview: {uploadPreviewFile.name}
                    </Button>
                  )}
                </div>
              </Form.Group>
              <Button variant="success" type="submit" disabled={uploadingImage}>
                {uploadingImage ? <Spinner animation="border" size="sm" /> : "Upload Image"}
              </Button>
            </Form>

            <Modal
              show={showUploadPreviewModal}
              onHide={() => setShowUploadPreviewModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Image Preview</Modal.Title>
              </Modal.Header>
              <Modal.Body className="text-center">
                {uploadPreviewUrl ? (
                  <img
                    src={uploadPreviewUrl}
                    alt={uploadPreviewFile?.name || "preview"}
                    style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 8 }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== FALLBACK_IMAGE) {
                        img.onerror = null;
                        img.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                ) : (
                  <div>No preview available.</div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowUploadPreviewModal(false)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}

        {/* Category Modal */}
        <CategoryModal
          show={showCategoryModal}
          onHide={() => {
            setShowCategoryModal(false);
            categoryForm.reset();
          }}
          onSubmit={handleAddCategory}
          loading={loadingAction}
          form={categoryForm}
        />

        {/* Product Modal */}
        <ProductModal
          show={showProductModal}
          onHide={() => {
            setShowProductModal(false);
            productForm.reset();
            setProductImageFile(null);
          }}
          onSubmit={handleAddProduct}
          loading={loadingAction}
          form={productForm}
          categories={categories}
          setProductImageFile={setProductImageFile}
        />

        {/* Product View Modal */}
        <ProductViewModal
          show={showProductViewModal}
          onHide={() => setShowProductViewModal(false)}
          selectedProduct={selectedProduct}
          categories={categories}
          productImages={productImages}
          fallbackImage={FALLBACK_IMAGE}
        />

        {/* Category View Modal */}
        <CategoryViewModal
          show={showCategoryViewModal}
          onHide={() => setShowCategoryViewModal(false)}
          selectedCategory={selectedCategory}
          fallbackImage={FALLBACK_IMAGE}
        />
      </div>
    </div>
  );
}

export default Catalogue;