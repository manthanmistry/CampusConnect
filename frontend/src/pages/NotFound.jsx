import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '70vh' }}>
      <FiAlertCircle size={64} color="var(--cc-primary)" />
      <h1 className="fw-bold mt-3" style={{ fontSize: '3rem' }}>
        404
      </h1>
      <p className="text-muted mb-4">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button className="btn-cc-primary">Back to Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
