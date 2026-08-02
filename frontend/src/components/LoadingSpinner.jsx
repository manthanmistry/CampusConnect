import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="cc-spinner-wrap flex-column">
      <Spinner animation="border" role="status" style={{ color: 'var(--cc-primary)', width: '3rem', height: '3rem' }} />
      <p className="mt-3 text-muted">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
