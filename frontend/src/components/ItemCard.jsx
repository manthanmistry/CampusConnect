import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import { FiMapPin, FiCalendar, FiImage } from 'react-icons/fi';
import { getImageUrl } from '../services/api';

const claimBadgeClass = {
  Available: 'cc-badge-available',
  Claimed: 'cc-badge-claimed',
  Returned: 'cc-badge-returned',
};

const ItemCard = ({ item }) => {
  const imageUrl = getImageUrl(item.image);

  return (
    <Link to={`/items/${item._id}`} className="text-decoration-none">
      <div className="cc-item-card">
        <div className="position-relative">
          {imageUrl ? (
            <img src={imageUrl} alt={item.title} className="cc-item-img" />
          ) : (
            <div className="cc-item-img d-flex align-items-center justify-content-center text-muted">
              <FiImage size={36} />
            </div>
          )}
          <Badge
            className={`position-absolute top-0 start-0 m-2 ${item.status === 'Lost' ? 'cc-badge-lost' : 'cc-badge-found'}`}
          >
            {item.status}
          </Badge>
          <Badge className={`position-absolute top-0 end-0 m-2 ${claimBadgeClass[item.claimStatus] || ''}`}>
            {item.claimStatus}
          </Badge>
        </div>
        <div className="p-3">
          <h6 className="fw-bold mb-1 text-dark text-truncate">{item.title}</h6>
          <p className="text-muted small mb-2 text-truncate">{item.category}</p>
          <div className="d-flex align-items-center text-muted small mb-1">
            <FiMapPin className="me-1" /> {item.location}
          </div>
          <div className="d-flex align-items-center text-muted small">
            <FiCalendar className="me-1" /> {new Date(item.date).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
