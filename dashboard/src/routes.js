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
        name: "User Management",
        icon: "fa fa-users-cog text-info",
        collapse: true,
        state: "userManagementCollapse",
        views: [
            {
                path: "/user-profile",
                name: "User Profile",
                icon: "fa fa-user text-info",
                component: UserProfile,
                layout: "/admin",
            },
            {
                path: "/user-list",
                name: "User List",
                icon: "fa fa-users text-secondary",
                component: UserList,
                layout: "/admin",
            },
            {
                path: "/add-user",
                name: "Add User",
                icon: "fa fa-user-plus text-success",
                component: Register,
                layout: "/admin",
            }
        ]
    },
    {
        path: "/log-visit",
        name: "Log Visit",
        icon: "fa fa-clipboard-list text-warning",
        component: LogVisit,
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