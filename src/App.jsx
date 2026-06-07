import React, { useState } from 'react';
import pkg from '../package.json' assert { type: 'json' };
import { 
  BookOpen, Users, Calendar, Target, 
  Brain, Palette, Archive, Sparkles, Wand2,
  Clock, X, BarChart2, Loader2, AlertCircle
} from 'lucide-react';

// --- API & HELPER FUNCTIONS ---
// ÖNEMLİ: Kodu bilgisayarınızdaki (VS Code) App.jsx dosyasına yapıştırdığınızda
// Vercel'de çalışması için bu satırı şu şekilde değiştirin:
// const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchFromGemini = async (prompt, systemInstruction) => {
  if (!apiKey) {
    throw new Error("API Anahtarı bulunamadı. Lütfen VITE_GEMINI_API_KEY ayarını yapın.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateText?key=${apiKey}`;
  const payload = {
    prompt: {
      text: `${systemInstruction}\n\n${prompt}`
    },
    temperature: 0.7
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  let lastError = null;

  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.output || data.candidates?.[0]?.content?.parts?.[0]?.text || "İçerik üretilemedi.";
    } catch (error) {
      lastError = error;
      if (i < delays.length) {
        await sleep(delays[i]);
      }
    }
  }
  throw lastError;
};

// --- DATA ---
const audienceData = [
  { id: 1, title: "Entelektüel Derinlik", desc: "Yeni perspektif, tarihsel anekdot, analitik sentez arayışı. Bilişsel kancalara (cognitive hooks) tepki verir.", icon: <Brain size={24} /> },
  { id: 2, title: "Estetik Titizlik", desc: "Minimalist, tipografi odaklı, boşlukların (negative space) kullanıldığı Dark Academia estetiği beklentisi.", icon: <Palette size={24} /> },
  { id: 3, title: "Koleksiyonerlik", desc: "Fiziksel nesne fetişizmi. Kitapları bilgi taşıyıcısı olmanın ötesinde bir kimlik inşası aracı olarak görme.", icon: <Archive size={24} /> },
];

const funnelData = [
  { level: "Top of Funnel", name: "Farkındalık (Soğuk Kitle)", width: "w-full", bg: "bg-slate-700", text: "Aforizmalar, Reels, Derinlikli Carousel içerikleri. Hedef: Marka bilinirliği, yeni takipçi kazanımı." },
  { level: "Middle of Funnel", name: "Etkileşim (Sıcak Kitle)", width: "w-4/5", bg: "bg-slate-800", text: "Yeni Kitap, Biyografi, Setler. Hedef: Ziyaretçiyi ikna etme, sepete ekleme." },
  { level: "Bottom of Funnel", name: "Dönüşüm (Satış)", width: "w-3/5", bg: "bg-rose-900", text: "İndirim, Reklam Postları, FOMO Odaklı Story'ler. Hedef: ROAS artışı, nihai satın alma." }
];

const concepts = [
  "Yeni Kitap Lansmanı", "Tekrar Basım", "Dev Setler", "Şahıslar Biyografi", 
  "Aforizmalar", "Kitap İçeriği Carousel", "Basın Açıklaması", "Özel Günler", 
  "Reklam Postları", "İndirim Storyleri", "Organik Storyler", "Reels Kapakları"
];

