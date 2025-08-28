import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { MdOutlinePhoto, MdOutlineAdd, MdCancel } from 'react-icons/md';

const ProductModal = ({ show, onHide, onSubmit, loading, form, categories, setProductImageFile }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      animation
      dialogClassName="modal-wider"
      scrollable // Enable modal body scrolling
    >
      <div className="bg-white rounded-xl shadow-2xl flex flex-col">
        <Modal.Header closeButton className="border-b-0 p-4 pb-3">
          <Modal.Title className="text-xl font-semibold text-gray-900">Add New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-3">
          <Form onSubmit={form.handleSubmit(onSubmit)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {/* Two inputs in one row */}
              <div className="form-row">
                <Form.Group className="mb-4 form-group" controlId="productName">
                  <Form.Label className="block text-sm font-medium text-gray-700 mb-1">Item Name</Form.Label>
                  <Form.Control
                    {...form.register('productName', {
                      required: 'Item name is required',
                    })}
                    isInvalid={!!form.formState.errors.productName}
                    placeholder="e.g., Apple iPhone 15"
                    autoFocus
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <Form.Control.Feedback type="invalid">
                    {form.formState.errors.productName?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4 form-group" controlId="productPrice">
                  <Form.Label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    {...form.register('productPrice', {
                      required: 'Price is required',
                      min: { value: 0, message: 'Price cannot be negative' },
                    })}
                    isInvalid={!!form.formState.errors.productPrice}
                    placeholder="e.g., 999.99"
                    step="0.01"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <Form.Control.Feedback type="invalid">
                    {form.formState.errors.productPrice?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <Form.Group className="mb-4" controlId="productDesc">
                <Form.Label className="block text-sm font-medium text-gray-700 mb-1">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2} // Reduced from 3 to save vertical space
                  {...form.register('productDesc')}
                  placeholder="Provide a detailed description of the item."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="productCategory">
                <Form.Label className="block text-sm font-medium text-gray-700 mb-1">Category</Form.Label>
                <Form.Control
                  as="select"
                  {...form.register('productCategory', {
                    required: 'Category is required',
                  })}
                  isInvalid={!!form.formState.errors.productCategory}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {form.formState.errors.productCategory?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* <Form.Group className="mb-4" controlId="productImage">
                <Form.Label className="block text-sm font-medium text-gray-700 mb-1">Product Image</Form.Label>
                <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="file"
                    id="productImage"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setProductImageFile(e.target.files[0])}
                  />
                  <label htmlFor="productImage" className="flex flex-col items-center cursor-pointer">
                    <MdOutlinePhoto className="text-2xl text-gray-400 mb-1" />
                    <span className="text-xs font-medium text-gray-600 text-center">
                      Upload a product image or drag and drop
                    </span>
                  </label>
                </div>
              </Form.Group> */}
            </motion.div>
          </Form>
        </Modal.Body>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onHide}
            disabled={loading}
            className="inline-flex items-center rounded-md border border-transparent bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <MdCancel className="mr-1" size={16} /> Cancel
          </Button>
          <Button
            variant="success"
            type="submit"
            disabled={loading}
            onClick={() => form.handleSubmit(onSubmit)()}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {loading ? (
              <Spinner animation="border" size="sm" className="w-4 h-4" />
            ) : (
              <>
                <MdOutlineAdd className="mr-1" size={16} /> Add Item
              </>
            )}
          </Button>
        </div>
      </div>
      <style jsx>{`
        .modal-wider {
          max-width: 700px !important; /* Slightly reduced from 800px for better fit */
          width: 90% !important;
          margin: 1rem auto; /* Reduced margin for smaller screens */
        }

        .modal-content {
          border: none;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          max-height: 85vh; /* Reduced to fit better within viewport */
          overflow: hidden;
        }

        .modal-body {
          max-height: calc(85vh - 140px); /* Account for header (~60px) and footer (~60px) */
          overflow-y: auto;
          padding: 1rem !important;
        }

        .form-row {
          display: flex;
          gap: 16px;
          margin-bottom: 1rem;
        }

        .form-group {
          flex: 1;
        }

        .form-control {
          font-size: 0.9rem; /* Slightly smaller font */
          transition: all 0.2s ease-in-out;
        }

        .form-control:focus {
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .form-label {
          font-weight: 500;
          color: #374151;
          font-size: 0.85rem;
        }

        button {
          font-weight: 500;
          padding: 0.5rem 1.25rem;
          font-size: 0.9rem;
        }

        button:hover {
          transform: translateY(-1px);
        }

        button:focus {
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .modal-wider {
            width: 92% !important;
            max-width: 92% !important;
          }

          .form-row {
            flex-direction: column;
            gap: 8px;
          }

          .modal-body {
            max-height: calc(90vh - 120px); /* More space on smaller screens */
            padding: 0.75rem !important;
          }

          .modal-content {
            max-height: 90vh;
          }
        }

        @media (max-height: 600px) {
          .modal-body {
            max-height: calc(85vh - 100px); /* Tighter fit for low-height screens */
          }

          .modal-content {
            max-height: 85vh;
          }

          .form-control,
          button {
            font-size: 0.85rem;
            padding: 0.4rem 0.75rem;
          }

          .form-label {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </Modal>
  );
};

export default ProductModal;