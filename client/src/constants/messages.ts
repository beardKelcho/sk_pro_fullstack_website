export const MESSAGES = {
    ERRORS: {
        GENERIC: 'Bir hata oluştu.',
        NETWORK: 'Bağlantı hatası. Lütfen internetinizi kontrol edin.',
        UNAUTHORIZED: 'Bu işlem için yetkiniz yok.',
        NOT_FOUND: 'İstenen kaynak bulunamadı.',
        PROJECT_LOAD: 'Projeler yüklenirken bir hata oluştu.',
        PROJECT_UPDATE: 'Proje güncellenemedi.',
        PROJECT_DELETE: 'Proje silinemedi.',
    },
    SUCCESS: {
        PROJECT_UPDATE: 'Proje başarıyla güncellendi.',
        PROJECT_DELETE: 'Proje başarıyla silindi.',
        OPERATION_COMPLETED: 'İşlem başarıyla tamamlandı.',
    },
    VALIDATION: {
        REQUIRED: 'Bu alan zorunludur.',
        EMAIL: 'Geçerli bir email adresi giriniz.',
    },
    UI: {
        LOADING: 'Yükleniyor...',
        NO_DATA: 'Veri bulunamadı.',
        CONFIRM_DELETE: 'Bu öğeyi silmek istediğinize emin misiniz?',
    }
} as const;
