import Navbar from "../components/Navbar.jsx";
import StatsCard from "../components/StatsCard.jsx";
import AlertBanner from "../components/AlertBanner.jsx";
import RecentActivity from "../components/RecentActivity.jsx";
import "../styles/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <br></br>
      <div className="cards">
        <StatsCard title="Active tasks" value="1200" />
        <StatsCard title="Total needs" value="1250" />
        <StatsCard title="Available volunteers" value="500" />
        <StatsCard title="Critical alerts" value="720" />
      </div>

      <AlertBanner />
      <h1 className="subTitle">Recent Activity</h1>
      <RecentActivity />
    </div>
  );
};

export default Dashboard;