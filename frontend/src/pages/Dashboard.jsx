import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiFileText, FiCheckSquare, FiSearch, FiPlusCircle } from 'react-icons/fi';
import { MdOutlineFindInPage } from 'react-icons/md';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ lost: 0, found: 0, claims: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mineRes, claimsRes, recentRes] = await Promise.all([
          api.get('/items?mine=true'),
          api.get('/claims'),
          api.get('/items'),
        ]);

        const myItems = mineRes.data.data;
        setStats({
          lost: myItems.filter((i) => i.status === 'Lost').length,
          found: myItems.filter((i) => i.status === 'Found').length,
          claims: claimsRes.data.count,
        });
        setRecentItems(recentRes.data.data.slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="cc-section-title">Welcome back, {user?.name?.split(' ')[0]}!</h4>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <StatCard icon={<FiFileText />} label="My Lost Reports" value={stats.lost} color="var(--cc-lost)" />
        </Col>
        <Col md={4}>
          <StatCard icon={<MdOutlineFindInPage />} label="My Found Reports" value={stats.found} color="var(--cc-found)" />
        </Col>
        <Col md={4}>
          <StatCard icon={<FiCheckSquare />} label="My Claims" value={stats.claims} color="var(--cc-accent)" />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Link to="/report-lost" className="btn btn-cc-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2">
            <FiPlusCircle /> Report Lost Item
          </Link>
        </Col>
        <Col md={3} sm={6}>
          <Link to="/report-found" className="btn btn-cc-accent w-100 py-3 d-flex align-items-center justify-content-center gap-2">
            <FiPlusCircle /> Report Found Item
          </Link>
        </Col>
        <Col md={3} sm={6}>
          <Link to="/lost-items" className="btn btn-outline-secondary w-100 py-3 d-flex align-items-center justify-content-center gap-2">
            <FiSearch /> Browse Lost Items
          </Link>
        </Col>
        <Col md={3} sm={6}>
          <Link to="/found-items" className="btn btn-outline-secondary w-100 py-3 d-flex align-items-center justify-content-center gap-2">
            <FiSearch /> Browse Found Items
          </Link>
        </Col>
      </Row>

      <h5 className="cc-section-title">Recently Reported Items</h5>
      {recentItems.length === 0 ? (
        <div className="cc-empty-state">No items reported yet.</div>
      ) : (
        <Row className="g-4">
          {recentItems.map((item) => (
            <Col key={item._id} sm={6} lg={3}>
              <ItemCard item={item} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
