import React from "react";
import { Modal, Button } from "react-bootstrap";

const CategoryViewModal = ({ show, onHide, selectedCategory, fallbackImage }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Category Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {selectedCategory && (
        <>
          <p>
            <strong>Name:</strong> {selectedCategory.name}
          </p>
          <p>
            <strong>Description:</strong> {selectedCategory.description || "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {selectedCategory.status || "Active"}
          </p>
          {selectedCategory.photo && (
            <img
              src={selectedCategory.photo || fallbackImage}
              alt={`Category ${selectedCategory.name}`}
              className="category-image"
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

export default CategoryViewModal;
