import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FiUsers, FiFileText, FiCheckSquare, FiCheckCircle } from 'react-icons/fi';
import { MdOutlineFindInPage } from 'react-icons/md';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="cc-section-title">Admin Dashboard</h4>
      <Row className="g-3">
        <Col md={4} lg={2}>
          <StatCard icon={<FiUsers />} label="Total Users" value={stats.totalUsers} color="var(--cc-primary)" />
        </Col>
        <Col md={4} lg={2}>
          <StatCard icon={<FiFileText />} label="Total Lost Items" value={stats.totalLost} color="var(--cc-lost)" />
        </Col>
        <Col md={4} lg={2}>
          <StatCard icon={<MdOutlineFindInPage />} label="Total Found Items" value={stats.totalFound} color="var(--cc-found)" />
        </Col>
        <Col md={4} lg={2}>
          <StatCard icon={<FiCheckSquare />} label="Pending Claims" value={stats.pendingClaims} color="var(--cc-accent)" />
        </Col>
        <Col md={4} lg={2}>
          <StatCard icon={<FiCheckCircle />} label="Returned Items" value={stats.returnedItems} color="#3f5b8c" />
        </Col>
        <Col md={4} lg={2}>
          <StatCard icon={<FiCheckSquare />} label="Total Claims" value={stats.totalClaims} color="#6c5ce7" />
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
