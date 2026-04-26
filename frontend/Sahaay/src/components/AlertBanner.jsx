import "../styles/alert.css";

const AlertBanner = () => {
  return (
    <div className="alert-box">
      <div className="alert-header">
        <span>Alert</span>
        <span className="close">✕</span>
      </div>
      <p className="alert-content">The cyclone is near kerela</p>
    </div>
  );
};

export default AlertBanner;