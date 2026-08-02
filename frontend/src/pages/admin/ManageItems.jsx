import { useEffect, useState } from 'react';
import { Table, Badge, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTrash2, FiEye, FiImage, FiCheckCircle } from 'react-icons/fi';
import api, { getImageUrl } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import DeleteModal from '../../components/DeleteModal';

const claimBadgeClass = {
  Available: 'cc-badge-available',
  Claimed: 'cc-badge-claimed',
  Returned: 'cc-badge-returned',
};

const ManageItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/items', { params });
      setItems(data.data);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/items/${deleteId}`);
      toast.success('Report deleted successfully');
      setItems((prev) => prev.filter((i) => i._id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkReturned = async (id) => {
    try {
      await api.put(`/admin/items/${id}/return`);
      toast.success('Item marked as returned');
      setItems((prev) => prev.map((i) => (i._id === id ? { ...i, claimStatus: 'Returned' } : i)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="cc-section-title mb-0">Manage Items</h4>
        <Form.Select style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Items</option>
          <option value="Lost">Lost Items</option>
          <option value="Found">Found Items</option>
        </Form.Select>
      </div>

      <div className="table-responsive bg-white rounded-3 shadow-sm">
        <Table hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Status</th>
              <th>Reported By</th>
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
                <td>{item.reportedBy?.name || 'Unknown'}</td>
                <td>
                  <Badge className={claimBadgeClass[item.claimStatus]}>{item.claimStatus}</Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Link to={`/items/${item._id}`} className="btn btn-sm btn-outline-secondary">
                      <FiEye />
                    </Link>
                    {item.claimStatus === 'Claimed' && (
                      <Button size="sm" variant="outline-success" onClick={() => handleMarkReturned(item._id)}>
                        <FiCheckCircle />
                      </Button>
                    )}
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

      <DeleteModal
        show={!!deleteId}
        onHide={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Report"
        message="This will permanently delete this report and any associated claims."
      />
    </div>
  );
};

export default ManageItems;
