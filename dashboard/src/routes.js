
import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import TableList from "views/TableList.js";
import Typography from "views/Typography.js";
import Icons from "views/Icons.js";
import Maps from "views/Maps.js";
import Notifications from "views/Notifications.js";
import Upgrade from "views/Upgrade.js";
import Register from "views/Register";
import MyProfile from "views/MyProfile";
import UserList from "views/UserList"; // Import UserList component
import LogVisit from "views/LogVisit"; // Import LogVisit component
import VisitList from "views/VisitList"; // Import VisitList component
const dashboardRoutes = [
  {
    upgrade: true,
    path: "/upgrade",
    name: "Upgrade to PRO",
    icon: "nc-icon nc-alien-33",
    component: Upgrade,
    layout: "/admin"
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin"
  },
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin"
  },
  {
    path: "/table",
    name: "Table List",
    icon: "nc-icon nc-notes",
    component: TableList,
    layout: "/admin"
  },
  {
    path: "/typography",
    name: "Typography",
    icon: "nc-icon nc-paper-2",
    component: Typography,
    layout: "/admin"
  },
  {
    path: "/icons",
    name: "Icons",
    icon: "nc-icon nc-atom",
    component: Icons,
    layout: "/admin"
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "nc-icon nc-pin-3",
    component: Maps,
    layout: "/admin"
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "nc-icon nc-bell-55",
    component: Notifications,
    layout: "/admin"
  },
  {
    path: "/add_user",
    name: "Add User",
    icon: "nc-icon nc-simple-add",
    component: Register, // Use the AddUser component
    layout: "/admin",  // Change layout to "/admin"
  },
  {
    path: "/my-profile",
    name: "My Profile",
    icon: "nc-icon nc-circle-09",
    component: MyProfile,
    layout: "/admin"
    
  },
  {
    path: "/user-list",
    name: "User List",
    icon: "nc-icon nc-circle-09",
    component: UserList,
    layout: "/admin"
  },
  {
    path: "/log-visit",
    name: "Log Visit",
    icon: "nc-icon nc-circle-09",
    component: LogVisit,
    layout: "/admin"
  },
  {
    path: "/visit-list",
    name: "Visit List",
    icon: "nc-icon nc-circle-09",
    component: VisitList,
    layout: "/admin"
  }
];

export default dashboardRoutes;
