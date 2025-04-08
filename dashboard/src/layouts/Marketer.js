// src/layouts/Marketer.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "components/Sidebar/Sidebar.js";
import LogVisit from "views/LogVisit.js";
import VisitList from "views/VisitList.js";
import Notifications from "views/Notifications.js";

const MarketerLayout = () => {
  return (
    <div className="wrapper">
      <Sidebar layout="/marketer" />
      <div className="main-panel">
        <Routes>
          <Route path="/log-visit" element={<LogVisit />} />
          <Route path="/visit-list" element={<VisitList />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<VisitList />} /> {/* Default route */}
        </Routes>
      </div>
    </div>
  );
};

export default MarketerLayout;