import { useEffect, useState } from 'react';
import { Table, Badge, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiEye, FiImage } from 'react-icons/fi';
import api, { getImageUrl } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusBadgeClass = {
  Pending: 'cc-badge-claimed',
  Approved: 'cc-badge-available',
  Rejected: 'cc-badge-lost',
};

const ManageClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/claims', { params });
      setClaims(data.data);
    } catch (error) {
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/claims/${id}`, { status });
      toast.success(`Claim ${status.toLowerCase()} successfully`);
      fetchClaims();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update claim');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="cc-section-title mb-0">Manage Claims</h4>
        <Form.Select style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Claims</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </Form.Select>
      </div>

      {claims.length === 0 ? (
        <div className="cc-empty-state">No claims found.</div>
      ) : (
        <div className="table-responsive bg-white rounded-3 shadow-sm">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Item</th>
                <th>Claimed By</th>
                <th>Reason</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
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
                  <td>
                    {claim.studentId?.name}
                    <br />
                    <small className="text-muted">{claim.studentId?.email}</small>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>
                    {claim.reason}
                  </td>
                  <td>{claim.contactNumber}</td>
                  <td>
                    <Badge className={statusBadgeClass[claim.status]}>{claim.status}</Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {claim.itemId?._id && (
                        <Link to={`/items/${claim.itemId._id}`} className="btn btn-sm btn-outline-secondary">
                          <FiEye />
                        </Link>
                      )}
                      {claim.status === 'Pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={updatingId === claim._id}
                            onClick={() => handleUpdateStatus(claim._id, 'Approved')}
                          >
                            <FiCheck />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            disabled={updatingId === claim._id}
                            onClick={() => handleUpdateStatus(claim._id, 'Rejected')}
                          >
                            <FiX />
                          </Button>
                        </>
                      )}
                    </div>
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

export default ManageClaims;
