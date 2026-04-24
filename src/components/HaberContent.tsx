'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function HaberContent({ id, initialPost }: { id: string, initialPost?: any }) {
  const [post, setPost] = useState<any>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const { language, t } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState(initialPost?.title?.rendered || '');
  const [translatedContent, setTranslatedContent] = useState(initialPost?.content?.rendered || '');
  const [isTranslating, setIsTranslating] = useState(false);
  const [voice, setVoice] = useState<'female' | 'male'>('female');
  const [audioError, setAudioError] = useState('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioScript, setAudioScript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioProvider, setAudioProvider] = useState<'browser' | 'huggingface'>('browser');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const cleanAudioText = (title: string, content: string) => {
    return `${title}. ${content}`
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
      .replace(/<table[\s\S]*?<\/table>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/Reklam Linki/gi, ' ')
      .replace(/Advertisement/gi, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8221;|&#8243;|&rdquo;/g, '"')
      .replace(/&#8220;|&#8242;|&ldquo;/g, '"')
      .replace(/&#8217;|&rsquo;|&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const articleAudioText = useMemo(
    () => cleanAudioText(translatedTitle || post?.title?.rendered || '', translatedContent || post?.content?.rendered || ''),
    [translatedTitle, translatedContent, post]
  );

  const stopAudio = () => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const playWithBrowserVoice = (script: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error(language === 'tr' ? 'Bu cihaz sesli oynatmayı desteklemiyor.' : 'This device does not support speech playback.');
    }

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((item) => {
      const lowerName = item.name.toLowerCase();
      const matchesLang = item.lang.toLowerCase().startsWith(language);
      const matchesGender = voice === 'female'
        ? /(female|woman|zira|seda|helena|aria)/i.test(lowerName)
        : /(male|man|adam|mark|david|mert)/i.test(lowerName);
      return matchesLang && matchesGender;
    }) || voices.find((item) => item.lang.toLowerCase().startsWith(language)) || null;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : language === 'ru' ? 'ru-RU' : 'en-US';
    utterance.rate = 0.96;
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setAudioError(language === 'tr' ? 'Ses oynatma sırasında bir hata oluştu.' : 'An error occurred during playback.');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const playAudio = async () => {
    if (!articleAudioText) {
      setAudioError(language === 'tr' ? 'Seslendirilecek içerik bulunamadı.' : 'No content available for audio.');
      return;
    }

    setAudioError('');
    setIsGeneratingAudio(true);

    try {
      let script = audioScript;
      let generatedAudioUrl = audioUrl;
      let provider = audioProvider;

      if (!script) {
        const response = await fetch('/api/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: articleAudioText, targetLang: language, voice }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Audio API error');
        }

        script = data?.script || articleAudioText;
        generatedAudioUrl = data?.audioUrl || '';
        provider = data?.provider || 'browser';
        setAudioScript(script);
        setAudioUrl(generatedAudioUrl);
        setAudioProvider(provider);
      }

      stopAudio();

      if (generatedAudioUrl) {
        if (!htmlAudioRef.current) {
          htmlAudioRef.current = new Audio();
        }

        htmlAudioRef.current.src = generatedAudioUrl;
        htmlAudioRef.current.onended = () => setIsPlayingAudio(false);
        htmlAudioRef.current.onerror = () => {
          setIsPlayingAudio(false);
          setAudioError(language === 'tr' ? 'Ses dosyası oynatılamadı.' : 'Audio file could not be played.');
        };
        await htmlAudioRef.current.play();
        setIsPlayingAudio(true);
        return;
      }

      playWithBrowserVoice(script);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setAudioError(message || (language === 'tr' ? 'Ses oluşturulamadı.' : 'Audio could not be generated.'));
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  useEffect(() => {
    setAudioScript('');
    setAudioUrl('');
    setAudioProvider('browser');
    stopAudio();
  }, [language, post?.id, voice]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (htmlAudioRef.current) {
        htmlAudioRef.current.src = '';
      }
    };
  }, []);

  const handleAudioToggle = () => {
    if (isPlayingAudio) {
      stopAudio();
      return;
    }
    playAudio();
  };

  const audioHelperText = audioError || (language === 'tr' ? 'Haberi dinlemek için kadın veya erkek sesi seçip oynatabilirsiniz.' : 'Choose a female or male voice and play the article aloud.');
  const audioButtonLabel = isGeneratingAudio
    ? (language === 'tr' ? 'Hazırlanıyor...' : 'Preparing...')
    : isPlayingAudio
      ? (language === 'tr' ? 'Durdur' : 'Stop')
      : (language === 'tr' ? 'Haberi Dinle' : 'Listen to Article');
  const audioBadgeLabel = language === 'tr' ? 'Haberi Dinle' : 'Listen';
  const femaleLabel = language === 'tr' ? 'Kadın Ses' : 'Female Voice';
  const maleLabel = language === 'tr' ? 'Erkek Ses' : 'Male Voice';
  const audioBoxBorder = audioError ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid var(--border-color)';
  const audioBoxBackground = audioError ? 'rgba(231, 76, 60, 0.06)' : 'rgba(255,255,255,0.03)';
  const audioButtonCursor = isGeneratingAudio ? 'wait' : 'pointer';
  const audioPlayingText = isPlayingAudio
    ? (audioProvider === 'huggingface'
      ? (language === 'tr' ? 'Doğal ses oynatılıyor.' : 'Natural voice is playing.')
      : (language === 'tr' ? 'Tarayıcı sesi ile okunuyor.' : 'Browser voice is reading the article.'))
    : audioHelperText;
  const audioStatusColor = audioError ? '#e74c3c' : 'var(--text-muted)';
  const audioStatus = audioError ? (
    <div className="audio-status" role="alert" aria-live="assertive" style={{ color: audioStatusColor }}>
      {audioPlayingText}
    </div>
  ) : (
    <div className="audio-status" role="status" aria-live="polite" style={{ color: audioStatusColor }}>
      {audioPlayingText}
    </div>
  );
  const femaleButtonClass = voice === 'female' ? 'audio-chip audio-chip-active' : 'audio-chip';
  const maleButtonClass = voice === 'male' ? 'audio-chip audio-chip-active' : 'audio-chip';

  const isRecent = post ? (Math.floor((new Date().getTime() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24)) <= 28) : false;

  useEffect(() => {
    if (!initialPost) {
      const fetchRealPost = async () => {
        try {
          const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts/${id}?_embed`);
          if (!res.ok) throw new Error('API yanıt vermedi.');
          const data = await res.json();
          setPost(data);

          const shouldTranslate = language !== 'tr' && Math.floor((new Date().getTime() - new Date(data.date).getTime()) / (1000 * 60 * 60 * 24)) <= 28;

          if (shouldTranslate) {
            translateContent(data, language);
          } else {
            setTranslatedTitle(data.title.rendered);
            setTranslatedContent(data.content.rendered);
          }
        } catch (error) {
          console.error('Hata:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchRealPost();
    }
  }, [id]);

  useEffect(() => {
    if (post) {
      if (language !== 'tr' && isRecent) {
        translateContent(post, language);
      } else {
        setTranslatedTitle(post.title.rendered);
        setTranslatedContent(post.content.rendered);
      }
    }
  }, [language, post, isRecent]);

  const translateContent = async (data: any, lang: string) => {
    setTranslatedTitle('');
    setTranslatedContent('');
    setIsTranslating(true);

    try {
      const [titleResponse, contentResponse] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.title.rendered, targetLang: lang }),
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.content.rendered, targetLang: lang }),
        }),
      ]);

      const [titleData, contentData] = await Promise.all([
        titleResponse.json(),
        contentResponse.json(),
      ]);

      if (!titleData.translatedText || !contentData.translatedText) {
        throw new Error('Çeviri başarısız.');
      }

      setTranslatedTitle(titleData.translatedText);
      setTranslatedContent(contentData.translatedText);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hata';
      console.error(message);
      setTranslatedTitle(data.title.rendered);
      setTranslatedContent(data.content.rendered);
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>{t('loading')}...</div>;
  if (!post) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>{t('no_content')}</div>;

  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';

  return (
    <article className="container" style={{ padding: '60px 20px', maxWidth: '860px', margin: '0 auto' }}>
      <Link href="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', display: 'inline-block' }}>
        ← {t('home')}
      </Link>

      <h1 className="hero-title" style={{ fontSize: 'clamp(24px, 5vw, 42px)', marginBottom: '20px' }} dangerouslySetInnerHTML={{ __html: translatedTitle }}></h1>

      <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', marginBottom: '30px' }}>
        <span>{new Date(post.date).toLocaleDateString()}</span>
        {isTranslating && <span style={{ color: 'var(--accent-color)' }}>{language === 'tr' ? 'Çevriliyor...' : 'AI Translating...'}</span>}
      </div>

      <div className={`card audio-control-card${audioError ? ' audio-control-card-error' : ''}`}>
        <div className="audio-control-row">
          <div>
            <div className="audio-badge">{audioBadgeLabel}</div>
            {audioStatus}
          </div>

          <div className="audio-actions">
            <button type="button" onClick={() => setVoice('female')} className={femaleButtonClass}>
              {femaleLabel}
            </button>
            <button type="button" onClick={() => setVoice('male')} className={maleButtonClass}>
              {maleLabel}
            </button>
            <button type="button" onClick={handleAudioToggle} disabled={isGeneratingAudio} className="btn-primary audio-play-button">
              {audioButtonLabel}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .audio-control-card {
          padding: 20px 22px;
          margin-bottom: 28px;
          border: ${audioBoxBorder};
          background: ${audioBoxBackground};
        }
        .audio-control-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .audio-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(252, 163, 17, 0.12);
          color: var(--accent-color);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }
        .audio-status {
          font-size: 14px;
          line-height: 1.6;
        }
        .audio-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .audio-chip {
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid var(--border-color);
          background: var(--card-bg);
          color: var(--text-color);
          font-weight: 700;
          cursor: pointer;
        }
        .audio-chip-active {
          border-color: var(--accent-color);
          background: rgba(252, 163, 17, 0.14);
          color: var(--accent-color);
        }
        .audio-play-button {
          padding: 12px 18px;
          border-radius: 12px;
          cursor: ${audioButtonCursor};
          opacity: ${isGeneratingAudio ? 0.7 : 1};
        }
      `}</style>

      <img src={imageUrl} alt={post.title.rendered} style={{ width: '100%', borderRadius: '24px', marginBottom: '40px' }} />

      <div className="haber-icerik" style={{ fontSize: '18px', lineHeight: '1.8', overflowX: 'auto', clear: 'both' }} dangerouslySetInnerHTML={{ __html: translatedContent }} />

      <style jsx global>{`
        .haber-icerik { clear: both; }
        .haber-icerik::after { content: ''; display: block; clear: both; }
        .haber-icerik p { margin-bottom: 25px; clear: both; }
        .haber-icerik img { max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; display: block; clear: both; float: none !important; }
        .haber-icerik figure { margin: 24px 0; clear: both; display: block; float: none !important; }
        .haber-icerik figure img { margin: 0; }
        .haber-icerik div, .haber-icerik section, .haber-icerik article { clear: both; }
        .haber-icerik br[clear] { clear: both; }
        .haber-icerik iframe { max-width: 100%; display: block; margin: 24px 0; clear: both; }
        .haber-icerik .alignleft,
        .haber-icerik .alignright,
        .haber-icerik [style*='float:left'],
        .haber-icerik [style*='float: left'],
        .haber-icerik [style*='float:right'],
        .haber-icerik [style*='float: right'] {
          float: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        .haber-icerik table {
          width: 100%;
          min-width: max-content;
          border-collapse: collapse;
          margin: 24px 0;
          font-size: 15px;
          line-height: 1.6;
        }
        .haber-icerik th,
        .haber-icerik td {
          border: 1px solid var(--border-color);
          padding: 12px 14px;
          text-align: left;
          vertical-align: top;
        }
        .haber-icerik thead th {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-color);
          font-weight: 700;
        }
        .haber-icerik tbody tr:nth-child(even) {
          background: rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </article>
  );
}
