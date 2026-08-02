import { useEffect, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiImage, FiEye } from 'react-icons/fi';
import api, { getImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const statusBadgeClass = {
  Pending: 'cc-badge-claimed',
  Approved: 'cc-badge-available',
  Rejected: 'cc-badge-lost',
};

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const { data } = await api.get('/claims');
        setClaims(data.data);
      } catch (error) {
        toast.error('Failed to load your claims');
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="cc-section-title">My Claims</h4>

      {claims.length === 0 ? (
        <div className="cc-empty-state">
          You haven't submitted any claims yet.
          <div className="mt-3">
            <Link to="/lost-items" className="btn btn-cc-primary me-2">
              Browse Lost Items
            </Link>
            <Link to="/found-items" className="btn btn-cc-accent">
              Browse Found Items
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded-3 shadow-sm">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Item</th>
                <th>Reason</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {claim.itemId?.image ? (
                        <img
                          src={getImageUrl(claim.itemId.image)}
                          alt=""
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center text-muted"
                          style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#eef1f1' }}
                        >
                          <FiImage size={16} />
                        </div>
                      )}
                      <span className="fw-semibold">{claim.itemId?.title || 'Item removed'}</span>
                    </div>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 220 }}>
                    {claim.reason}
                  </td>
                  <td>{claim.contactNumber}</td>
                  <td>
                    <Badge className={statusBadgeClass[claim.status]}>{claim.status}</Badge>
                  </td>
                  <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                  <td>
                    {claim.itemId?._id && (
                      <Link to={`/items/${claim.itemId._id}`} className="btn btn-sm btn-outline-secondary">
                        <FiEye />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MyClaims;