const calendarData = [
  { day: 1, type: "Biyografi", title: "Dünya Yaşlılar Günü & Max Weber", format: "Post" },
  { day: 2, type: "Yeni Kitap", title: "Yeni Çeviri Eser Teaser", format: "Story" },
  { day: 3, type: "Aforizma", title: "Thomas Bauer (Cennet-Cehennem)", format: "Post" },
  { day: 4, type: "Özel Gün", title: "Hayvanları Koruma Günü & Sosyobiyoloji", format: "Carousel" },
  { day: 5, type: "İndirim", title: "Hafta Sonu %15 İndirim", format: "Story" },
  { day: 6, type: "Eğitim", title: "Dünya Uzay Haftası & Bilim Devrimi", format: "Carousel" },
  { day: 7, type: "Setler", title: "35 Kitaplık Bilgi Serisi Seti", format: "Reels" },
  { day: 8, type: "Tarih", title: "Estergon Kalesi'nin Fethi", format: "Post" },
  { day: 9, type: "Biyografi", title: "Alexander Hamilton & Federalist Yazılar", format: "Post" },
  { day: 10, type: "Yeni Kitap", title: "Yeni Eser Kapak Lansmanı", format: "Post" },
  { day: 11, type: "Tekrar Basım", title: "Haşhaşiler (Heinz Halm)", format: "Fotoğraf" },
  { day: 12, type: "Aforizma", title: "Dil: Söz ve Yazının Gelişimi", format: "Post" },
  { day: 13, type: "Özel Gün", title: "Dünya Yürüyüş Günü & Mekanın Kaderi", format: "Story" },
  { day: 14, type: "İnceleme", title: "Çivisi Çıkan Dünya (Covid-19)", format: "Reels" },
  { day: 15, type: "Setler", title: "101 Kitaplık Dev Bilgi Seti", format: "Carousel" },
  { day: 16, type: "Özel Gün", title: "Tarım Günü & Vejetaryenlik", format: "Post" },
  { day: 17, type: "Basın", title: "Kurumsal Vizyon Açıklaması", format: "Post" },
  { day: 18, type: "Reklam", title: "Performans Odaklı Dark Post", format: "Sponsorlu" },
  { day: 19, type: "Biyografi", title: "Toby E. Huff & Bilim Tarihi", format: "Post" },
  { day: 20, type: "Aforizma", title: "Roma Edebiyatı Tarihi", format: "Story" },
  { day: 21, type: "Tarih", title: "İnebahtı Deniz Savaşı Atıfları", format: "Post" },
  { day: 22, type: "Carousel", title: "Sömürgecilik: Tarihi ve Sonuçları", format: "Carousel" },
  { day: 23, type: "Özel Gün", title: "Uluğ Bey'in Anılması", format: "Post" },
  { day: 24, type: "Özel Gün", title: "BM Günü & Henry Kissinger", format: "Post" },
  { day: 25, type: "Tekrar Basım", title: "İbn Rüşd ve Felsefesi", format: "Fotoğraf" },
  { day: 26, type: "İndirim", title: "Güz Okumaları İndirimi", format: "Story" },
  { day: 27, type: "Aforizma", title: "Kızılderili Tarihi", format: "Post" },
  { day: 28, type: "Özel Gün", title: "Cumhuriyet Arifesi", format: "Post" },
  { day: 29, type: "Özel Gün", title: "29 Ekim Cumhuriyet Bayramı", format: "Post" },
  { day: 30, type: "Carousel", title: "Çağdaş Metafiziğe Giriş", format: "Carousel" },
  { day: 31, type: "Özet", title: "Ekim Ayında Ne Okuduk?", format: "Reels" }
];

