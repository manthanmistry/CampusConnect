import { useEffect, useState } from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiEye, FiImage } from 'react-icons/fi';
import api, { getImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteModal from '../components/DeleteModal';

const claimBadgeClass = {
  Available: 'cc-badge-available',
  Claimed: 'cc-badge-claimed',
  Returned: 'cc-badge-returned',
};

const MyReports = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/items?mine=true');
      setItems(data.data);
    } catch (error) {
      toast.error('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/items/${deleteId}`);
      toast.success('Report deleted successfully');
      setItems((prev) => prev.filter((i) => i._id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="cc-section-title">My Reports</h4>

      {items.length === 0 ? (
        <div className="cc-empty-state">
          You haven't reported any items yet.
          <div className="mt-3">
            <Link to="/report-lost" className="btn btn-cc-primary me-2">
              Report Lost Item
            </Link>
            <Link to="/report-found" className="btn btn-cc-accent">
              Report Found Item
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded-3 shadow-sm">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Location</th>
                <th>Claim Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center text-muted"
                        style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#eef1f1' }}
                      >
                        <FiImage />
                      </div>
                    )}
                  </td>
                  <td className="fw-semibold">{item.title}</td>
                  <td>
                    <Badge className={item.status === 'Lost' ? 'cc-badge-lost' : 'cc-badge-found'}>{item.status}</Badge>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.location}</td>
                  <td>
                    <Badge className={claimBadgeClass[item.claimStatus]}>{item.claimStatus}</Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/items/${item._id}`} className="btn btn-sm btn-outline-secondary">
                        <FiEye />
                      </Link>
                      <Link to={`/items/${item._id}/edit`} className="btn btn-sm btn-outline-primary">
                        <FiEdit2 />
                      </Link>
                      <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(item._id)}>
                        <FiTrash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <DeleteModal
        show={!!deleteId}
        onHide={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="This will permanently delete this report and any associated claims."
      />
    </div>
  );
};

export default MyReports;
