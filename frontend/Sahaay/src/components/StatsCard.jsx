import "../styles/statscard.css";

const StatsCard = ({ title, value }) => {
  return (
    <div className="card">
      <h3 className="cardTitle">{title}</h3>
      <h1 className="cardValue">{value}</h1>
    </div>
  );
};

export default StatsCard;