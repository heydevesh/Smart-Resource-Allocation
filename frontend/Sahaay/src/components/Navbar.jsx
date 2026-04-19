import { NavLink } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <h1 className="logo">Sahaay</h1>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : "nonActive"}>
          Dashboard
        </NavLink>

        <NavLink to="/map" className={({ isActive }) => isActive ? "active" : "nonActive"}>
          Needs
        </NavLink>

        <NavLink to="/volunteers" className={({ isActive }) => isActive ? "active" : "nonActive"}>
          Volunteers
        </NavLink>

        <NavLink to="/match" className={({ isActive }) => isActive ? "active" : "nonActive"}>
          Smart Match
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;