import { Modal, Button } from 'react-bootstrap';
import { FiAlertTriangle } from 'react-icons/fi';

const DeleteModal = ({ show, onHide, onConfirm, title = 'Confirm Deletion', message, loading }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 64, height: 64, backgroundColor: '#fdeceb', color: 'var(--cc-lost)' }}
        >
          <FiAlertTriangle size={28} />
        </div>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="text-muted mb-4">
          {message || 'This action cannot be undone. Are you sure you want to proceed?'}
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteModal;
