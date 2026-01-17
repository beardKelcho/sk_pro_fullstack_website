import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Contact form data structure
 * @interface ContactFormData
 */
interface ContactFormData {
  /** User's name */
  name: string;
  /** User's email address */
  email: string;
  /** Message content */
  message: string;
}

/**
 * Contact form component with offline support and background sync
 * Supports queued submissions when offline
 * 
 * @example
 * ```tsx
 * <ContactForm />
 * ```
 */
const ContactForm: React.FC = () => {
  const t = useTranslations('site.contactForm');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'queued' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // API endpoint'e form verilerini gönder
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      // Offline queue: SW 202 döndürebilir
      if (response.status === 202 && data?.queued) {
        setSubmitStatus('queued');
      } else if (!response.ok) {
        throw new Error(data?.message || t('errors.submitFailed'));
      } else {
        setSubmitStatus('success');
      }
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      console.error('Form gönderimi sırasında hata:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-1">
          {t('fields.name.label')}
        </label>
        <input 
          type="text" 
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-transparent"
          placeholder={t('fields.name.placeholder')}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-1">
          {t('fields.email.label')}
        </label>
        <input 
          type="email" 
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-transparent"
          placeholder={t('fields.email.placeholder')}
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-1">
          {t('fields.message.label')}
        </label>
        <textarea 
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-transparent"
          placeholder={t('fields.message.placeholder')}
        ></textarea>
      </div>
      <button 
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-[#0066CC] dark:bg-primary-light text-white py-3 rounded-lg hover:bg-[#0055AA] dark:hover:bg-primary transition-colors duration-300 font-medium ${
          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? t('button.submitting') : t('button.submit')}
      </button>

      {/* Form Durumu */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg">
          {t('status.success')}
        </div>
      )}
      {submitStatus === 'queued' && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-lg">
          {t('status.queued')}
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {t('status.error')}
        </div>
      )}
    </form>
  );
};

export default ContactForm; 