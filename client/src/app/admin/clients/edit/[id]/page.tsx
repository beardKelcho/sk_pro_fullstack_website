'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FormError } from '@/types/form';

// Müşteri türü
interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  projectCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  notes?: string;
}


// Örnek müşteri verileri
const _sampleClients: Client[] = [
  {
    id: '1',
    name: 'TechCon Group',
    contactPerson: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@techcongroup.com',
    phone: '+90 532 123 45 67',
    address: 'Maslak Mah. Büyükdere Cad. No:123, İstanbul',
    industry: 'Etkinlik Organizasyonu',
    projectCount: 5,
    status: 'Active',
    createdAt: '2022-08-15',
    notes: 'Teknoloji sektöründeki en büyük müşterilerimizden. Yıllık olarak 3-4 büyük etkinlik yapıyorlar.'
  },
  {
    id: '2',
    name: 'X Teknoloji A.Ş.',
    contactPerson: 'Zeynep Öztürk',
    email: 'zeynep.ozturk@xteknoloji.com',
    phone: '+90 533 234 56 78',
    address: 'Kozyatağı Mah. Bağdat Cad. No:45, İstanbul',
    industry: 'Kurumsal',
    projectCount: 3,
    status: 'Active',
    createdAt: '2022-10-20',
    notes: 'Ürün tanıtımlarını genellikle canlı yayın olarak da paylaşıyorlar.'
  },
  {
    id: '3',
    name: 'Y İletişim',
    contactPerson: 'Mehmet Kaya',
    email: 'mehmet.kaya@yiletisim.com',
    phone: '+90 532 345 67 89',
    address: 'Beşiktaş Mah. Cevdetpaşa Cad. No:67, İstanbul',
    industry: 'Televizyon',
    projectCount: 2,
    status: 'Active',
    createdAt: '2023-01-05'
  },
  {
    id: '4',
    name: 'Z Organizasyon',
    contactPerson: 'Ayşe Demir',
    email: 'ayse.demir@zorganizasyon.com',
    phone: '+90 535 456 78 90',
    address: 'Bağcılar Mah. Merkez Cad. No:89, İstanbul',
    industry: 'Konser & Sahne',
    projectCount: 7,
    status: 'Active',
    createdAt: '2022-05-12',
    notes: 'Büyük konser organizasyonları yapıyorlar.'
  },
  {
    id: '5',
    name: 'Mega Holding',
    contactPerson: 'Ali Yıldız',
    email: 'ali.yildiz@megaholding.com',
    phone: '+90 534 567 89 01',
    address: 'Şişli Mah. Abide-i Hürriyet Cad. No:34, İstanbul',
    industry: 'Kurumsal',
    projectCount: 2,
    status: 'Active',
    createdAt: '2023-02-18'
  },
  {
    id: '6',
    name: 'Eğitim Kurumu',
    contactPerson: 'Selin Şahin',
    email: 'selin.sahin@egitimkurumu.edu.tr',
    phone: '+90 536 678 90 12',
    address: 'Kadıköy Mah. Bağdat Cad. No:23, İstanbul',
    industry: 'Eğitim',
    projectCount: 1,
    status: 'Inactive',
    createdAt: '2022-11-30'
  },
  {
    id: '7',
    name: 'Modern Müze',
    contactPerson: 'Burak Avcı',
    email: 'burak.avci@modernmuze.com',
    phone: '+90 537 789 01 23',
    address: 'Beyoğlu Mah. İstiklal Cad. No:56, İstanbul',
    industry: 'Müze & Sergi',
    projectCount: 2,
    status: 'Active',
    createdAt: '2023-03-10'
  }
];

// Müşteri form türü
interface ClientForm {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export default function EditClient() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  // Form durumu
  const [formData, setFormData] = useState<ClientForm>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
    status: 'Active',
    notes: ''
  });
  
  // Diğer durumlar
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [_errors, setErrors] = useState<FormError<ClientForm>>({});
  
  // Veri yükleme
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // API entegrasyonu olduğunda burada backend'den veri çekilecek
        // const response = await fetch(`/api/admin/clients/${clientId}`);
        // if (!response.ok) throw new Error('Müşteri verileri alınamadı');
        // const data = await response.json();
        // setClient(data);
        // setFormData({
        //   name: data.name,
        //   contactPerson: data.contactPerson,
        //   email: data.email,
        //   phone: data.phone,
        //   address: data.address,
        //   industry: data.industry,
        //   status: data.status,
        //   notes: data.notes || ''
        // });
        
        // Şimdilik örnek verileri kullanıyoruz
        setTimeout(() => {
          const foundClient = _sampleClients.find(c => c.id === clientId);
          
          if (foundClient) {
            setClient(foundClient);
            setFormData({
              name: foundClient.name,
              contactPerson: foundClient.contactPerson,
              email: foundClient.email,
              phone: foundClient.phone,
              address: foundClient.address,
              industry: foundClient.industry,
              status: foundClient.status,
              notes: foundClient.notes || ''
            });
          }
          
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientForm, string>> = {};
    
    // Zorunlu alanlar
    if (!formData.name.trim()) {
      newErrors.name = 'Müşteri adı gereklidir';
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'İletişim kişisi gereklidir';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form gönderim işleyici
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const { updateCustomer } = await import('@/services/customerService');
      await updateCustomer(clientId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes
      });
      
      // 2 saniye sonra müşteri detay sayfasına yönlendir
      setTimeout(() => {
        router.push(`/admin/clients/view/${clientId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      setErrors({
        form: 'Müşteri güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    }
  };
  
  // Müşteri bulunamadı gösterimi
  if (!loading && !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Müşteri Bulunamadı</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          Düzenlemek istediğiniz müşteri bulunamadı. Müşteri silinmiş olabilir veya geçersiz bir ID belirtmiş olabilirsiniz.
        </p>
        <button 
          onClick={() => router.push('/admin/clients')}
          className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors"
        >
          Müşteri Listesine Dön
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Müşteri Düzenle
            </h1>
            <Link
              href="/admin/clients"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Müşteri Listesine Dön
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : client ? (
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form içeriği */}
              </form>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Müşteri bulunamadı
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Aradığınız müşteri kaydı bulunamadı veya silinmiş olabilir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 