import React from "react";
import { Modal, Button } from "react-bootstrap";

const ProductViewModal = ({ show, onHide, selectedProduct, categories, productImages, fallbackImage }) => (
  <Modal show={show} onHide={onHide} centered >
    <Modal.Header closeButton>
      <Modal.Title>Product Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {selectedProduct && (
        <>
          <p>
            <strong>Name:</strong> {selectedProduct.name}
          </p>
          <p>
            <strong>Price:</strong> ${selectedProduct.price || "0.00"}
          </p>
          <p>
            <strong>Category:</strong> {categories.find((c) => c.id === selectedProduct.category_id)?.name || "Unknown"}
          </p>
          <p>
            <strong>Status:</strong> {selectedProduct.status || "Active"}
          </p>
          {productImages[selectedProduct.id] && (
            <img
              src={productImages[selectedProduct.id] || fallbackImage}
              alt={`Product ${selectedProduct.name}`}
              className="product-image"
              style={{ width: "100px" }}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== fallbackImage) {
                  img.onerror = null;
                  img.src = fallbackImage;
                }
              }}
            />
          )}
        </>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ProductViewModal;
