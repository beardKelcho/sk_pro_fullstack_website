'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white dark:bg-dark-surface shadow-lg py-3'
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
              className="mr-2"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/#projects"
              className={`${
                isScrolled ? 'text-gray-800 dark:text-gray-200' : 'text-white'
              } hover:text-primary hover:dark:text-primary-light transition-colors duration-300 font-medium`}
            >
              Projeler
            </Link>
            <Link
              href="/#services"
              className={`${
                isScrolled ? 'text-gray-800 dark:text-gray-200' : 'text-white'
              } hover:text-primary hover:dark:text-primary-light transition-colors duration-300 font-medium`}
            >
              Hizmetler
            </Link>
            <Link
              href="/#equipment"
              className={`${
                isScrolled ? 'text-gray-800 dark:text-gray-200' : 'text-white'
              } hover:text-primary hover:dark:text-primary-light transition-colors duration-300 font-medium`}
            >
              Ekipmanlar
            </Link>
            <Link
              href="/#about"
              className={`${
                isScrolled ? 'text-gray-800 dark:text-gray-200' : 'text-white'
              } hover:text-primary hover:dark:text-primary-light transition-colors duration-300 font-medium`}
            >
              Hakkımızda
            </Link>
            <Link
              href="/#contact"
              className="bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md"
            >
              İletişim
            </Link>
            
            {/* Tema değiştirme butonu */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-dark-card text-gray-800 dark:text-gray-200 focus:outline-none hover:bg-gray-300 dark:hover:bg-gray-700"
              aria-label={theme === 'dark' ? 'Açık moda geç' : 'Karanlık moda geç'}
            >
              {theme === 'dark' ? (
                // Güneş ikonu (Açık mod)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                // Ay ikonu (Karanlık mod)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </nav>

          <div className="flex items-center md:hidden">
            {/* Mobil için tema değiştirme butonu */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-dark-card text-gray-800 dark:text-gray-200 focus:outline-none hover:bg-gray-300 dark:hover:bg-gray-700 mr-3"
              aria-label={theme === 'dark' ? 'Açık moda geç' : 'Karanlık moda geç'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
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
                stroke={isScrolled ? '#0A1128' : 'white'}
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
          <nav className="md:hidden mt-4 py-3 bg-white dark:bg-dark-surface rounded-lg shadow-xl">
            <Link
              href="/#projects"
              className="block px-5 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card hover:text-primary dark:hover:text-primary-light"
              onClick={toggleMenu}
            >
              Projeler
            </Link>
            <Link
              href="/#services"
              className="block px-5 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card hover:text-primary dark:hover:text-primary-light"
              onClick={toggleMenu}
            >
              Hizmetler
            </Link>
            <Link
              href="/#equipment"
              className="block px-5 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card hover:text-primary dark:hover:text-primary-light"
              onClick={toggleMenu}
            >
              Ekipmanlar
            </Link>
            <Link
              href="/#about"
              className="block px-5 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card hover:text-primary dark:hover:text-primary-light"
              onClick={toggleMenu}
            >
              Hakkımızda
            </Link>
            <Link
              href="/#contact"
              className="block mx-5 my-3 py-3 text-center bg-primary dark:bg-primary-light text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary shadow-md"
              onClick={toggleMenu}
            >
              İletişim
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar; 