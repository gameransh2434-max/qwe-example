import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import RewardsList from "@/pages/RewardsList";
import RewardDetail from "@/pages/RewardDetail";
import SearchResults from "@/pages/SearchResults";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import ClaimsList from "@/pages/ClaimsList";
import ClaimDetail from "@/pages/ClaimDetail";
import TicketsList from "@/pages/TicketsList";
import TicketDetail from "@/pages/TicketDetail";
import NewTicket from "@/pages/NewTicket";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClaims from "@/pages/admin/AdminClaims";
import AdminRewards from "@/pages/admin/AdminRewards";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminTickets from "@/pages/admin/AdminTickets";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/rewards" component={RewardsList} />
      <Route path="/rewards/:id" component={RewardDetail} />
      <Route path="/search" component={SearchResults} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/claims" component={ClaimsList} />
      <Route path="/claims/:id" component={ClaimDetail} />
      <Route path="/tickets" component={TicketsList} />
      <Route path="/tickets/new" component={NewTicket} />
      <Route path="/tickets/:id" component={TicketDetail} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/claims" component={AdminClaims} />
      <Route path="/admin/rewards" component={AdminRewards} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/tickets" component={AdminTickets} />
      <Route path="/admin/announcements" component={AdminAnnouncements} />

      <Route component={NotFound} />
    </Switch>
  );
}
