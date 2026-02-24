'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    // Eğer farklı bir sayfadaysak, önce ana sayfaya git
    if (pathname !== '/') {
      window.location.href = `/#${targetId}`;
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 100; // Navbar yüksekliği için offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    // Mobil menüyü kapat
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-black/80 backdrop-blur-md shadow-lg py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center"
          >
            <Image
              src="/images/sk-logo.png"
              alt="SK Logo"
              width={50}
              height={50}
              className="mr-2 object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#projects"
              onClick={(e) => handleSmoothScroll(e, 'projects')}
              className="text-gray-200 hover:text-cyan-400 transition-colors duration-300 font-medium cursor-pointer"
            >
              Projeler
            </a>
            <a
              href="#services"
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className="text-gray-200 hover:text-cyan-400 transition-colors duration-300 font-medium cursor-pointer"
            >
              Hizmetler & Ekipmanlar
            </a>
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, 'about')}
              className="text-gray-200 hover:text-cyan-400 transition-colors duration-300 font-medium cursor-pointer"
            >
              Hakkımızda
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md cursor-pointer"
            >
              İletişim
            </a>
          </nav>

          <div className="flex items-center md:hidden">
            {/* Mobil menü butonu */}
            <button
              className="focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle mobile menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobil menü */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 py-3 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-white/10">
            <a
              href="#projects"
              onClick={(e) => handleSmoothScroll(e, 'projects')}
              className="block px-5 py-3 text-gray-200 hover:bg-white/10 hover:text-cyan-400 cursor-pointer"
            >
              Projeler
            </a>
            <a
              href="#services"
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className="block px-5 py-3 text-gray-200 hover:bg-white/10 hover:text-cyan-400 cursor-pointer"
            >
              Hizmetler & Ekipmanlar
            </a>
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, 'about')}
              className="block px-5 py-3 text-gray-200 hover:bg-white/10 hover:text-cyan-400 cursor-pointer"
            >
              Hakkımızda
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="block mx-5 my-3 py-3 text-center bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 shadow-md cursor-pointer"
            >
              İletişim
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;