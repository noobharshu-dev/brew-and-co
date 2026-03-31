import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Reservation from "./pages/Reservation";
import Admin from "./pages/Admin";

// Scrolls to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <Routes>

          {/* Admin — no Navbar or Footer */}
          <Route path="/admin" element={<Admin />} />

          {/* Public site */}
          <Route path="*" element={
            <div className="flex flex-col min-h-screen font-body bg-cream text-dark">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/reservation" element={<Reservation />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />

        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;