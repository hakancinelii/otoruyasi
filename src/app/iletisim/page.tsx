'use client';

import { useLanguage } from '../../context/LanguageContext';

export default function IletisimPage() {
  const { language } = useLanguage();

  const content = {
    tr: {
      title: 'İletişim',
      subtitle: 'Oto Rüyası ile iletişime geçmek, reklam ve iş birliği taleplerinizi iletmek veya editoryal konular hakkında bize ulaşmak için aşağıdaki bilgileri kullanabilirsiniz.',
      general: 'Genel İletişim',
      advertising: 'Reklam ve İş Birliği',
      address: 'Adres',
      phone: 'Telefon',
      email: 'E-posta',
      agency: 'Reklam Ajansı',
      social: 'Sosyal Medya',
      socialText: 'Güncel paylaşımlar ve video içerikleri için Instagram hesabımızı takip edebilirsiniz.',
      noteTitle: 'İletişim Notu',
      noteText: 'Reklam, sponsorluk, içerik iş birliği ve medya talepleriniz için e-posta üzerinden detay paylaşmanız sürecin daha hızlı ilerlemesini sağlar.'
    },
    en: {
      title: 'Contact',
      subtitle: 'You can use the details below to contact Oto Rüyası, send advertising and collaboration requests, or reach us for editorial matters.',
      general: 'General Contact',
      advertising: 'Advertising & Collaboration',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      agency: 'Advertising Agency',
      social: 'Social Media',
      socialText: 'You can follow our Instagram account for up-to-date posts and video content.',
      noteTitle: 'Contact Note',
      noteText: 'Sharing the details of your advertising, sponsorship, content collaboration and media requests by email helps the process move faster.'
    },
    de: {
      title: 'Kontakt',
      subtitle: 'Über die folgenden Informationen können Sie Oto Rüyası kontaktieren, Werbe- und Kooperationsanfragen senden oder uns zu redaktionellen Themen erreichen.',
      general: 'Allgemeiner Kontakt',
      advertising: 'Werbung & Kooperation',
      address: 'Adresse',
      phone: 'Telefon',
      email: 'E-Mail',
      agency: 'Werbeagentur',
      social: 'Soziale Medien',
      socialText: 'Für aktuelle Beiträge und Videoinhalte können Sie unserem Instagram-Konto folgen.',
      noteTitle: 'Kontakt-Hinweis',
      noteText: 'Wenn Sie Details zu Werbung, Sponsoring, Content-Kooperationen und Medienanfragen per E-Mail senden, läuft der Prozess schneller.'
    },
    ru: {
      title: 'Контакты',
      subtitle: 'Вы можете использовать приведенные ниже данные, чтобы связаться с Oto Rüyası, отправить запрос по рекламе и сотрудничеству или обратиться к нам по редакционным вопросам.',
      general: 'Общая связь',
      advertising: 'Реклама и сотрудничество',
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Эл. почта',
      agency: 'Рекламное агентство',
      social: 'Социальные сети',
      socialText: 'Вы можете подписаться на наш Instagram-аккаунт, чтобы следить за актуальными публикациями и видеоконтентом.',
      noteTitle: 'Примечание',
      noteText: 'Если вы отправите детали по рекламе, спонсорству, контент-партнерствам и медиазапросам по электронной почте, процесс пройдет быстрее.'
    }
  }[language];

  return (
    <main className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '18px' }}>{content.title}</h1>
        <p style={{ maxWidth: '860px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '18px', lineHeight: '1.7' }}>
          {content.subtitle}
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', marginTop: 0, marginBottom: '20px' }}>{content.general}</h2>
          <p style={{ marginBottom: '10px', color: 'var(--text-muted)' }}>{content.email}</p>
          <a href="mailto:otoruyasi@gmail.com" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-color)' }}>otoruyasi@gmail.com</a>
          <p style={{ marginTop: '24px', marginBottom: '10px', color: 'var(--text-muted)' }}>{content.phone}</p>
          <p style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>+90 505 476 15 31</p>
          <p style={{ marginTop: '24px', marginBottom: '10px', color: 'var(--text-muted)' }}>{content.address}</p>
          <p style={{ fontSize: '17px', fontWeight: 600, margin: 0, lineHeight: '1.6' }}>Zafer Mah. Fuzuli Sok. No: 9/14 Yenibosna / İstanbul</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', marginTop: 0, marginBottom: '20px' }}>{content.advertising}</h2>
          <p style={{ marginBottom: '10px', color: 'var(--text-muted)' }}>{content.email}</p>
          <a href="mailto:otoruyasi@gmail.com" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-color)' }}>otoruyasi@gmail.com</a>
          <p style={{ marginTop: '24px', marginBottom: '10px', color: 'var(--text-muted)' }}>{content.agency}</p>
          <p style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>AR FİLM REKLAM PRODÜKSİYON</p>
          <a href="https://www.arajans.com.tr" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: 'var(--accent-color)', fontWeight: 600 }}>
            www.arajans.com.tr
          </a>
        </div>
      </section>

      <section className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '24px', marginTop: 0, marginBottom: '16px' }}>{content.social}</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '16px' }}>{content.socialText}</p>
        <a href="https://www.instagram.com/otomobilruyasi/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '18px' }}>
          @otomobilruyasi
        </a>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '20px', marginTop: 0, marginBottom: '12px' }}>{content.noteTitle}</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', margin: 0 }}>{content.noteText}</p>
        </div>
      </section>
    </main>
  );
}
