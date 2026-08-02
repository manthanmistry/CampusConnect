import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiFileText, FiCheckCircle, FiUsers } from 'react-icons/fi';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await api.get('/items');
        setItems(data.data.slice(0, 8));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/lost-items?search=${encodeURIComponent(search)}`);
  };

  return (
    <>
      <section className="cc-hero">
        <Container>
          <h1>Reconnecting Students with Their Belongings</h1>
          <p className="mb-4">
            Lost something on campus? Found an item? CampusConnect helps students report, search, and claim lost
            and found belongings quickly and securely.
          </p>
          <Form onSubmit={handleSearch} className="mx-auto" style={{ maxWidth: 520 }}>
            <InputGroup size="lg">
              <Form.Control
                placeholder="Search for an item, category or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" className="btn-cc-accent">
                <FiSearch />
              </Button>
            </InputGroup>
          </Form>
          <div className="mt-4 d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/report-lost">
              <Button className="btn-cc-accent" size="lg">
                Report Lost Item
              </Button>
            </Link>
            <Link to="/report-found">
              <Button variant="outline-light" size="lg">
                Report Found Item
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="text-center mb-5 g-4">
          <Col md={4}>
            <FiFileText size={32} color="var(--cc-primary)" />
            <h5 className="mt-3 fw-bold">Report</h5>
            <p className="text-muted">Quickly report a lost or found item with details and a photo.</p>
          </Col>
          <Col md={4}>
            <FiSearch size={32} color="var(--cc-primary)" />
            <h5 className="mt-3 fw-bold">Search</h5>
            <p className="text-muted">Browse and filter items by category, location, and status.</p>
          </Col>
          <Col md={4}>
            <FiCheckCircle size={32} color="var(--cc-primary)" />
            <h5 className="mt-3 fw-bold">Claim</h5>
            <p className="text-muted">Submit a claim and get reconnected with your belongings.</p>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="cc-section-title mb-0">Recently Reported Items</h4>
          <Link to="/lost-items" className="text-decoration-none fw-semibold" style={{ color: 'var(--cc-primary)' }}>
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <div className="cc-empty-state">No items reported yet. Be the first to report one!</div>
        ) : (
          <Row className="g-4">
            {items.map((item) => (
              <Col key={item._id} sm={6} md={4} lg={3}>
                <ItemCard item={item} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default Home;
