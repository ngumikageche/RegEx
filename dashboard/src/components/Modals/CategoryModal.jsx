import React from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const CategoryModal = ({ show, onHide, onSubmit, loading, form }) => (
  <Modal
    show={show}
    onHide={onHide}
    centered
    animation
    className="animate__animated animate__slideInUp"
  >
    <Modal.Header closeButton>
      <Modal.Title>Add Category</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId="categoryName">
          <Form.Label>Category Name</Form.Label>
          <Form.Control
            {...form.register("categoryName", {
              required: "Category name is required",
            })}
            isInvalid={!!form.formState.errors.categoryName}
            placeholder="Enter category name"
            autoFocus
          />
          <Form.Control.Feedback type="invalid">
            {form.formState.errors.categoryName?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="categoryDesc">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            {...form.register("categoryDesc")}
            placeholder="Enter description"
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <Button
            variant="secondary"
            onClick={onHide}
            className="btn-fill"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="btn-fill"
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Add Category"}
          </Button>
        </div>
      </Form>
    </Modal.Body>
  </Modal>
);

export default CategoryModal;
