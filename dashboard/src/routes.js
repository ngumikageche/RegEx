import Dashboard from "views/Dashboard.js";
import UserManagement from "views/usermanagement.jsx";
import Notifications from "views/Notifications.js";
import Register from "views/Register.js";
import MyProfile from "views/MyProfile.js";
import LogVisit from "views/LogVisit.js";
import VisitLog from "views/logging.jsx";
import VisitList from "views/VisitList.js";

import Catalogue from "views/Catalogue.jsx";

const dashboardRoutes = [
    // Admin Layout Routes
    {
        path: "/dashboard",
        name: "Dashboard",
        icon: "fa fa-chart-pie text-primary",
        component: Dashboard,
        layout: "/admin",
    },
    {
        path: "/catalogue",
        name: "Catalogue",
        icon: "fa fa-box-open text-success", // Use FontAwesome box-open for a modern look
        component: Catalogue,
        layout: "/admin",
    },
    {
        path: "/user-settings",
        name: "Settings",
        icon: "fa fa-users-cog text-info",
        component: UserManagement,
        layout: "/admin",
    },
    {
        path: "/log-visit",
        name: "Log Visit",
        icon: "fa fa-clipboard-list text-warning",
        component: LogVisit,
        layout: "/admin",
    },
    {
        path: "/log-activity",
        name: "Log Activity",
        icon: "fa fa-history text-primary",
        component: VisitLog,
        layout: "/admin",
    },
    {
        path: "/visit-list",
        name: "Visit List",
        icon: "fa fa-list-alt text-secondary",
        component: VisitList,
        layout: "/admin",
    },

    {
        path: "/notifications",
        name: "Notifications",
        icon: "fa fa-bell text-danger",
        component: Notifications,
        layout: "/admin",
    },

    // User Layout Routes
    {
        path: "/dashboard",
        name: "Dashboard",
        icon: "fa fa-chart-pie text-primary",
        component: Dashboard,
        layout: "/user",
    },
    {
        path: "/catalogue",
        name: "Catalogue",
        icon: "fa fa-box-open text-success", // Match admin: FontAwesome box-open
        component: Catalogue,
        layout: "/user",
    },
    {
        path: "/my-profile",
        name: "My Profile",
        icon: "fa fa-user-circle text-info",
        component: MyProfile,
        layout: "/user",
    },
    {
        path: "/log-visit",
        name: "Log Visit",
        icon: "fa fa-clipboard-list text-warning",
        component: LogVisit,
        layout: "/user",
    },
    {
        path: "/log-activity",
        name: "Log Activity",
        icon: "fa fa-history text-primary",
        component: VisitLog,
        layout: "/user",
    },
    {
        path: "/visit-list",
        name: "Visit List",
        icon: "fa fa-list-alt text-secondary",
        component: VisitList,
        layout: "/user",
    },
    {
        path: "/notifications",
        name: "Notifications",
        icon: "fa fa-bell text-danger",
        component: Notifications,
        layout: "/user",
    },
];

export default dashboardRoutes;