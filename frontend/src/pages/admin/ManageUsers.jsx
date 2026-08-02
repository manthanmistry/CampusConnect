import { useEffect, useState } from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import DeleteModal from '../../components/DeleteModal';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteId}`);
      toast.success('User deleted successfully');
      setUsers((prev) => prev.filter((u) => u._id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="cc-section-title">Manage Users</h4>
      <div className="table-responsive bg-white rounded-3 shadow-sm">
        <Table hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="fw-semibold">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>
                  <Badge bg={u.role === 'admin' ? 'dark' : 'secondary'} className="text-capitalize">
                    {u.role}
                  </Badge>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {u.role !== 'admin' && (
                    <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(u._id)}>
                      <FiTrash2 />
                    </Button>
                  )}
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
        title="Delete User"
        message="This will permanently delete this user's account."
      />
    </div>
  );
};

export default ManageUsers;
