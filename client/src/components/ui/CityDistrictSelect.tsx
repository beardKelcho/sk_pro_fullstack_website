'use client';

import React, { useState, useRef, useEffect } from 'react';
import { turkeyCities, getDistrictsByCity, searchCities, searchDistricts } from '@/data/turkey-cities';
import { useClickOutside } from '@/hooks/useClickOutside';

interface CityDistrictSelectProps {
  cityValue?: string;
  districtValue?: string;
  onCityChange?: (city: string) => void;
  onDistrictChange?: (district: string) => void;
  cityName?: string;
  districtName?: string;
  cityId?: string;
  districtId?: string;
  cityLabel?: string;
  districtLabel?: string;
  cityRequired?: boolean;
  districtRequired?: boolean;
  cityError?: string;
  districtError?: string;
  cityDisabled?: boolean;
  districtDisabled?: boolean;
  className?: string;
}

export default function CityDistrictSelect({
  cityValue = '',
  districtValue = '',
  onCityChange,
  onDistrictChange,
  cityName = 'city',
  districtName = 'district',
  cityId = 'city',
  districtId = 'district',
  cityLabel = 'İl',
  districtLabel = 'İlçe',
  cityRequired = false,
  districtRequired = false,
  cityError,
  districtError,
  cityDisabled = false,
  districtDisabled = false,
  className = '',
}: CityDistrictSelectProps) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [filteredCities, setFilteredCities] = useState(turkeyCities);
  const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const districtInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(cityDropdownRef, () => setShowCityDropdown(false));
  useClickOutside(districtDropdownRef, () => setShowDistrictDropdown(false));

  useEffect(() => {
    if (cityValue) {
      const districts = getDistrictsByCity(cityValue);
      setFilteredDistricts(districts);
    } else {
      setFilteredDistricts([]);
    }
  }, [cityValue]);

  useEffect(() => {
    if (citySearch) {
      setFilteredCities(searchCities(citySearch));
    } else {
      setFilteredCities(turkeyCities);
    }
  }, [citySearch]);

  useEffect(() => {
    if (districtSearch && cityValue) {
      const districts = searchDistricts(cityValue, districtSearch);
      setFilteredDistricts(districts);
    } else if (cityValue) {
      setFilteredDistricts(getDistrictsByCity(cityValue));
    }
  }, [districtSearch, cityValue]);

  const handleCitySelect = (cityName: string) => {
    if (onCityChange) {
      onCityChange(cityName);
    }
    setShowCityDropdown(false);
    setCitySearch('');
    // İl değiştiğinde ilçeyi temizle
    if (onDistrictChange) {
      onDistrictChange('');
    }
  };

  const handleDistrictSelect = (districtName: string) => {
    if (onDistrictChange) {
      onDistrictChange(districtName);
    }
    setShowDistrictDropdown(false);
    setDistrictSearch('');
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* İl Seçimi */}
      <div className="relative" ref={cityDropdownRef}>
        <label htmlFor={cityId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {cityLabel} {cityRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            ref={cityInputRef}
            type="text"
            id={cityId}
            name={cityName}
            value={cityValue}
            readOnly
            onClick={() => !cityDisabled && setShowCityDropdown(!showCityDropdown)}
            className={`w-full px-4 py-2 border ${cityError
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white cursor-pointer ${cityDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            placeholder="İl seçiniz"
            disabled={cityDisabled}
            required={cityRequired}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {showCityDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="İl ara..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:outline-none dark:bg-gray-700 dark:text-white"
                autoFocus
                aria-label="İl ara"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCitySelect(city.name)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${cityValue === city.name ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                  >
                    {city.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                  İl bulunamadı
                </div>
              )}
            </div>
          </div>
        )}
        {cityError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{cityError}</p>
        )}
      </div>

      {/* İlçe Seçimi */}
      <div className="relative" ref={districtDropdownRef}>
        <label htmlFor={districtId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {districtLabel} {districtRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            ref={districtInputRef}
            type="text"
            id={districtId}
            name={districtName}
            value={districtValue}
            readOnly
            onClick={() => !districtDisabled && cityValue && setShowDistrictDropdown(!showDistrictDropdown)}
            className={`w-full px-4 py-2 border ${districtError
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white cursor-pointer ${districtDisabled || !cityValue ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            placeholder={cityValue ? 'İlçe seçiniz' : 'Önce il seçiniz'}
            disabled={districtDisabled || !cityValue}
            required={districtRequired}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {showDistrictDropdown && cityValue && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder="İlçe ara..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:outline-none dark:bg-gray-700 dark:text-white"
                autoFocus
                aria-label="İlçe ara"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((district) => (
                  <button
                    key={district}
                    type="button"
                    onClick={() => handleDistrictSelect(district)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${districtValue === district ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                  >
                    {district}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                  İlçe bulunamadı
                </div>
              )}
            </div>
          </div>
        )}
        {districtError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{districtError}</p>
        )}
      </div>
    </div>
  );
}

