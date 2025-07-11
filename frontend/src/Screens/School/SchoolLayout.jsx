// SchoolLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

function SchoolLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="h-full overflow-y-auto">
        <Navigation />
      </div>
      <div className="flex-1 p-4 overflow-y-auto h-full">
        <Outlet />
      </div>
    </div>
  );
}

export default SchoolLayout;
