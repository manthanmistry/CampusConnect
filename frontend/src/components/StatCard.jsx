const StatCard = ({ icon, label, value, color }) => {
  return (
    <div className="cc-stat-card d-flex align-items-center gap-3">
      <div className="stat-icon" style={color ? { backgroundColor: color } : undefined}>
        {icon}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
