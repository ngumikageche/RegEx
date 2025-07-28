import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import TableList from "views/TableList.js";
import Typography from "views/Typography.js";
import Icons from "views/Icons.js";
import Maps from "views/Maps.js";
import Notifications from "views/Notifications.js";
import Register from "views/Register.js";
import MyProfile from "views/MyProfile.js";
import UserList from "views/UserList.js";
import LogVisit from "views/LogVisit.js";
import VisitList from "views/VisitList.js";

import Catalogue from "views/Catalogue.js";

const dashboardRoutes = [
    // Admin Layout Routes
    {
        path: "/dashboard",
        name: "Dashboard",
        icon: "nc-icon nc-chart-pie-35",
        component: Dashboard,
        layout: "/admin",
    },
    {
        path: "/catalogue",
        name: "Catalogue",
        icon: "nc-icon nc-book-bookmark",
        component: Catalogue,
        layout: "/admin",
    },
    {
        path: "/user-profile",
        name: "User Profile",
        icon: "nc-icon nc-single-02",
        component: UserProfile,
        layout: "/admin",
    },
    {
        path: "/user-list",
        name: "User List",
        icon: "nc-icon nc-bullet-list-67",
        component: UserList,
        layout: "/admin",
    },
    {
        path: "/add-user",
        name: "Add User",
        icon: "nc-icon nc-simple-add",
        component: Register,
        layout: "/admin",
    },
    {
        path: "/log-visit",
        name: "Log Visit",
        icon: "nc-icon nc-notes",
        component: LogVisit,
        layout: "/admin",
    },
    {
        path: "/visit-list",
        name: "Visit List",
        icon: "nc-icon nc-bullet-list-67",
        component: VisitList,
        layout: "/admin",
    },

    {
        path: "/notifications",
        name: "Notifications",
        icon: "nc-icon nc-bell-55",
        component: Notifications,
        layout: "/admin",
    },

    // User Layout Routes
    {
        path: "/dashboard",
        name: "Dashboard",
        icon: "nc-icon nc-chart-pie-35",
        component: Dashboard,
        layout: "/user",
    },
    {
        path: "/catalogue",
        name: "Catalogue",
        icon: "nc-icon nc-book-bookmark",
        component: Catalogue,
        layout: "/user",
    },
    {
        path: "/my-profile",
        name: "My Profile",
        icon: "nc-icon nc-circle-09",
        component: MyProfile,
        layout: "/user",
    },
    {
        path: "/log-visit",
        name: "Log Visit",
        icon: "nc-icon nc-notes",
        component: LogVisit,
        layout: "/user",
    },
    {
        path: "/visit-list",
        name: "Visit List",
        icon: "nc-icon nc-bullet-list-67",
        component: VisitList,
        layout: "/user",
    },
    {
        path: "/notifications",
        name: "Notifications",
        icon: "nc-icon nc-bell-55",
        component: Notifications,
        layout: "/user",
    },
];

export default dashboardRoutes;