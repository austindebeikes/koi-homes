import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Search from "./pages/Search";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import AgentProfile from "./pages/AgentProfile";
import EditProfile from "./pages/EditProfile";
import NewPost from "./pages/NewPost";
import PostDetail from "./pages/PostDetail";
import Likes from "./pages/Likes";
import Pond from "./pages/Pond";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/search" element={<Search />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/agent/:id" element={<AgentProfile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/post/new" element={<NewPost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/likes" element={<Likes />} />
            <Route path="/pond" element={<Pond />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
