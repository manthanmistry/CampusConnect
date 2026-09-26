import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Badge, Button, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  FiMapPin,
  FiCalendar,
  FiUser,
  FiImage,
  FiEdit2,
  FiTrash2,
  FiMessageCircle,
} from 'react-icons/fi';

import api, { getImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteModal from '../components/DeleteModal';
import { useAuth } from '../context/AuthContext';

const claimBadgeClass = {
  Available: 'cc-badge-available',
  Claimed: 'cc-badge-claimed',
  Returned: 'cc-badge-returned',
};

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [claimData, setClaimData] = useState({
    reason: '',
    contactNumber: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItem = async () => {
    setLoading(true);

    try {
      const response = await api.get(`/items/${id}`);
      setItem(response.data.data);
    } catch (error) {
      toast.error('Item not found');
      navigate('/lost-items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const isOwner =
    user &&
    item &&
    item.reportedBy &&
    item.reportedBy._id === user._id;

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/claims', {
        itemId: id,
        ...claimData,
      });

      toast.success(
        'Claim submitted successfully! The admin will review it shortly.'
      );

      setShowClaimModal(false);

      setClaimData({
        reason: '',
        contactNumber: '',
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to submit claim'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isOwner) {
      navigate('/chat');
      return;
    }

    try {
      const response = await api.post('/chats', {
        itemId: id,
      });

      navigate(`/chat?chatId=${response.data.data._id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to start chat'
      );
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await api.delete(`/items/${id}`);

      toast.success('Report deleted successfully');

      navigate('/my-reports');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete report'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!item) {
    return null;
  }

  const imageUrl = getImageUrl(item.image);

  return (
    <div
      className="py-4"
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 1rem',
      }}
    >
      <Row className="g-4">
        <Col md={5}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-100 rounded-4"
              style={{
                objectFit: 'cover',
                maxHeight: 400,
              }}
            />
          ) : (
            <div
              className="w-100 rounded-4 d-flex align-items-center justify-content-center text-muted"
              style={{
                height: 320,
                backgroundColor: '#eef1f1',
              }}
            >
              <FiImage size={48} />
            </div>
          )}
        </Col>

        <Col md={7}>
          <div className="d-flex gap-2 mb-3">
            <Badge
              className={
                item.status === 'Lost'
                  ? 'cc-badge-lost'
                  : 'cc-badge-found'
              }
            >
              {item.status}
            </Badge>

            <Badge className={claimBadgeClass[item.claimStatus]}>
              {item.claimStatus}
            </Badge>
          </div>

          <h3 className="fw-bold">{item.title}</h3>

          <p className="text-muted">{item.category}</p>

          <p>{item.description}</p>

          <Row className="g-3 my-3">
            <Col
              sm={6}
              className="d-flex align-items-center gap-2 text-muted"
            >
              <FiMapPin />
              {item.location}
            </Col>

            <Col
              sm={6}
              className="d-flex align-items-center gap-2 text-muted"
            >
              <FiCalendar />
              {new Date(item.date).toLocaleDateString()}
            </Col>

            {item.color && (
              <Col sm={6} className="text-muted">
                <strong>Color:</strong> {item.color}
              </Col>
            )}

            {item.brand && (
              <Col sm={6} className="text-muted">
                <strong>Brand:</strong> {item.brand}
              </Col>
            )}

            <Col
              sm={6}
              className="d-flex align-items-center gap-2 text-muted"
            >
              <FiUser />
              Reported by {item.reportedBy?.name || 'Unknown'}
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-4 flex-wrap">
            {!user && (
              <Link
                to="/login"
                className="btn btn-cc-primary"
              >
                Login to Chat
              </Link>
            )}

            {user &&
              !isOwner &&
              item.claimStatus === 'Available' && (
                <Button
                  className="btn-cc-accent"
                  onClick={() => setShowClaimModal(true)}
                >
                  Claim This Item
                </Button>
              )}

            {user && !isOwner && (
              <Button
                variant="outline-primary"
                className="d-flex align-items-center gap-2"
                onClick={handleStartChat}
              >
                <FiMessageCircle />
                Chat
              </Button>
            )}

            {user && isOwner && (
              <Button
                variant="outline-primary"
                className="d-flex align-items-center gap-2"
                onClick={() => navigate('/chat')}
              >
                <FiMessageCircle />
                View Chats
              </Button>
            )}

            {isOwner && (
              <>
                <Link
                  to={`/items/${id}/edit`}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                >
                  <FiEdit2 />
                  Edit
                </Link>

                <Button
                  variant="outline-danger"
                  className="d-flex align-items-center gap-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FiTrash2 />
                  Delete
                </Button>
              </>
            )}
          </div>
        </Col>
      </Row>

      <Modal
        show={showClaimModal}
        onHide={() => setShowClaimModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Claim "{item.title}"
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleClaimSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Why does this item belong to you?
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                required
                placeholder="Describe identifying details only the owner would know"
                value={claimData.reason}
                onChange={(e) =>
                  setClaimData({
                    ...claimData,
                    reason: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>
                Your Contact Number
              </Form.Label>

              <Form.Control
                required
                placeholder="9876543210"
                value={claimData.contactNumber}
                onChange={(e) =>
                  setClaimData({
                    ...claimData,
                    contactNumber: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowClaimModal(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="btn-cc-accent"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        message="This will permanently delete this report and any associated claims."
      />
    </div>
  );
};

export default ItemDetails;

