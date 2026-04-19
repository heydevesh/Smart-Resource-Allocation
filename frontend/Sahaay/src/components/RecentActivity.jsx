import "../styles/activity.css";

const RecentActivity = () => {
  return (
    <div className="activity-box">

      <div className="activity-item">
        <span>New need reported</span>
        <span>2 min ago</span>
      </div>

      <div className="activity-item">
        <span>Volunteer assigned</span>
        <span>5 min ago</span>
      </div>
    </div>
  );
};

export default RecentActivity;