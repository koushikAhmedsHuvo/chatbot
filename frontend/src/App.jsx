import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import AIMentorPage from "./pages/AIMentorPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import GroupCallPage from "./pages/GroupCallPage.jsx";
import GroupChatPage from "./pages/GroupChatPage.jsx";

import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
  path="/groups"
  element={
    <Layout showSidebar={true}>
      <GroupsPage />
    </Layout>
  }
/>

        {/* AUTH */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ONBOARDING */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <Layout showSidebar={true}>
              <NotificationsPage />
            </Layout>
          }
        />

        {/* 1-ON-1 CHAT */}
        <Route
          path="/chat/:id"
          element={
            <Layout showSidebar={false}>
              <ChatPage />
            </Layout>
          }
        />

        {/* CALL */}
        <Route path="/call/:id" element={<CallPage />} />

        {/* GROUP LIST (🔥 IMPORTANT) */}
        <Route
          path="/groups"
          element={
            <Layout showSidebar={true}>
              <GroupsPage />
            </Layout>
          }
        />

        {/* GROUP CHAT */}
        <Route
          path="/groups/:groupId"
          element={
            <Layout showSidebar={false}>
              <GroupChatPage />
            </Layout>
          }
        />

        {/* GROUP CALL */}
        <Route
          path="/group-call/:groupId"
          element={<GroupCallPage />}
        />

        {/* AI MENTOR */}
        {/* Add this inside your Routes */}
<Route
  path="/ai-mentor"
  element={
    <Layout showSidebar={true}>
      <AIMentorPage />
    </Layout>
  }
/>

        {/* FRIENDS */}
        <Route
          path="/friends"
          element={
            <Layout showSidebar={true}>
              <FriendsPage />
            </Layout>
          }
        />

      </Routes>

      <Toaster />
    </div>
  );
};

export default App;