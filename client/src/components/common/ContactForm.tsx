'use client';

import React, { useState } from 'react';
import axios from '@/services/api/axios';
import { Loader2, Send } from 'lucide-react';
import { getUserFriendlyMessage, handleApiError } from '@/utils/apiErrorHandler';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type ContactFormFeedback = {
  type: 'success' | 'error';
  message: string;
} | null;

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ContactFormFeedback>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFeedback({
        type: 'error',
        message: 'Lutfen tum alanlari doldurunuz',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    void axios.post('/contact/send', formData)
      .then(() => {
        setFeedback({
          type: 'success',
          message: 'Mesajiniz basariyla gonderildi. En kisa surede size donus yapacagiz.',
        });
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      })
      .catch((error: unknown) => {
        setFeedback({
          type: 'error',
          message: getUserFriendlyMessage(handleApiError(error)),
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-400/30 bg-red-500/10 text-red-200'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          İsim *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Adınız Soyadınız"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          E-posta *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="ornek@email.com"
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
          Konu *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Mesajınızın konusu"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
          Mesaj *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          rows={5}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Mesajınızı buraya yazın..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-gradient-to-r from-[#0066CC] to-[#0052A3] hover:from-[#0052A3] hover:to-[#0066CC] text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Gönder
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;
