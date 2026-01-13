// Türkiye İlleri ve İlçeleri
export interface City {
  id: string;
  name: string;
  districts: string[];
}

export const turkeyCities: City[] = [
  { id: '01', name: 'Adana', districts: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'Kozan', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Pozantı', 'Tufanbeyli', 'Feke', 'Saimbeyli', 'Aladağ'] },
  { id: '02', name: 'Adıyaman', districts: ['Merkez', 'Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Samsat', 'Sincik', 'Tut'] },
  { id: '03', name: 'Afyonkarahisar', districts: ['Merkez', 'Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'] },
  { id: '04', name: 'Ağrı', districts: ['Merkez', 'Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Patnos', 'Taşlıçay', 'Tutak'] },
  { id: '05', name: 'Amasya', districts: ['Merkez', 'Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merzifon', 'Suluova', 'Taşova'] },
  { id: '06', name: 'Ankara', districts: ['Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Güdül', 'Haymana', 'Kalecik', 'Kızılcahamam', 'Nallıhan', 'Polatlı', 'Şereflikoçhisar', 'Yenimahalle', 'Gölbaşı', 'Keçiören', 'Mamak', 'Sincan', 'Kazan', 'Akyurt', 'Etimesgut', 'Evren', 'Pursaklar'] },
  { id: '07', name: 'Antalya', districts: ['Merkez', 'Akseki', 'Alanya', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Korkuteli', 'Kumluca', 'Manavgat', 'Serik', 'Demre', 'İleri', 'Konyaaltı', 'Muratpaşa', 'Döşemealtı', 'Aksu', 'Kepez'] },
  { id: '08', name: 'Artvin', districts: ['Merkez', 'Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Murgul', 'Şavşat', 'Yusufeli'] },
  { id: '09', name: 'Aydın', districts: ['Merkez', 'Bozdoğan', 'Çine', 'Germencik', 'Karacasu', 'Koçarlı', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar', 'Buharkent', 'İncirliova', 'Karpuzlu', 'Köşk', 'Didim', 'Efeler'] },
  { id: '10', name: 'Balıkesir', districts: ['Merkez', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gönen', 'Havran', 'İvrindi', 'Kepsut', 'Manyas', 'Savaştepe', 'Sındırgı', 'Susurluk', 'Marmara', 'Gömeç', 'Altıeylül', 'Karesi'] },
  { id: '34', name: 'İstanbul', districts: ['Adalar', 'Bakırköy', 'Beşiktaş', 'Beykoz', 'Beyoğlu', 'Çatalca', 'Eyüp', 'Fatih', 'Gaziosmanpaşa', 'Kadıköy', 'Kartal', 'Sarıyer', 'Silivri', 'Şile', 'Şişli', 'Üsküdar', 'Zeytinburnu', 'Büyükçekmece', 'Kağıthane', 'Küçükçekmece', 'Pendik', 'Ümraniye', 'Bayrampaşa', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Güngören', 'Maltepe', 'Sultanbeyli', 'Tuzla', 'Esenler', 'Arnavutköy', 'Ataşehir', 'Başakşehir', 'Beylikdüzü', 'Çekmeköy', 'Esenyurt', 'Sancaktepe', 'Sultangazi'] },
  { id: '35', name: 'İzmir', districts: ['Aliağa', 'Bayındır', 'Bergama', 'Bornova', 'Çeşme', 'Dikili', 'Foça', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Menemen', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla', 'Beydağ', 'Buca', 'Konak', 'Menderes', 'Balçova', 'Çiğli', 'Gaziemir', 'Narlıdere', 'Güzelbahçe', 'Bayraklı', 'Karabağlar'] },
];

// İl arama fonksiyonu
export const searchCities = (query: string): City[] => {
  if (!query.trim()) return turkeyCities;
  const lowerQuery = query.toLowerCase();
  return turkeyCities.filter(city => 
    city.name.toLowerCase().includes(lowerQuery)
  );
};

// İlçe arama fonksiyonu
export const searchDistricts = (cityName: string, query: string): string[] => {
  const city = turkeyCities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  if (!city) return [];
  if (!query.trim()) return city.districts;
  const lowerQuery = query.toLowerCase();
  return city.districts.filter(district => 
    district.toLowerCase().includes(lowerQuery)
  );
};

// İl adından ilçeleri getir
export const getDistrictsByCity = (cityName: string): string[] => {
  const city = turkeyCities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  return city ? city.districts : [];
};

