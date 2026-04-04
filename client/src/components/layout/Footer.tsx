import Link from 'next/link';
import type { ReactNode } from 'react';

const STATIC_CONTENT = {
  companyDescription: 'Profesyonel görüntü rejisi ve medya server çözümleri ile etkinliklerinize değer katıyoruz.',
  quickLinks: [
    { label: 'Projeler', href: '/#projects' },
    { label: 'Hizmetler & Ekipmanlar', href: '/#services' },
    { label: 'Hakkımızda', href: '/#about' },
    { label: 'İletişim', href: '/#contact' },
  ],
  workingHours: [
    'Pazartesi - Cuma: 09:00 - 18:00',
    'Cumartesi: 10:00 - 14:00',
    'Pazar: Kapalı',
  ],
} as const;

type FooterContactData = {
  address?: string;
  phone?: string;
  email?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
  };
};

const STATIC_CONTACT: FooterContactData = {
  address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
  phone: '+90 544 644 93 04',
  email: 'info@skpro.com.tr',
  socialLinks: {
    instagram: 'https://www.instagram.com/skprotr/?hl=tr',
    linkedin: 'https://www.linkedin.com/company/skpro/',
  },
};

const isPlaceholderValue = (value?: string) => {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();
  return (
    normalized.includes('example.com') ||
    normalized.includes('instagram.com/example') ||
    normalized.includes('linkedin.com/company/example') ||
    normalized.includes('new york') ||
    normalized.includes('xxx xxx')
  );
};

const normalizeFooterContactData = (value: FooterContactData | null | undefined): FooterContactData => {
  if (!value) {
    return STATIC_CONTACT;
  }

  const normalized: FooterContactData = {
    address: isPlaceholderValue(value.address) ? STATIC_CONTACT.address : value.address,
    phone: isPlaceholderValue(value.phone) ? STATIC_CONTACT.phone : value.phone,
    email: isPlaceholderValue(value.email) ? STATIC_CONTACT.email : value.email,
    socialLinks: { ...STATIC_CONTACT.socialLinks },
  };

  if (value.socialLinks?.instagram && !isPlaceholderValue(value.socialLinks.instagram)) {
    normalized.socialLinks = {
      ...normalized.socialLinks,
      instagram: value.socialLinks.instagram,
    };
  }

  if (value.socialLinks?.linkedin && !isPlaceholderValue(value.socialLinks.linkedin)) {
    normalized.socialLinks = {
      ...normalized.socialLinks,
      linkedin: value.socialLinks.linkedin,
    };
  }

  return normalized;
};

const iconClassName = 'h-5 w-5';

const ContactIcon = ({ children }: { children: ReactNode }) => (
  <div className="flex-shrink-0 text-cyan-500/80 transition-colors group-hover:text-cyan-400">
    {children}
  </div>
);

const getFooterContactApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl) {
    return `${apiUrl.replace(/\/$/, '')}/cms/contact`;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (backendUrl) {
    return `${backendUrl.replace(/\/$/, '')}/api/cms/contact`;
  }

  return null;
};

const getFooterContactData = async (): Promise<FooterContactData> => {
  const endpoint = getFooterContactApiUrl();
  if (!endpoint) {
    return STATIC_CONTACT;
  }

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return STATIC_CONTACT;
    }

    const payload = await response.json();
    return normalizeFooterContactData(payload?.data);
  } catch {
    return STATIC_CONTACT;
  }
};

const Footer = async () => {
  const contactData = await getFooterContactData();

  return (
    <footer className="relative z-20 border-t border-white/10 bg-black/80 py-16 text-gray-300 backdrop-blur-lg">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <h3 className="text-xl font-bold tracking-wide text-white">SK Production</h3>
            <p className="leading-relaxed text-gray-400">{STATIC_CONTENT.companyDescription}</p>

            {contactData.socialLinks ? (
              <div className="flex space-x-4">
                {contactData.socialLinks.instagram ? (
                  <a
                    href={contactData.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 transition-all hover:bg-white/10 hover:text-cyan-400"
                    aria-label="Instagram"
                  >
                    <svg className={iconClassName} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06Zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324Zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-10.405a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
                    </svg>
                  </a>
                ) : null}
                {contactData.socialLinks.linkedin ? (
                  <a
                    href={contactData.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 transition-all hover:bg-white/10 hover:text-cyan-400"
                    aria-label="LinkedIn"
                  >
                    <svg className={iconClassName} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5ZM8 19H5V8h3v11ZM6.5 6.732c-.966 0-1.75-.79-1.75-1.764S5.534 3.204 6.5 3.204s1.75.79 1.75 1.764-.783 1.764-1.75 1.764ZM20 19h-3v-5.604c0-.88-.018-2.013-1.227-2.013-1.227 0-1.415.957-1.415 1.949V19h-3V8h2.85v1.026h.041c.345-.666 1.19-1.369 2.45-1.369 2.619 0 3.065 1.724 3.065 3.966V19Z" />
                    </svg>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="mb-6 text-xl font-bold tracking-wide text-white">Hızlı Linkler</h3>
            <ul className="space-y-3">
              {STATIC_CONTENT.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-400 transition-colors hover:text-cyan-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-600 transition-colors group-hover:bg-cyan-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-xl font-bold tracking-wide text-white">İletişim</h3>
            <ul className="space-y-4">
              {contactData.address ? (
                <li className="group flex items-start gap-3 text-gray-400">
                  <div className="mt-1">
                    <ContactIcon>
                      <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0L6.343 16.657a8 8 0 1 1 11.314 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </ContactIcon>
                  </div>
                  <span className="leading-relaxed transition-colors group-hover:text-gray-300">{contactData.address}</span>
                </li>
              ) : null}

              {contactData.phone ? (
                <li className="group flex items-center gap-3 text-gray-400">
                  <ContactIcon>
                    <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5Z" />
                    </svg>
                  </ContactIcon>
                  <a href={`tel:${contactData.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-cyan-400">
                    {contactData.phone}
                  </a>
                </li>
              ) : null}

              {contactData.email ? (
                <li className="group flex items-center gap-3 text-gray-400">
                  <ContactIcon>
                    <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 8 7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
                    </svg>
                  </ContactIcon>
                  <a href={`mailto:${contactData.email}`} className="transition-colors hover:text-cyan-400">
                    {contactData.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-xl font-bold tracking-wide text-white">Çalışma Saatleri</h3>
            <ul className="space-y-3 text-gray-400">
              {STATIC_CONTENT.workingHours.map((hours) => (
                <li key={hours} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/50" />
                  {hours}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          <p>© Copyright All right Reserved 2017 Design By SK Production Management</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
