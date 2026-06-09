import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Article from "./pages/Article";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Trending from "./pages/Trending";
import Bookmarks from "./pages/Bookmarks";
import LiveTV from "./pages/LiveTV";
import Category from "./pages/Category";
import PublishNews from "./pages/PublishNews";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReporters from "./pages/admin/AdminReporters";
import AdminAds from "./pages/admin/AdminAds";
import AdminSEO from "./pages/admin/AdminSEO";
import AdminLive from "./pages/admin/AdminLive";
import EditArticle from "./pages/admin/EditArticle";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <NotificationProvider>
            <AppShell />
          </NotificationProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className={`flex-1 ${!isAdmin ? "main-mobile-pad" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/live" element={<LiveTV />} />
          <Route path="/category/:slug" element={<Category />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="publish" element={<PublishNews />} />
            <Route path="edit/:id" element={<EditArticle />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reporters" element={<AdminReporters />} />
            <Route path="ads" element={<AdminAds />} />
            <Route path="seo" element={<AdminSEO />} />
            <Route path="live" element={<AdminLive />} />
          </Route>
        </Routes>
      </main>
      {!isAdmin && (
        <>
          <div className="hidden md:block">
            <Footer />
          </div>
          <MobileBottomNav />
        </>
      )}
    </div>
  );
}
