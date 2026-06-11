import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Portal from "@/pages/Portal";
import Apps from "@/pages/Apps";
import ApiCatalog from "@/pages/ApiCatalog";
import ApiDetail from "@/pages/ApiCatalog/ApiDetail";
import Debugger from "@/pages/Debugger";
import KeysPermissions from "@/pages/KeysPermissions";
import Monitor from "@/pages/Monitor";
import Tickets from "@/pages/Tickets";
import AdminConsole from "@/pages/AdminConsole";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Portal />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/apis" element={<ApiCatalog />} />
          <Route path="/apis/:id" element={<ApiDetail />} />
          <Route path="/debugger" element={<Debugger />} />
          <Route path="/keys" element={<KeysPermissions />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/admin/audit" element={<AdminConsole />} />
          <Route path="/admin/apis" element={<AdminConsole />} />
          <Route path="/admin/permissions" element={<AdminConsole />} />
          <Route path="/admin/monitor" element={<AdminConsole />} />
          <Route path="/admin/reports" element={<AdminConsole />} />
        </Route>
      </Routes>
    </Router>
  );
}