// --- COMPONENTS ---

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  
  // AI State - Calendar Modal
  const [generatedTexts, setGeneratedTexts] = useState({});
  const [isGeneratingModal, setIsGeneratingModal] = useState(false);
  const [modalAiError, setModalAiError] = useState(null);

  // AI State - Strategist Tab
  const [strategistTopic, setStrategistTopic] = useState("");
  const [strategistResult, setStrategistResult] = useState("");
  const [isGeneratingStrategist, setIsGeneratingStrategist] = useState(false);
  const [strategistError, setStrategistError] = useState(null);

  const appVersion = import.meta.env.VITE_APP_VERSION || pkg.version || '0.0.0';
  const appVersionLabel = `v${appVersion}`;

  const tabs = [
    { id: 'overview', label: 'Strateji Özeti', icon: <BookOpen size={18} /> },
    { id: 'audience', label: 'Tüketici Profili', icon: <Users size={18} /> },
    { id: 'funnel', label: 'Dönüşüm Hunisi', icon: <BarChart2 size={18} /> },
    { id: 'calendar', label: 'Yayın Takvimi', icon: <Calendar size={18} /> },
    { id: 'ai-strategist', label: 'AI Stratejist ✨', icon: <Wand2 size={18} className="text-[#d4af37]" /> },
  ];

  const handleGenerateModalText = async (day) => {
    setIsGeneratingModal(true);
    setModalAiError(null);
    try {
      const prompt = `Lütfen şu içerik için bir metin hazırla:
      Konsept: ${day.type}
      Konu: ${day.title}
      Format: ${day.format}
      
      Gereksinimler:
      - Hedef kitleye (tarih, felsefe, bilim okurları) uygun entelektüel kancalar (hook) kullan.
      - Ton: Dark Academia, ciddi, düşündürücü.
      - Sona uygun emojiler ve runikkitap hashtag'i ekle.`;

      const sysInstruction = "Sen Runik Kitap yayınevinin baş metin yazarı ve dijital iletişim uzmanısın. Edebi, felsefi ve ağırbaşlı bir dil kullanırsın.";
      
      const result = await fetchFromGemini(prompt, sysInstruction);
      setGeneratedTexts(prev => ({ ...prev, [day.day]: result }));
    } catch (err) {
      setModalAiError(err.message || "Metin üretilirken bir hata oluştu. VITE_GEMINI_API_KEY ayarını kontrol edin.");
    } finally {
      setIsGeneratingModal(false);
    }
  };

  const handleStrategistGenerate = async () => {
    if (!strategistTopic.trim()) return;
    setIsGeneratingStrategist(true);
    setStrategistError(null);
    try {
      const prompt = `Konu/Kitap: "${strategistTopic}"
      Lütfen bu konu için Runik Kitap hedef kitlesine uygun 3 farklı sosyal medya içerik fikri (Carousel, Reels, Story vb. karışık) önerisi üret.
      Her fikrin bir başlığı, formatı ve kısa içerik özeti olsun.`;

      const sysInstruction = "Sen yaratıcı bir sosyal medya stratejistisin. Kitap kurtları, entelektüeller ve koleksiyonerler için yenilikçi, merak uyandıran kampanyalar kurgularsın. Yanıtını liste halinde, estetik bir Markdown formatında ver.";
      
      const result = await fetchFromGemini(prompt, sysInstruction);
      setStrategistResult(result);
    } catch (err) {
      setStrategistError(err.message || "Fikirler üretilirken bir ağ hatası oluştu. VITE_GEMINI_API_KEY ayarını kontrol edin.");
    } finally {
      setIsGeneratingStrategist(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e2dfd2] font-sans selection:bg-[#4a0e17] selection:text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* SIDEBAR */}
      <nav className="w-full md:w-64 bg-[#16191f] border-r border-[#2a2f3a] p-6 flex flex-col shrink-0">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-2xl font-serif font-bold text-[#d4af37] tracking-wider uppercase">Runik Kitap</h1>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
            Dijital Panel <Sparkles size={12} className="text-[#d4af37]"/>
          </p>
        </div>
        
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#4a0e17] text-[#d4af37] shadow-lg shadow-[#4a0e17]/20 border border-[#6b1522]' 
                  : 'text-gray-400 hover:bg-[#1f232b] hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto hidden md:block pt-10">
          <div className="p-4 bg-[#1f232b] rounded-lg border border-[#2a2f3a]">
            <p className="text-xs text-gray-400 leading-relaxed">
              Gemini AI Entegrasyonu ile stratejiden üretime kesintisiz akış sağlanmıştır.
            </p>
            <p className="mt-3 text-[11px] text-[#d4af37] uppercase tracking-[0.3em] font-semibold">
              Sürüm: {appVersionLabel}
            </p>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen bg-gradient-to-br from-[#0f1115] to-[#16191f]">
        <div className="max-w-5xl mx-auto">
          
          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <header className="mb-10">
                <h2 className="text-3xl font-serif font-bold text-white mb-4">Yönetici Özeti ve Paradigma</h2>
                <p className="text-gray-400 leading-relaxed text-lg max-w-3xl">
                  Runik Kitap'ın dijital varlığı, eserlerin epistemolojik ağırlığına uygun, "Dark Academia" estetiğinde ve stratejik olarak çok ince düşünülmüş bir yapıya dayanmaktadır. Amaç, entelektüel merakı ticari dönüşüme entegre etmektir.
                </p>
              </header>

              <h3 className="text-xl font-serif text-[#d4af37] mb-6 flex items-center gap-2">
                <Target size={20} /> İletişim Konseptleri (12 Sütun)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {concepts.map((concept, idx) => (
                  <div key={idx} className="bg-[#1f232b] border border-[#2a2f3a] p-4 rounded-xl hover:border-[#4a0e17] transition-colors group cursor-pointer">
                    <p className="text-sm font-medium text-gray-300 group-hover:text-[#d4af37] transition-colors">{concept}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: AUDIENCE */}
          {activeTab === 'audience' && (
            <div className="animate-fade-in">
              <header className="mb-10 text-center">
                <h2 className="text-3xl font-serif font-bold text-white mb-4">Dijital Tüketici Profili</h2>
                <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
                  Tarih, felsefe, ekonomi ve antropoloji okurunun dijital dünyadaki bilişsel eğilimleri.
                </p>
              </header>

              <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 py-12">
                <div className="absolute hidden md:flex top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#4a0e17] rounded-full items-center justify-center border-4 border-[#16191f] z-10 shadow-[0_0_30px_rgba(74,14,23,0.5)]">
                  <span className="font-serif font-bold text-[#d4af37] text-center leading-tight">Runik<br/>Okuru</span>
                </div>
                <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-y-1/2 w-full h-[2px] bg-gradient-to-r from-[#2a2f3a] via-[#4a0e17] to-[#2a2f3a] z-0"></div>
                {audienceData.map((item) => (
                  <div key={item.id} className="relative z-10 w-full md:w-1/3 bg-[#1a1d24] border border-[#2a2f3a] p-6 rounded-2xl shadow-xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 hover:border-[#d4af37]/50">
                    <div className="w-16 h-16 bg-[#2a2f3a] rounded-full flex items-center justify-center text-[#d4af37] mb-4">
                      {item.icon}
                    </div>
                    <h3 className="font-serif text-lg text-white mb-3">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: FUNNEL */}
          {activeTab === 'funnel' && (
            <div className="animate-fade-in">
              <header className="mb-10 text-center">
                <h2 className="text-3xl font-serif font-bold text-white mb-4">Etkileşim ve Dönüşüm Hunisi</h2>
                <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
                  Organik estetiğin arkasında çalışan performans pazarlama matematiği.
                </p>
              </header>
              <div className="flex flex-col items-center justify-center gap-2 max-w-3xl mx-auto mt-8">
                {funnelData.map((tier, idx) => (
                  <div key={idx} className={`${tier.width} ${tier.bg} relative p-6 md:p-8 rounded-b-xl border-t border-white/10 shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-default flex flex-col items-center text-center group`}>
                    <div className="absolute top-2 left-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">{tier.level}</div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-white mt-2 mb-2 group-hover:text-[#d4af37] transition-colors">{tier.name}</h3>
                    <p className="text-sm text-gray-300 opacity-90 max-w-lg">{tier.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="animate-fade-in">
               <header className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-2">Örnek Yayın Takvimi</h2>
                  <p className="text-gray-400">İçerik üretmek için bir güne tıklayın.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-[#d4af37] bg-[#4a0e17]/20 px-4 py-2 rounded-full border border-[#4a0e17]">
                  <Clock size={16} /> 31 Günlük Plan
                </div>
              </header>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {calendarData.map((day) => (
                  <div 
                    key={day.day}
                    onClick={() => setSelectedDay(day)}
                    className="bg-[#1a1d24] border border-[#2a2f3a] rounded-lg p-3 hover:bg-[#232731] hover:border-[#4a0e17] transition-all cursor-pointer flex flex-col relative group min-h-[100px]"
                  >
                    {generatedTexts[day.day] && (
                      <div className="absolute top-2 right-2 text-[#d4af37]">
                        <Sparkles size={12} />
                      </div>
                    )}
                    <span className="text-[#d4af37] font-serif font-bold text-lg mb-1">{day.day}</span>
                    <span className="text-xs font-medium text-gray-300 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                      {day.title}
                    </span>
                    <div className="mt-auto pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-[#0f1115] px-2 py-1 rounded">
                        {day.format}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: AI STRATEGIST */}
          {activeTab === 'ai-strategist' && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              <header className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-[#4a0e17]/30 border border-[#4a0e17] rounded-full mb-4">
                  <Wand2 size={32} className="text-[#d4af37]" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-white mb-4">Yapay Zeka Stratejisti ✨</h2>
                <p className="text-gray-400 leading-relaxed">
                  Runik Kitap'ın ses tonuna (Tone of Voice) uygun, yepyeni kitap lansmanları veya tematik konseptler için anında içerik fikirleri üretin.
                </p>
              </header>

              <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-2xl p-6 shadow-xl">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kitap Adı, Yazar veya Odak Konu Girin
                </label>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <input 
                    type="text" 
                    value={strategistTopic}
                    onChange={(e) => setStrategistTopic(e.target.value)}
                    placeholder="Örn: Marcus Aurelius - Kendime Düşünceler"
                    className="flex-1 bg-[#0f1115] border border-[#2a2f3a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                  <button 
                    onClick={handleStrategistGenerate}
                    disabled={isGeneratingStrategist || !strategistTopic.trim()}
                    className="bg-gradient-to-r from-[#6b1522] to-[#4a0e17] hover:from-[#801b2a] hover:to-[#5e121d] text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingStrategist ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    Fikir Üret
                  </button>
                </div>

                {strategistError && (
                  <div className="mt-4 p-4 bg-red-900/20 border border-red-900 rounded-xl flex items-start gap-3 text-red-200">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm">{strategistError}</p>
                  </div>
                )}

                {strategistResult && (
                  <div className="mt-8 p-6 bg-[#0f1115] rounded-xl border border-[#2a2f3a] prose prose-invert prose-p:text-gray-300 prose-headings:text-[#d4af37] prose-headings:font-serif max-w-none">
                     <div dangerouslySetInnerHTML={{ 
                       __html: strategistResult
                         .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                         .replace(/\*(.*?)\*/g, '<em>$1</em>')
                         .replace(/\n/g, '<br/>') 
                     }} />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CALENDAR MODAL WITH AI INTEGRATION */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#16191f] border border-[#4a0e17] rounded-2xl p-6 md:p-8 max-w-md w-full relative shadow-2xl shadow-[#4a0e17]/20 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedDay(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#0f1115] p-2 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="text-[#d4af37] font-serif text-5xl font-bold mb-4 opacity-20 absolute top-6 right-16">
              {selectedDay.day}
            </div>

            <div className="inline-block px-3 py-1 bg-[#4a0e17] text-white text-xs font-bold uppercase tracking-wider rounded-md mb-4">
              {selectedDay.day}. Gün
            </div>
            
            <h3 className="text-2xl font-serif text-white mb-2 leading-tight pr-8">
              {selectedDay.title}
            </h3>
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2a2f3a]">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Konsept</p>
                <p className="text-sm font-medium text-gray-300">{selectedDay.type}</p>
              </div>
              <div className="w-px h-8 bg-[#2a2f3a]"></div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Format</p>
                <p className="text-sm font-medium text-[#d4af37]">{selectedDay.format}</p>
              </div>
            </div>
            
            {/* AI Integration Area */}
            <div className="mt-6">
              {!generatedTexts[selectedDay.day] && !isGeneratingModal && (
                <button 
                  onClick={() => handleGenerateModalText(selectedDay)}
                  className="w-full bg-[#1f232b] hover:bg-[#2a2f3a] border border-[#4a0e17] text-[#d4af37] py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={18} className="group-hover:animate-pulse" />
                  ✨ Metin Taslağı Üret
                </button>
              )}

              {isGeneratingModal && (
                <div className="w-full bg-[#1a1d24] border border-[#2a2f3a] text-gray-400 py-6 px-4 rounded-xl flex flex-col items-center justify-center gap-3">
                  <Loader2 size={24} className="animate-spin text-[#d4af37]" />
                  <span className="text-sm">Runik estetiğine uygun kelimeler seçiliyor...</span>
                </div>
              )}

              {modalAiError && (
                 <div className="mt-2 p-3 bg-red-900/20 border border-red-900 rounded-lg text-red-200 text-sm text-center">
                   {modalAiError}
                 </div>
              )}

              {generatedTexts[selectedDay.day] && !isGeneratingModal && (
                <div className="relative bg-[#0f1115] p-5 rounded-xl border border-[#4a0e17]/50 mt-2">
                  <div className="absolute -top-3 left-4 bg-[#16191f] px-2 text-[10px] text-[#d4af37] uppercase tracking-wider font-bold flex items-center gap-1 border border-[#4a0e17]/50 rounded-full">
                    <Sparkles size={10} /> AI Taslağı
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed font-serif italic"
                       dangerouslySetInnerHTML={{ 
                         __html: generatedTexts[selectedDay.day].replace(/\n/g, '<br/>') 
                       }}
                  />
                  <div className="mt-4 pt-3 border-t border-[#2a2f3a] flex justify-end">
                    <button 
                      onClick={() => handleGenerateModalText(selectedDay)}
                      className="text-xs text-gray-500 hover:text-[#d4af37] flex items-center gap-1 transition-colors"
                    >
                      <Wand2 size={12} /> Yeniden Üret
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f1115; }
        ::-webkit-scrollbar-thumb { background: #2a2f3a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #4a0e17; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}