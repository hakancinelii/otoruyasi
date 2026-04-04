'use client';

import { useLanguage } from '../../context/LanguageContext';

export default function GizlilikPolitikasiPage() {
  const { language } = useLanguage();

  const content = {
    tr: {
      title: 'Gizlilik Politikası',
      intro: 'Bu sayfa, Oto Rüyası ziyaretçilerine ait hangi bilgilerin işlenebileceğini, bu bilgilerin hangi amaçlarla kullanılabileceğini ve kullanıcıların hangi iletişim kanalları üzerinden bize ulaşabileceğini özetlemek amacıyla hazırlanmıştır.',
      sections: [
        {
          title: 'Toplanan Bilgiler',
          text: 'Siteyi ziyaret ettiğinizde teknik kullanım verileri, dil tercihi, tarayıcı bilgileri, sayfa gezinme davranışları ve iletişim formları ya da üyelik süreçlerinde tarafınızca paylaşılan ad, kullanıcı adı, e-posta adresi gibi bilgiler işlenebilir.'
        },
        {
          title: 'Kullanım Amaçları',
          text: 'Toplanan veriler; site deneyimini geliştirmek, içerikleri iyileştirmek, dil tercihini hatırlamak, kullanıcı işlemlerini sürdürebilmek, reklam ve iş birliği taleplerine dönüş sağlamak ve hizmet güvenliğini korumak amacıyla kullanılabilir.'
        },
        {
          title: 'Çerezler ve Tercihler',
          text: 'Sitede dil tercihi, oturum deneyimi ve tema ayarı gibi kullanıcı tercihlerini hatırlamak için çerezler ve tarayıcı depolama yöntemleri kullanılabilir. Bu bilgiler, kullanıcı deneyimini iyileştirmek için tutulur.'
        },
        {
          title: 'Analitik ve Ölçümleme',
          text: 'Site performansını ve kullanıcı etkileşimlerini anlamak amacıyla analiz ve ölçümleme araçları kullanılabilir. Bu kapsamda ziyaret, sayfa görüntüleme ve etkileşim bilgileri raporlama amacıyla değerlendirilebilir.'
        },
        {
          title: 'Üyelik ve İletişim Verileri',
          text: 'Üyelik işlemleri, giriş süreçleri veya bizimle doğrudan iletişim kurmanız halinde paylaştığınız bilgiler, talebinizi yanıtlamak ve ilgili hizmeti sunmak amacıyla kullanılabilir.'
        },
        {
          title: 'İletişim',
          text: 'Gizlilik uygulamalarına ilişkin sorularınız için otoruyasi@gmail.com veya isbirligi@otoruyasi.com adresleri üzerinden bizimle iletişime geçebilirsiniz.'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      intro: 'This page summarizes what information related to Oto Rüyası visitors may be processed, for what purposes it may be used, and through which communication channels users can reach us.',
      sections: [
        {
          title: 'Collected Information',
          text: 'When you visit the site, technical usage data, language preferences, browser information, page navigation behavior, and information such as name, username, and email address shared during contact or membership processes may be processed.'
        },
        {
          title: 'Purpose of Use',
          text: 'Collected data may be used to improve the site experience, enhance content, remember language preferences, maintain user actions, respond to advertising and collaboration requests, and protect service security.'
        },
        {
          title: 'Cookies and Preferences',
          text: 'Cookies and browser storage methods may be used to remember user preferences such as language choice, session experience, and theme setting. This information is kept to improve the user experience.'
        },
        {
          title: 'Analytics and Measurement',
          text: 'Analytics and measurement tools may be used to understand site performance and user interactions. In this context, visit, page view, and interaction data may be evaluated for reporting purposes.'
        },
        {
          title: 'Membership and Contact Data',
          text: 'Information you share during membership transactions, login processes, or direct contact with us may be used to respond to your request and provide the related service.'
        },
        {
          title: 'Contact',
          text: 'For questions regarding privacy practices, you can contact us via otoruyasi@gmail.com or isbirligi@otoruyasi.com.'
        }
      ]
    },
    de: {
      title: 'Datenschutz',
      intro: 'Diese Seite fasst zusammen, welche Informationen über Besucher von Oto Rüyası verarbeitet werden können, zu welchen Zwecken sie verwendet werden können und über welche Kommunikationskanäle Nutzer uns erreichen können.',
      sections: [
        {
          title: 'Erfasste Informationen',
          text: 'Beim Besuch der Website können technische Nutzungsdaten, Spracheinstellungen, Browserinformationen, Navigationsverhalten sowie im Rahmen von Kontakt- oder Registrierungsprozessen bereitgestellte Daten wie Name, Benutzername und E-Mail-Adresse verarbeitet werden.'
        },
        {
          title: 'Zweck der Nutzung',
          text: 'Die erhobenen Daten können verwendet werden, um das Nutzungserlebnis zu verbessern, Inhalte zu optimieren, Spracheinstellungen zu speichern, Nutzeraktionen aufrechtzuerhalten, auf Werbe- und Kooperationsanfragen zu reagieren und die Sicherheit des Dienstes zu schützen.'
        },
        {
          title: 'Cookies und Präferenzen',
          text: 'Cookies und Browser-Speichermethoden können verwendet werden, um Nutzereinstellungen wie Sprache, Sitzungserlebnis und Theme-Auswahl zu speichern. Diese Informationen werden zur Verbesserung des Nutzungserlebnisses aufbewahrt.'
        },
        {
          title: 'Analyse und Messung',
          text: 'Analyse- und Messwerkzeuge können eingesetzt werden, um die Leistung der Website und Nutzerinteraktionen zu verstehen. Besuchs-, Seitenaufruf- und Interaktionsdaten können zu Berichtszwecken ausgewertet werden.'
        },
        {
          title: 'Mitgliedschafts- und Kontaktdaten',
          text: 'Informationen, die Sie bei der Registrierung, beim Login oder bei direkter Kontaktaufnahme mit uns teilen, können verwendet werden, um Ihre Anfrage zu beantworten und den entsprechenden Service bereitzustellen.'
        },
        {
          title: 'Kontakt',
          text: 'Bei Fragen zu den Datenschutzpraktiken können Sie uns über otoruyasi@gmail.com oder isbirligi@otoruyasi.com kontaktieren.'
        }
      ]
    },
    ru: {
      title: 'Политика конфиденциальности',
      intro: 'На этой странице кратко объясняется, какие данные посетителей Oto Rüyası могут обрабатываться, в каких целях они могут использоваться и по каким каналам связи пользователи могут связаться с нами.',
      sections: [
        {
          title: 'Собираемая информация',
          text: 'При посещении сайта могут обрабатываться технические данные использования, языковые предпочтения, информация о браузере, поведение при навигации по страницам, а также данные, такие как имя, имя пользователя и адрес электронной почты, переданные в рамках обращения или регистрации.'
        },
        {
          title: 'Цели использования',
          text: 'Собранные данные могут использоваться для улучшения пользовательского опыта, развития контента, запоминания языковых настроек, поддержки пользовательских действий, ответа на рекламные и партнерские запросы и обеспечения безопасности сервиса.'
        },
        {
          title: 'Файлы cookie и предпочтения',
          text: 'Для запоминания пользовательских настроек, таких как выбор языка, состояние сессии и тема оформления, могут использоваться cookie и механизмы хранения в браузере. Эти данные сохраняются для улучшения пользовательского опыта.'
        },
        {
          title: 'Аналитика и измерение',
          text: 'Для понимания производительности сайта и взаимодействия пользователей могут использоваться аналитические и измерительные инструменты. В этом контексте данные о визитах, просмотрах страниц и взаимодействиях могут оцениваться в целях отчетности.'
        },
        {
          title: 'Данные регистрации и связи',
          text: 'Информация, которую вы передаете при регистрации, входе в систему или прямом обращении к нам, может использоваться для ответа на ваш запрос и предоставления соответствующей услуги.'
        },
        {
          title: 'Контакты',
          text: 'По вопросам, связанным с конфиденциальностью, вы можете связаться с нами по адресам otoruyasi@gmail.com или isbirligi@otoruyasi.com.'
        }
      ]
    }
  }[language];

  return (
    <main className="container" style={{ paddingTop: '60px', paddingBottom: '100px', maxWidth: '960px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '18px' }}>{content.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: '1.8', margin: 0 }}>{content.intro}</p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {content.sections.map((section) => (
          <article key={section.title} className="card" style={{ padding: '28px 32px' }}>
            <h2 style={{ fontSize: '24px', marginTop: 0, marginBottom: '14px' }}>{section.title}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', margin: 0 }}>{section.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
