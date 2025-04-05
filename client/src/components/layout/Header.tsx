import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-primary-600 text-2xl">
                <i className="fas fa-map-marked-alt"></i>
              </span>
              <span className="font-montserrat font-bold text-lg md:text-xl">ZimExplore</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/itineraries" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Itineraries
            </Link>
            <Link href="#" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              About
            </Link>
            <Link href="#" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Contact
            </Link>
            <Link href="/dashboard">
              <Button className="flex items-center">
                <i className="fas fa-user-tie mr-2"></i>
                Business Login
              </Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <button 
              type="button" 
              className="text-slate-600 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
