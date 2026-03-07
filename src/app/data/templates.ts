import { Plus, Briefcase, Mail, BookOpen, FileText, FileSearch, FileType, GraduationCap, Receipt, Users, PenTool, Clapperboard, StickyNote, Crown, Heart, ClipboardList, ScrollText, BarChart, Newspaper, ListChecks, Presentation, FolderKanban, Award, Feather, UserCheck, PieChart, Library } from "lucide-react";

export interface Template {
    id: string;
    title: string;
    description: string;
    icon: any;
    content: string;
    color: string;
    category: string;
}

export const TEMPLATE_CATEGORIES = [
    { id: "blank", label: "Boş Belgeler" },
    { id: "professional", label: "Profesyonel" },
    { id: "business", label: "İş Dünyası" },
    { id: "creative", label: "Yaratıcı Yazarlık" },
    { id: "education", label: "Eğitim" },
    { id: "personal", label: "Kişisel" },
    { id: "tools", label: "Araçlar" },
    { id: "converters", label: "Dönüştürücüler" },
];

export const TEMPLATES: Template[] = [
    // ─── Boş Belgeler ────────────────────────────────
    {
        id: "blank",
        title: "Boş Belge",
        description: "Sıfırdan başlayın",
        icon: Plus,
        content: "<h1>Adsız Belge</h1><p>Yazmaya başlayın...</p>",
        color: "bg-blue-500",
        category: "blank"
    },
    {
        id: "diary",
        title: "Günlük",
        description: "Bugün neler oldu?",
        icon: Feather,
        content: `<h1>Sevgili Günlük,</h1>
<p><i>${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</i></p>
<br/>
<p>Bugün...</p>`,
        color: "bg-indigo-500",
        category: "personal"
    },

    // ─── Profesyonel ─────────────────────────────────
    {
        id: "resume-modern",
        title: "Modern Özgeçmiş",
        description: "Şık ve modern tasarım",
        icon: Briefcase,
        content: `<h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 8px;">AHMET YILMAZ</h1>
<p style="color: #64748b; font-size: 14px;">Kıdemli Yazılım Mühendisi | İstanbul, Türkiye | ahmet.yilmaz@email.com | +90 555 123 4567</p>

<h2 style="color: #2563eb; margin-top: 24px;">Profesyonel Özet</h2>
<p>10+ yıllık deneyime sahip, büyük ölçekli web uygulamaları ve mikro hizmet mimarileri konusunda uzmanlaşmış Full-Stack Yazılım Mühendisi. React, Node.js ve bulut teknolojileri alanında derin teknik bilgi. Agile metodolojileri ile çalışma ve ekip liderliği konusunda kanıtlanmış başarı.</p>

<h2 style="color: #2563eb;">İş Deneyimi</h2>
<h3>Kıdemli Yazılım Mühendisi — TechCorp Türkiye</h3>
<p style="color: #64748b; font-size: 13px;">Ocak 2021 - Günümüz | İstanbul</p>
<ul>
<li>Aylık 2M+ kullanıcıya hizmet veren e-ticaret platformunun yeniden mimarisini tasarladı</li>
<li>Mikro hizmet geçişine liderlik ederek sistem yanıt süresini %40 azalttı</li>
<li>5 kişilik geliştirici ekibine mentorluk yaparak ekip verimliliğini %30 artırdı</li>
<li>CI/CD pipeline'larını kurarak deployment süresini 2 saatten 15 dakikaya düşürdü</li>
</ul>

<h3>Yazılım Geliştirici — InnoSoft A.Ş.</h3>
<p style="color: #64748b; font-size: 13px;">Haziran 2018 - Aralık 2020 | Ankara</p>
<ul>
<li>React ve TypeScript ile kurumsal müşteri portalı geliştirdi</li>
<li>RESTful API tasarımı ve implementasyonu gerçekleştirdi</li>
<li>PostgreSQL veritabanı optimizasyonlarıyla sorgu süresini %60 iyileştirdi</li>
</ul>

<h2 style="color: #2563eb;">Eğitim</h2>
<h3>Bilgisayar Mühendisliği, Yüksek Lisans</h3>
<p style="color: #64748b;">İstanbul Teknik Üniversitesi — 2018</p>
<h3>Bilgisayar Mühendisliği, Lisans</h3>
<p style="color: #64748b;">Orta Doğu Teknik Üniversitesi — 2016</p>

<h2 style="color: #2563eb;">Teknik Beceriler</h2>
<p><strong>Diller:</strong> JavaScript, TypeScript, Python, Java, Go</p>
<p><strong>Frontend:</strong> React, Next.js, Vue.js, Tailwind CSS</p>
<p><strong>Backend:</strong> Node.js, Express, Django, Spring Boot</p>
<p><strong>Veritabanı:</strong> PostgreSQL, MongoDB, Redis</p>
<p><strong>Araçlar:</strong> Docker, Kubernetes, AWS, Git, Jenkins</p>

<h2 style="color: #2563eb;">Diller</h2>
<p>Türkçe (Anadil) | İngilizce (İleri) | Almanca (Orta)</p>`,
        color: "bg-violet-600",
        category: "professional"
    },
    {
        id: "resume-classic",
        title: "Klasik Özgeçmiş",
        description: "Geleneksel ve resmi format",
        icon: Briefcase,
        content: `<h1 style="text-align: center; letter-spacing: 4px;">AYŞE DEMİR</h1>
<p style="text-align: center; color: #666; font-size: 13px;">Pazarlama Müdürü<br/>İstanbul, Türkiye | ayse.demir@email.com | +90 532 987 6543</p>
<hr/>

<h2>KARİYER HEDEFİ</h2>
<p>15 yıllık deneyime sahip, dijital pazarlama stratejileri ve marka yönetimi konusunda uzmanlaşmış pazarlama profesyoneli. Veri odaklı karar verme ve yaratıcı kampanya yönetimi ile şirket gelirlerini artırma konusunda kanıtlanmış başarılar.</p>

<h2>İŞ DENEYİMİ</h2>
<p><strong>Pazarlama Müdürü</strong> — GlobalMarka A.Ş.<br/><em>Mart 2020 - Günümüz</em></p>
<ul>
<li>Yıllık 5M TL bütçeli pazarlama departmanını yönetiyor</li>
<li>Dijital pazarlama stratejileriyle marka bilinirliğini %45 artırdı</li>
<li>SEO ve içerik pazarlaması ile organik trafiği 3 kat büyüttü</li>
</ul>

<p><strong>Kıdemli Pazarlama Uzmanı</strong> — MediaTürk<br/><em>Ocak 2017 - Şubat 2020</em></p>
<ul>
<li>Sosyal medya kampanyaları ile etkileşim oranını %200 artırdı</li>
<li>E-posta pazarlama otomasyonu kurarak dönüşüm oranını %35 yükseltti</li>
</ul>

<h2>EĞİTİM</h2>
<p><strong>İşletme Yüksek Lisansı (MBA)</strong><br/>Koç Üniversitesi — 2017</p>
<p><strong>İletişim Fakültesi, Lisans</strong><br/>Galatasaray Üniversitesi — 2012</p>

<h2>SERTİFİKALAR</h2>
<ul>
<li>Google Analytics Sertifikası</li>
<li>HubSpot Inbound Marketing Sertifikası</li>
<li>Facebook Blueprint Sertifikası</li>
</ul>

<h2>REFERANSLAR</h2>
<p>Talep üzerine sunulacaktır.</p>`,
        color: "bg-zinc-700",
        category: "professional"
    },
    // ─── Dönüştürücüler ──────────────────────────────
    {
        id: "pdf-to-pptx",
        title: "PDF'den PPTX'e",
        description: "PDF dosyasını PowerPoint sunumuna dönüştür",
        icon: PieChart,
        content: "",
        color: "bg-orange-600",
        category: "converters",
    },
    {
        id: "pptx-to-pdf",
        title: "PPTX'ten PDF'e",
        description: "PowerPoint dosyasını PDF belgesine dönüştür",
        icon: Library,
        content: "",
        color: "bg-blue-600",
        category: "converters",
    },
    {
        id: "pdf-to-word",
        title: "PDF'den Word'e",
        description: "PDF dosyasını düzenlenebilir Word belgesine çevir",
        icon: FileText,
        content: "",
        color: "bg-blue-500",
        category: "converters"
    },
    {
        id: "word-to-pdf",
        title: "Word'den PDF'e",
        description: "Word belgesini PDF formatına dönüştür",
        icon: FileSearch,
        content: "",
        color: "bg-red-500",
        category: "converters"
    },
    {
        id: "resume-creative",
        title: "Yaratıcı Özgeçmiş",
        description: "Göz alıcı ve farklı tasarım",
        icon: Crown,
        content: `<h1 style="color: #e11d48; font-size: 32px;">✦ EMRE KAYA</h1>
<p style="font-size: 18px; color: #e11d48; font-weight: 600;">UI/UX Tasarımcı & Yaratıcı Yönetmen</p>
<p style="color: #94a3b8;">emre@studio.com | Portfolio: emrekaya.design | İstanbul</p>

<h2 style="color: #e11d48;">🎨 Hakkımda</h2>
<p>Kullanıcı deneyimini sanata dönüştüren, 8 yıllık deneyime sahip UI/UX tasarımcısı. Minimalist estetik ile işlevselliği harmanlayan, ödüllü projeler geliştirdim. Figma, Adobe Creative Suite ve modern web teknolojilerinde uzmanım.</p>

<h2 style="color: #e11d48;">💼 Projeler & Deneyim</h2>
<h3>Baş Tasarımcı — PixelPerfect Studio</h3>
<p><em>2022 - Günümüz</em></p>
<ul>
<li>50+ marka için kurumsal kimlik tasarımı</li>
<li>Webby Awards 2024 Finalist — En İyi Mobil Uygulama Tasarımı</li>
<li>Design System oluşturarak tasarım sürecini %50 hızlandırdı</li>
</ul>

<h3>UI/UX Tasarımcı — Digital Minds Agency</h3>
<p><em>2019 - 2022</em></p>
<ul>
<li>E-ticaret uygulaması redesign projesiyle dönüşüm oranını %40 artırdı</li>
<li>Kullanıcı araştırması ve A/B testleri ile UX optimizasyonu</li>
</ul>

<h2 style="color: #e11d48;">🛠 Araçlar & Yetenekler</h2>
<p><strong>Tasarım:</strong> Figma, Sketch, Adobe XD, Photoshop, Illustrator, After Effects</p>
<p><strong>Kod:</strong> HTML/CSS, React, Framer Motion, Three.js</p>
<p><strong>Metodoloji:</strong> Design Thinking, User Research, Rapid Prototyping</p>

<h2 style="color: #e11d48;">🏆 Ödüller</h2>
<ul>
<li>Webby Awards 2024 — Finalist</li>
<li>A'Design Award 2023 — Gümüş</li>
<li>Awwwards Site of the Day — 3 kez</li>
</ul>`,
        color: "bg-rose-600",
        category: "professional"
    },
    {
        id: "cover-letter",
        title: "Kapak Mektubu",
        description: "İş başvurusu kapak mektubu",
        icon: Mail,
        content: `<p style="text-align: right;">19 Şubat 2026</p>

<p><strong>Ali Veli</strong><br/>İnsan Kaynakları Müdürü<br/>XYZ Teknoloji A.Ş.<br/>Maslak, İstanbul</p>

<p>Sayın Veli,</p>

<p>XYZ Teknoloji A.Ş.'de açık olan Kıdemli Yazılım Mühendisi pozisyonu için başvurumu sunmaktan büyük memnuniyet duyarım. On yılı aşkın yazılım geliştirme deneyimim ve modern web teknolojileri konusundaki uzmanlığımla, ekibinize önemli katkılar sağlayabileceğime inanıyorum.</p>

<p>Mevcut pozisyonumda, aylık 2 milyondan fazla kullanıcıya hizmet veren büyük ölçekli bir e-ticaret platformunun yeniden mimarisini başarıyla tasarladım. Mikro hizmet geçişine liderlik ederek sistem yanıt sürelerini %40 azalttım ve CI/CD süreçlerini optimize ederek deployment süresini 2 saatten 15 dakikaya düşürdüm.</p>

<p>Şirketinizin yenilikçi yaklaşımı ve teknoloji vizyonu beni çok heyecanlandırıyor. Özellikle yapay zeka entegrasyonlu ürünleriniz ve açık kaynak topluluğuna olan katkılarınız, kariyerimin bir sonraki adımı için ideal bir ortam sunuyor.</p>

<p>Başvurumu değerlendirmenizi ve uygun bir zamanda görüşme fırsatı vermenizi rica ederim.</p>

<p>Saygılarımla,</p>
<br/>
<p><strong>Ahmet Yılmaz</strong><br/>ahmet.yilmaz@email.com<br/>+90 555 123 4567</p>`,
        color: "bg-teal-600",
        category: "professional"
    },

    // ─── İş Dünyası ──────────────────────────────────
    {
        id: "business-letter",
        title: "Resmi İş Mektubu",
        description: "Kurumsal yazışma şablonu",
        icon: Mail,
        content: `<p style="text-align: right;"><strong>ABC Danışmanlık A.Ş.</strong><br/>Levent Mahallesi, İş Kuleleri No:42<br/>34330 Beşiktaş, İstanbul<br/>Tel: +90 212 555 0000</p>

<p>19 Şubat 2026</p>

<p>Sayın Mehmet Bey,<br/>Genel Müdür<br/>DEF Endüstri Ltd. Şti.<br/>Organize Sanayi Bölgesi, Kayseri</p>

<p><strong>Konu:</strong> İş Birliği Teklifi Hakkında</p>

<p>Sayın Mehmet Bey,</p>

<p>Şirketinizin sektördeki başarılı çalışmalarını yakından takip etmekteyiz. ABC Danışmanlık olarak, dijital dönüşüm ve süreç optimizasyonu alanındaki 15 yıllık deneyimimizle, DEF Endüstri'nin büyüme hedeflerine katkıda bulunabileceğimize inanıyoruz.</p>

<p>Ekte sunduğumuz iş birliği teklifimizi incelemenizi rica eder, uygun bir tarihte detayları görüşmek üzere bir toplantı planlamaktan memnuniyet duyarız.</p>

<p>Saygılarımla,</p>
<br/>
<p><strong>Dr. Zeynep Aksoy</strong><br/>Kurucu Ortak<br/>ABC Danışmanlık A.Ş.</p>`,
        color: "bg-emerald-600",
        category: "business"
    },
    {
        id: "meeting-minutes",
        title: "Toplantı Tutanağı",
        description: "Profesyonel toplantı notları",
        icon: Users,
        content: `<h1 style="color: #1e3a5f;">Toplantı Tutanağı</h1>
<hr/>

<p><strong>Tarih:</strong> 19 Şubat 2026, Çarşamba</p>
<p><strong>Saat:</strong> 14:00 - 15:30</p>
<p><strong>Yer:</strong> Ana Toplantı Salonu / Zoom</p>
<p><strong>Toplantı Başkanı:</strong> Ali Yıldız</p>
<p><strong>Yazman:</strong> Seda Kara</p>

<h2>Katılımcılar</h2>
<ul>
<li>Ali Yıldız — Genel Müdür</li>
<li>Seda Kara — Proje Yöneticisi</li>
<li>Burak Demir — Teknik Lider</li>
<li>Elif Şahin — Pazarlama Müdürü</li>
<li>Can Özkan — Finans Direktörü</li>
</ul>

<h2>Gündem Maddeleri</h2>
<ol>
<li>Q1 2026 performans değerlendirmesi</li>
<li>Yeni ürün lansmanı zaman çizelgesi</li>
<li>Bütçe revizyonu</li>
<li>Diğer konular</li>
</ol>

<h2>Kararlar</h2>
<ul>
<li>✅ Q1 hedeflerinin %95'i karşılandı, Q2 hedefleri %10 yukarı revize edilecek</li>
<li>✅ Yeni ürün lansmanı 15 Nisan 2026 olarak belirlendi</li>
<li>✅ Pazarlama bütçesi %15 artırıldı</li>
</ul>

<h2>Aksiyon Maddeleri</h2>
<ul>
<li>[ ] Burak — Teknik hazırlık raporunu 1 Mart'a kadar sunacak</li>
<li>[ ] Elif — Lansman kampanya planını 5 Mart'a kadar hazırlayacak</li>
<li>[ ] Can — Revize bütçe tablosunu yönetim kuruluna sunacak</li>
</ul>

<p><strong>Sonraki Toplantı:</strong> 5 Mart 2026, Çarşamba, 14:00</p>`,
        color: "bg-indigo-600",
        category: "business"
    },
    {
        id: "proposal",
        title: "Teklif Mektubu",
        description: "Profesyonel iş teklifi",
        icon: FileText,
        content: `<h1 style="color: #1e40af; text-align: center;">İŞ TEKLİFİ</h1>
<p style="text-align: center; color: #64748b;">ABC Teknoloji — Web Geliştirme Hizmetleri</p>
<hr/>

<h2>1. Proje Özeti</h2>
<p>Bu teklif, DEF Şirketi için kurumsal web sitesi ve e-ticaret platformu geliştirme projesini kapsamaktadır. Proje, modern web teknolojileri kullanılarak 12 haftalık sürede tamamlanacaktır.</p>

<h2>2. Kapsam</h2>
<ul>
<li>Responsive kurumsal web sitesi tasarımı ve geliştirmesi</li>
<li>E-ticaret modülü entegrasyonu</li>
<li>İçerik yönetim sistemi (CMS)</li>
<li>SEO optimizasyonu</li>
<li>Mobil uygulama (iOS & Android)</li>
<li>6 aylık bakım ve destek</li>
</ul>

<h2>3. Fiyatlandırma</h2>

<p><strong>Web Sitesi Tasarımı:</strong> ₺85.000</p>
<p><strong>E-Ticaret Modülü:</strong> ₺65.000</p>
<p><strong>Mobil Uygulama:</strong> ₺120.000</p>
<p><strong>Bakım (6 ay):</strong> ₺18.000</p>
<p style="font-size: 18px;"><strong>Toplam: ₺288.000 + KDV</strong></p>

<h2>4. Zaman Çizelgesi</h2>
<ul>
<li><strong>Hafta 1-2:</strong> Keşif ve planlama</li>
<li><strong>Hafta 3-6:</strong> Tasarım ve prototipleme</li>
<li><strong>Hafta 7-10:</strong> Geliştirme</li>
<li><strong>Hafta 11-12:</strong> Test ve lansman</li>
</ul>

<h2>5. Ödeme Koşulları</h2>
<p>Projenin %30'u sözleşme imzalanmasında, %40'ı orta teslimatta, %30'u final teslimatta ödenecektir.</p>

<br/>
<p><strong>Onay:</strong> ___________________________</p>
<p><strong>Tarih:</strong> ___________________________</p>`,
        color: "bg-blue-700",
        category: "business"
    },
    {
        id: "invoice",
        title: "Fatura Şablonu",
        description: "Profesyonel fatura",
        icon: Receipt,
        content: `<h1 style="color: #059669; border-bottom: 3px solid #059669; padding-bottom: 8px;">FATURA</h1>

<p><strong>Gönderen:</strong> ABC Çözümleri A.Ş.<br/>Kadıköy, İstanbul<br/>VKN: 1234567890</p>

<p><strong>Alıcı:</strong> XYZ Ltd. Şti.<br/>Çankaya, Ankara<br/>VKN: 0987654321</p>

<p><strong>Fatura No:</strong> 2026-0219<br/><strong>Tarih:</strong> 19 Şubat 2026<br/><strong>Vade:</strong> 19 Mart 2026</p>

<hr/>

<h2>Kalemler</h2>

<p>1. Web Sitesi Geliştirme Hizmeti — ₺45.000</p>
<p>2. Logo ve Kurumsal Kimlik Tasarımı — ₺12.000</p>
<p>3. SEO Danışmanlığı (3 Aylık) — ₺9.000</p>
<p>4. Hosting ve Domain (1 Yıl) — ₺2.400</p>

<hr/>

<p><strong>Ara Toplam:</strong> ₺68.400</p>
<p><strong>KDV (%20):</strong> ₺13.680</p>
<p style="font-size: 20px; color: #059669;"><strong>GENEL TOPLAM: ₺82.080</strong></p>

<hr/>

<p><strong>Banka Bilgileri:</strong><br/>ABC Çözümleri A.Ş.<br/>Garanti BBVA — TR12 3456 7890 1234 5678 9012 34<br/>Açıklama: Fatura No 2026-0219</p>`,
        color: "bg-emerald-700",
        category: "business"
    },

    // ─── Yaratıcı Yazarlık ──────────────────────────
    {
        id: "novel-chapter",
        title: "Roman Bölümü",
        description: "Başyapıtınızı yazın",
        icon: BookOpen,
        content: `<h1 style="text-align: center; margin-top: 60px; letter-spacing: 6px; color: #1a1a1a;">BİRİNCİ BÖLÜM</h1>
<h2 style="text-align: center; color: #666; font-style: italic; font-weight: 400;">Karanlık Sular</h2>

<br/>

<p>Rüzgâr, zamanın unuttuğu sırları fısıldayarak kadim ağaçların arasından uğulduyordu. Eylül'ün son günleriydi ve yapraklar henüz rengini değiştirmeye başlamamıştı, ama havada bir değişimin kokusu vardı — taze kesilen çimenin ve yaklaşan yağmurun o bildik kokusu.</p>

<p>Elif, göl kenarındaki eski iskeleye oturmuş, ayaklarını suyun üzerinde sallandırıyordu. Cebindeki mektup — büyükannesinin son mektubu — avucunun içinde ter bırakıyordu. Onu açmaya cesaret edemiyordu. Çünkü biliyordu ki, o zarfın içindeki kelimeler her şeyi değiştirecekti.</p>

<p>"Bazı kapılar bir kez açıldı mı," demişti büyükannesi son görüşmelerinde, gözlerinde o bildik ışıltıyla, "bir daha asla kapanmaz."</p>

<p style="text-align: center; color: #999;">* * *</p>

<p>Kasaba küçüktü — herkesin herkesi tanıdığı, sırların duvarlarda yankılandığı türden bir yer. Elif burada büyümüştü ama hiçbir zaman tam olarak ait hissetmemişti. Belki de bunun nedeni, ailesinin bu kasabadaki en eski evde yaşaması değil, o evin altındaki bodrumda gizlenen şeylerdi.</p>

<p>Güneş batmaya başladığında, suyun yüzeyinde altın rengi dalgalanmalar belirdi. Elif derin bir nefes aldı ve zarfı açtı.</p>

<p style="font-style: italic; margin-left: 40px;">"Sevgili torunum, bu mektubu okuduğunda ben artık yanında olmayacağım. Ama bilmeni istiyorum ki, sana bıraktığım en değerli miras o eski evdeki anahtar. Onu bul. Ve ne olursa olsun, bodrum katındaki kapıyı aç..."</p>`,
        color: "bg-orange-600",
        category: "creative"
    },
    {
        id: "screenplay",
        title: "Senaryo Taslağı",
        description: "Film veya dizi senaryosu",
        icon: Clapperboard,
        content: `<h1 style="text-align: center; letter-spacing: 8px;">KAYIP ŞEHIR</h1>
<p style="text-align: center; color: #666;">Yazan: [Adınız]</p>
<p style="text-align: center; color: #666;">Taslak 1 — 19 Şubat 2026</p>

<hr/>

<h2>SAHNE 1 - DIŞ. İSTANBUL BOĞAZI - GECE</h2>

<p style="font-style: italic; color: #555;">Dolunay, Boğaz'ın karanlık sularını aydınlatıyor. Uzakta bir vapur düdüğü duyuluyor. Kamera yavaşça su yüzeyinden yükselip, sahildeki eski bir yalıya odaklanıyor.</p>

<p style="text-align: center; font-weight: bold; text-transform: uppercase;">ELİF (30)</p>
<p style="text-align: center; margin-left: 80px; margin-right: 80px;">Yalının balkonunda durmuş, elindeki eski fotoğrafa bakıyor.</p>

<p style="margin-left: 120px;"><strong>ELİF</strong><br/>(kendi kendine)<br/>Bu fotoğraftaki kadın kim? Ve neden annemin kolye ile çekilmiş?</p>

<p style="margin-left: 120px;"><strong>KEREM (DIS SES)</strong><br/>Elif? Elif, neredesin?</p>

<p style="font-style: italic; color: #555;">Elif hızla fotoğrafı cebine koyar ve içeri döner.</p>

<h2>SAHNE 2 - İÇ. YALI - SALON - GECE</h2>

<p style="font-style: italic; color: #555;">Eski mobilyalar ve kristal avizelerle dolu büyük bir salon. Duvarlar solmuş yağlı boya tablolarla kaplı.</p>

<p style="margin-left: 120px;"><strong>ELİF</strong><br/>Buradayım. Ne oldu?</p>

<p style="margin-left: 120px;"><strong>KEREM</strong><br/>(heyecanla)<br/>Bodrum katta bir şey bulduk. Gelmen lazım.</p>`,
        color: "bg-pink-600",
        category: "creative"
    },
    {
        id: "short-story",
        title: "Kısa Hikaye",
        description: "Hikayenizi anlatın",
        icon: PenTool,
        content: `<h1 style="text-align: center; font-style: italic;">Son Tren</h1>
<p style="text-align: center; color: #94a3b8;">Bir kısa hikaye</p>

<br/>

<p>İstasyonun saati gece yarısını gösteriyordu ve peron bomboştu. Sadece tek bir adam vardı — gri paltosu ve eski bavuluyla, bankın üzerinde oturan yaşlı bir adam.</p>

<p>Son tren gecikmişti, yine. Bu kasabada her şey gecikiyordu — mevsimler, haberler, hatta bazen insanların duyguları bile.</p>

<p>Adam cebinden bir cep saati çıkardı. Saatin kapağının iç kısmında solmuş bir fotoğraf vardı: genç bir kadın, güneşli bir bahçede gülümsüyordu. Fotoğraf en az kırk yıllıktı.</p>

<p>"Hâlâ bekliyorsun?" dedi karanlıktan çıkan bir ses.</p>

<p>Adam başını kaldırdı. Karşısında, uzun boylu, siyah şapkalı bir kadın duruyordu. Gözleri gece kadar karanlık, gülümsemesi ise ay ışığı kadar parlaktı.</p>

<p>"Her zaman beklerim," dedi adam sakin bir sesle. "Bu işin doğası bu."</p>

<p>Uzakta tren düdüğü çaldı. Raylar titremeye başladı.</p>

<p style="text-align: center; color: #999;">— SON —</p>`,
        color: "bg-amber-600",
        category: "creative"
    },

    // ─── Eğitim ──────────────────────────────────────
    {
        id: "academic-paper",
        title: "Makale / Tez",
        description: "Akademik yazı formatı",
        icon: GraduationCap,
        content: `<h1 style="text-align: center;">Yapay Zekânın Eğitim Sistemleri Üzerindeki<br/>Dönüştürücü Etkisi: Bir İnceleme</h1>
<p style="text-align: center; color: #666;">Prof. Dr. [Adınız Soyadınız]<br/>[Üniversite Adı], [Fakülte]<br/>email@university.edu.tr</p>

<hr/>

<h2>Özet</h2>
<p>Bu çalışma, yapay zekâ teknolojilerinin modern eğitim sistemleri üzerindeki etkisini kapsamlı bir şekilde incelemektedir. Araştırma, 2020-2025 yılları arasında yayımlanan 150'den fazla akademik makaleyi sistematik olarak analiz etmektedir. Bulgular, yapay zekâ destekli öğrenme araçlarının öğrenci başarısını ortalama %23 artırdığını, ancak eşitlik ve erişilebilirlik konularında önemli zorlukların devam ettiğini ortaya koymaktadır.</p>

<p><strong>Anahtar Kelimeler:</strong> Yapay zekâ, eğitim teknolojisi, adaptif öğrenme, dijital dönüşüm, öğrenci başarısı</p>

<h2>1. Giriş</h2>
<p>Eğitim alanı, tarih boyunca teknolojik gelişmelerden doğrudan etkilenmiştir. Matbaanın icadından internet devrimine kadar her yeni teknoloji, bilginin üretimini, dağıtımını ve tüketimini köklü bir şekilde dönüştürmüştür. 2020'li yıllarda yapay zekâ teknolojilerinin hızlı gelişimi, eğitim alanında yeni bir paradigma kaymasını beraberinde getirmektedir.</p>

<h2>2. Yöntem</h2>
<p>Bu araştırmada sistematik literatür taraması yöntemi kullanılmıştır. Web of Science, Scopus ve Google Scholar veritabanlarında "artificial intelligence AND education" anahtar kelimeleri ile tarama yapılmıştır.</p>

<h2>3. Bulgular</h2>
<p>[Bulgularınızı buraya yazın...]</p>

<h2>4. Tartışma</h2>
<p>[Tartışmanızı buraya yazın...]</p>

<h2>5. Sonuç</h2>
<p>[Sonuçlarınızı buraya yazın...]</p>

<h2>Kaynakça</h2>
<p style="margin-left: 40px; text-indent: -40px;">Yılmaz, A. (2024). Yapay Zekâ ve Eğitim. <em>Eğitim Bilimleri Dergisi</em>, 45(2), 123-145.</p>
<p style="margin-left: 40px; text-indent: -40px;">Demir, B. & Kaya, C. (2023). Adaptif Öğrenme Sistemleri. <em>Teknoloji ve Toplum</em>, 12(1), 56-78.</p>`,
        color: "bg-sky-700",
        category: "education"
    },
    {
        id: "lecture-notes",
        title: "Ders Notları",
        description: "Düzenli ders notu şablonu",
        icon: StickyNote,
        content: `<h1 style="color: #7c3aed;">📚 Veri Yapıları ve Algoritmalar</h1>
<p style="color: #64748b;"><strong>Ders:</strong> BLM 201 | <strong>Hafta:</strong> 5 | <strong>Tarih:</strong> 19 Şubat 2026</p>
<p style="color: #64748b;"><strong>Öğretim Üyesi:</strong> Prof. Dr. Mehmet Aksoy</p>
<hr/>

<h2 style="color: #7c3aed;">📌 Bu Haftanın Konusu: Ağaç Veri Yapıları</h2>

<h3>Temel Kavramlar</h3>
<ul>
<li><strong>Ağaç (Tree):</strong> Hiyerarşik bir veri yapısıdır</li>
<li><strong>Kök (Root):</strong> Ağacın en üst düğümü</li>
<li><strong>Yaprak (Leaf):</strong> Çocuğu olmayan düğümler</li>
<li><strong>Derinlik (Depth):</strong> Kökten bir düğüme olan uzaklık</li>
</ul>

<h3>İkili Arama Ağacı (BST)</h3>
<p>Her düğümün en fazla iki çocuğu olan ağaç yapısı:</p>
<ul>
<li>Sol alt ağaçtaki tüm değerler < kök değeri</li>
<li>Sağ alt ağaçtaki tüm değerler > kök değeri</li>
<li>Arama karmaşıklığı: O(log n) — ortalama durum</li>
</ul>

<h3>⚠️ Önemli Noktalar</h3>
<ul>
<li>Dengesiz ağaçlarda karmaşıklık O(n)'e düşebilir</li>
<li>AVL ve Red-Black ağaçlar dengeli kalır</li>
<li>Sınav sorusu: Ağaç geçiş yöntemlerini (inorder, preorder, postorder) bilmek zorunlu</li>
</ul>

<h3>📝 Ödev</h3>
<ul>
<li>[ ] Kitap Bölüm 5'i okuyun</li>
<li>[ ] LeetCode #94, #144, #145 sorularını çözün</li>
<li>[ ] BST implementasyonu yapın (Java veya Python)</li>
</ul>

<h3>🔗 Kaynaklar</h3>
<ul>
<li>Introduction to Algorithms — Cormen et al.</li>
<li>Visualgo.net — Ağaç animasyonları</li>
</ul>`,
        color: "bg-purple-600",
        category: "education"
    },

    // ─── İş Dünyası (Ek) ────────────────────────────
    {
        id: "dilekce",
        title: "Dilekçe",
        description: "Resmi dilekçe şablonu",
        icon: ScrollText,
        content: `<h1 style="text-align: center; color: #1e3a5f;">DİLEKÇE</h1>

<p style="text-align: right;">19 Şubat 2026</p>

<p><strong>T.C.</strong><br/>[İlgili Kurum Adı]<br/>[Birim/Müdürlük Adı]<br/>[Şehir]</p>

<p><strong>Konu:</strong> [Dilekçe konusunu kısaca yazınız]</p>

<p>Sayın Yetkili,</p>

<p>[Dilekçe metninizi buraya yazınız. Talebinizi açık ve net bir şekilde ifade ediniz. Gerekçelerinizi ve varsa dayandığınız yasal düzenlemeleri belirtiniz.]</p>

<p>[İkinci paragrafta ek bilgiler, destekleyici belgeler veya detaylar verilebilir.]</p>

<p>Gereğini arz ederim.</p>

<br/>

<p style="text-align: right;"><strong>[Ad Soyad]</strong><br/>T.C. Kimlik No: [xxxxxxxxxxx]<br/>Adres: [Adresiniz]<br/>Tel: [Telefon numaranız]<br/>İmza: _______________</p>

<p style="color: #888; font-size: 11px;"><strong>Ekler:</strong><br/>1. [Varsa ek belge listesi]<br/>2. [Nüfus cüzdanı fotokopisi]</p>`,
        color: "bg-slate-700",
        category: "business"
    },
    {
        id: "sozlesme",
        title: "Sözleşme",
        description: "İş sözleşmesi taslağı",
        icon: ClipboardList,
        content: `<h1 style="text-align: center; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">HİZMET SÖZLEŞMESİ</h1>

<p style="text-align: center; color: #64748b;">Sözleşme No: 2026/HSZ-001</p>

<h2>MADDE 1 — TARAFLAR</h2>
<p><strong>HİZMET ALAN (İŞVEREN):</strong><br/>Unvan: [Şirket Adı] A.Ş.<br/>Adres: [Şirket Adresi]<br/>VKN: [Vergi Kimlik Numarası]<br/>(Bundan sonra "İşveren" olarak anılacaktır.)</p>

<p><strong>HİZMET VEREN (YÜKLENCI):</strong><br/>Unvan/Ad Soyad: [Yüklenici Adı]<br/>Adres: [Yüklenici Adresi]<br/>VKN/TCKN: [Numara]<br/>(Bundan sonra "Yüklenici" olarak anılacaktır.)</p>

<h2>MADDE 2 — SÖZLEŞMENİN KONUSU</h2>
<p>Bu sözleşme, Yüklenici'nin İşveren'e [hizmet açıklaması] hizmeti vermesine ilişkin koşulları düzenler.</p>

<h2>MADDE 3 — SÜRE</h2>
<p>Sözleşme süresi, imza tarihinden itibaren <strong>12 (on iki)</strong> aydır. Taraflardan biri, süre bitiminden 30 gün önce yazılı bildirimde bulunmadığı takdirde sözleşme aynı koşullarla 1 yıl daha uzar.</p>

<h2>MADDE 4 — ÜCRET VE ÖDEME</h2>
<p>Aylık hizmet bedeli: <strong>₺[Tutar] + KDV</strong><br/>Ödeme: Her ayın son iş günü<br/>Ödeme şekli: Banka havalesi</p>

<h2>MADDE 5 — GİZLİLİK</h2>
<p>Taraflar, bu sözleşme kapsamında edindikleri tüm bilgi ve belgeleri gizli tutmayı taahhüt eder.</p>

<h2>MADDE 6 — FESİH</h2>
<p>Taraflardan her biri, 30 gün önceden yazılı bildirimde bulunarak sözleşmeyi feshedebilir.</p>

<h2>MADDE 7 — UYUŞMAZLIK</h2>
<p>Bu sözleşmeden doğan uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>

<br/>
<p><strong>İŞVEREN</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>YÜKLENİCİ</strong></p>
<p>_____________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________</p>
<p>Tarih: __/__/2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Tarih: __/__/2026</p>`,
        color: "bg-cyan-700",
        category: "business"
    },
    {
        id: "is-raporu",
        title: "İş Raporu",
        description: "Haftalık/aylık iş raporu",
        icon: BarChart,
        content: `<h1 style="color: #1e40af;">📊 Haftalık Faaliyet Raporu</h1>
<p style="color: #64748b;"><strong>Hazırlayan:</strong> [Ad Soyad] | <strong>Departman:</strong> Yazılım Geliştirme | <strong>Tarih:</strong> 19 Şubat 2026</p>
<hr/>

<h2 style="color: #1e40af;">1. Özet</h2>
<p>Bu hafta sprint hedeflerinin %90'ı tamamlandı. Kritik A modülü başarıyla production'a alındı. 2 blocker bug çözüldü, performans iyileştirmeleri yapıldı.</p>

<h2 style="color: #1e40af;">2. Tamamlanan İşler</h2>
<ul>
<li>✅ Kullanıcı kimlik doğrulama modülü — OAuth 2.0 entegrasyonu</li>
<li>✅ Veritabanı migrasyon scripti — v3.2.0'a güncelleme</li>
<li>✅ API rate limiting implementasyonu</li>
<li>✅ Dashboard performans optimizasyonu (sayfa yükleme %40 hızlandı)</li>
<li>✅ 47 unit test yazıldı, test coverage %78'den %85'e çıkarıldı</li>
</ul>

<h2 style="color: #1e40af;">3. Devam Eden İşler</h2>
<ul>
<li>🔄 Bildirim sistemi geliştirmesi — %70 tamamlandı</li>
<li>🔄 Mobil responsive düzenlemeler — %50 tamamlandı</li>
</ul>

<h2 style="color: #1e40af;">4. Sorunlar ve Riskler</h2>
<ul>
<li>⚠️ 3. parti ödeme API'sinde yavaşlık — destek talebi açıldı</li>
<li>⚠️ QA ekibinde 1 kişi izinli, test kapasitesi azaldı</li>
</ul>

<h2 style="color: #1e40af;">5. Gelecek Hafta Planı</h2>
<ul>
<li>[ ] Bildirim sistemi tamamlanacak</li>
<li>[ ] Yük testi (load testing) yapılacak</li>
<li>[ ] v3.2.0 release notes hazırlanacak</li>
</ul>

<h2 style="color: #1e40af;">6. Metrikler</h2>
<p><strong>Sprint Velocity:</strong> 42 puan (hedef: 45)</p>
<p><strong>Bug Sayısı:</strong> 3 açık, 12 çözülmüş</p>
<p><strong>Uptime:</strong> %99.97</p>`,
        color: "bg-blue-800",
        category: "business"
    },

    // ─── Kişisel ─────────────────────────────────────
    {
        id: "blog-yazisi",
        title: "Blog Yazısı",
        description: "Kişisel blog yazısı şablonu",
        icon: Newspaper,
        content: `<h1 style="font-size: 28px; color: #0f172a;">Yapay Zekâ Çağında İnsan Olmak: Düşünceler ve Gözlemler</h1>
<p style="color: #94a3b8; font-size: 13px;">📅 19 Şubat 2026 | ✍️ [Yazar Adı] | 🏷️ Teknoloji, Felsefe | ⏱️ 5 dk okuma</p>
<hr/>

<p style="font-size: 16px; color: #334155; font-style: italic; border-left: 4px solid #6366f1; padding-left: 16px;">"Teknoloji, insanın uzantısıdır — ama insanın yerine geçmez." — Marshall McLuhan</p>

<h2>Giriş</h2>
<p>Son birkaç yılda hayatımıza giren yapay zekâ araçları, iş yapma biçimimizi kökten değiştirdi. Peki bu değişim bizi nereye götürüyor? Ve en önemlisi, bu dönüşümde "insan" olmak ne anlama geliyor?</p>

<h2>Gözlemlerim</h2>
<p>Geçtiğimiz hafta bir konferansta ilginç bir deneyim yaşadım. Konuşmacı, yapay zekânın yazdığı bir şiiri okudu ve salondaki kimse bunun makine tarafından yazıldığını fark etmedi. Bu an, bende derin bir düşünce sürecini başlattı.</p>

<p>Ancak şunu da gözlemliyorum: yapay zekânın en başarısız olduğu alan, tam da insanı insan yapan şeyler — empati, sezgi ve yaratıcı kıvılcım.</p>

<h2>Sonuç Yerine</h2>
<p>Belki de asıl soru "yapay zekâ bizi geçecek mi?" değil, "biz kendimizi nasıl tanımlayacağız?" olmalı. Teknoloji bir araçtır; onu nasıl kullandığımız ise tamamen bize bağlı.</p>

<p><strong>Siz ne düşünüyorsunuz?</strong> Yorumlarınızı bekliyorum. 💬</p>

<hr/>
<p style="color: #94a3b8; font-size: 11px;">Bu yazı kişisel görüşlerimi yansıtmaktadır. Paylaşırken kaynak belirtmenizi rica ederim.</p>`,
        color: "bg-indigo-500",
        category: "personal"
    },
    {
        id: "yapilacaklar",
        title: "Yapılacaklar Listesi",
        description: "Günlük/haftalık görev listesi",
        icon: ListChecks,
        content: `<h1 style="color: #059669;">✅ Haftalık Yapılacaklar Listesi</h1>
<p style="color: #64748b;">Hafta: 19–25 Şubat 2026 | Öncelik: 🔴 Yüksek 🟡 Orta 🟢 Düşük</p>
<hr/>

<h2 style="color: #dc2626;">🔴 Acil ve Önemli</h2>
<ul>
<li>[ ] Proje sunumunu hazırla (Son tarih: 20 Şubat)</li>
<li>[ ] Müşteri toplantısı notlarını gönder</li>
<li>[ ] Bütçe raporunu tamamla ve müdüre sun</li>
</ul>

<h2 style="color: #ca8a04;">🟡 Önemli ama Acil Değil</h2>
<ul>
<li>[ ] Yeni proje planı taslağını oluştur</li>
<li>[ ] Ekip performans değerlendirmelerini yap</li>
<li>[ ] Online eğitim modülünü tamamla</li>
<li>[ ] Ofis malzemeleri siparişi ver</li>
</ul>

<h2 style="color: #16a34a;">🟢 Yapılabilir</h2>
<ul>
<li>[ ] E-posta kutusunu düzenle</li>
<li>[ ] Masa düzenlemesi yap</li>
<li>[ ] Networking etkinliğine kayıt ol</li>
</ul>

<h2>📌 Notlar</h2>
<ul>
<li>Çarşamba günü saat 14:00 — departman toplantısı</li>
<li>Cuma gününe kadar izin formunu HR'a ilet</li>
</ul>

<h2>🏆 Bu Hafta Tamamlananlar</h2>
<ul>
<li>[x] Q4 raporu gönderildi</li>
<li>[x] Yeni yazılım kurulumu yapıldı</li>
</ul>`,
        color: "bg-emerald-500",
        category: "personal"
    },
    {
        id: "sunum-notlari",
        title: "Sunum Notları",
        description: "Profesyonel sunum taslağı",
        icon: Presentation,
        content: `<h1 style="color: #7c3aed; text-align: center;">🎯 Dijital Dönüşüm Stratejisi 2026</h1>
<p style="text-align: center; color: #64748b;">Yönetim Kurulu Sunumu | 19 Şubat 2026</p>
<hr/>

<h2 style="color: #7c3aed;">Slayt 1 — Gündem</h2>
<ol>
<li>Mevcut durum analizi</li>
<li>Dijital dönüşüm yol haritası</li>
<li>Bütçe ve kaynak planlaması</li>
<li>Beklenen sonuçlar ve KPI'lar</li>
<li>Soru-Cevap</li>
</ol>

<h2 style="color: #7c3aed;">Slayt 2 — Mevcut Durum</h2>
<p><strong>Güçlü Yönler:</strong></p>
<ul>
<li>Güçlü müşteri tabanı (50.000+ aktif kullanıcı)</li>
<li>Deneyimli teknik ekip</li>
</ul>
<p><strong>Zayıf Yönler:</strong></p>
<ul>
<li>Eski altyapı (legacy sistemler)</li>
<li>Manuel süreçlerin fazlalığı</li>
</ul>

<h2 style="color: #7c3aed;">Slayt 3 — Yol Haritası</h2>
<p><strong>Q1 2026:</strong> Altyapı modernizasyonu → Bulut migrasyonu</p>
<p><strong>Q2 2026:</strong> Otomasyon → İş süreçleri digitalize</p>
<p><strong>Q3 2026:</strong> AI entegrasyonu → Müşteri deneyimi iyileştirme</p>
<p><strong>Q4 2026:</strong> Ölçeklendirme → Yeni pazarlara açılma</p>

<h2 style="color: #7c3aed;">Slayt 4 — Bütçe</h2>
<p>Toplam yatırım: <strong>₺2.500.000</strong></p>
<p>Beklenen ROI: <strong>%180 (18 ay içinde)</strong></p>

<h2 style="color: #7c3aed;">Slayt 5 — Sorular?</h2>
<p style="text-align: center; font-size: 18px;">Teşekkürler! 🙏<br/>İletişim: [email@sirket.com]</p>`,
        color: "bg-violet-500",
        category: "business"
    },
    {
        id: "proje-plani",
        title: "Proje Planı",
        description: "Detaylı proje yönetim planı",
        icon: FolderKanban,
        content: `<h1 style="color: #0369a1;">📋 Proje Planı: Mobil Uygulama Geliştirme</h1>
<p style="color: #64748b;"><strong>Proje Yöneticisi:</strong> [Ad Soyad] | <strong>Başlangıç:</strong> 1 Mart 2026 | <strong>Bitiş:</strong> 30 Haziran 2026</p>
<hr/>

<h2 style="color: #0369a1;">1. Proje Özeti</h2>
<p>Şirketimizin müşterilerine yönelik iOS ve Android platformlarında çalışan bir mobil uygulama geliştirilmesi. Uygulama, mevcut web platformundaki tüm temel özellikleri mobil ortamda sunacaktır.</p>

<h2 style="color: #0369a1;">2. Hedefler</h2>
<ul>
<li>🎯 İlk 3 ayda 10.000 indirme</li>
<li>🎯 App Store puanı 4.5+</li>
<li>🎯 Müşteri memnuniyeti %85+</li>
<li>🎯 Bütçe dahilinde teslim</li>
</ul>

<h2 style="color: #0369a1;">3. Fazlar</h2>

<h3>Faz 1 — Keşf ve Planlama (Hafta 1-2)</h3>
<ul>
<li>[ ] Gereksinim analizi</li>
<li>[ ] Kullanıcı araştırması (anket + mülakat)</li>
<li>[ ] Teknik fizibilite raporu</li>
<li>[ ] Proje kapsamının onaylanası</li>
</ul>

<h3>Faz 2 — Tasarım (Hafta 3-5)</h3>
<ul>
<li>[ ] Wireframe tasarımları</li>
<li>[ ] UI/UX tasarım (Figma)</li>
<li>[ ] Prototip ve kullanıcı testi</li>
<li>[ ] Tasarım onayı</li>
</ul>

<h3>Faz 3 — Geliştirme (Hafta 6-12)</h3>
<ul>
<li>[ ] Backend API geliştirme</li>
<li>[ ] Frontend (React Native) geliştirme</li>
<li>[ ] 3. parti entegrasyonlar</li>
<li>[ ] Unit ve integration testler</li>
</ul>

<h3>Faz 4 — Test ve Lansman (Hafta 13-16)</h3>
<ul>
<li>[ ] QA testi</li>
<li>[ ] Beta testi (100 kullanıcı)</li>
<li>[ ] App Store/Play Store yayınlama</li>
<li>[ ] Lansman kampanyası</li>
</ul>

<h2 style="color: #0369a1;">4. Ekip</h2>
<p>1 Proje Yöneticisi, 2 Backend Dev, 2 Frontend Dev, 1 UI/UX Tasarımcı, 1 QA Mühendisi</p>

<h2 style="color: #0369a1;">5. Bütçe</h2>
<p><strong>Toplam:</strong> ₺750.000 (personel: ₺550K, altyapı: ₺120K, pazarlama: ₺80K)</p>`,
        color: "bg-sky-600",
        category: "business"
    },
    {
        id: "referans-mektubu",
        title: "Referans Mektubu",
        description: "Profesyonel referans yazısı",
        icon: Award,
        content: `<h1 style="text-align: center; color: #1e3a5f;">REFERANS MEKTUBU</h1>
<hr/>

<p style="text-align: right;">19 Şubat 2026</p>

<p><strong>Kime:</strong> İlgili Makama</p>

<p>Sayın Yetkili,</p>

<p>Bu mektup, <strong>[Çalışan Adı Soyadı]</strong>'nın profesyonel yetkinliklerini ve kişisel özelliklerini değerlendirmek amacıyla hazırlanmıştır.</p>

<p>[Çalışan Adı], şirketimizde <strong>[Pozisyon]</strong> olarak <strong>[Başlangıç Tarihi] - [Bitiş Tarihi]</strong> tarihleri arasında görev yapmıştır. Bu süre zarfında kendisi ile yakın çalışma fırsatı buldum ve performansını yakından gözlemledim.</p>

<h2>Profesyonel Yetkinlikler</h2>
<ul>
<li><strong>Teknik Beceriler:</strong> [Çalışan], alanında güçlü bir teknik altyapıya sahiptir. [Spesifik beceriler ve projeler]</li>
<li><strong>Problem Çözme:</strong> Karmaşık sorunlara yaratıcı ve etkili çözümler üretme kapasitesine sahiptir</li>
<li><strong>İletişim:</strong> Hem ekip içi hem de müşterilerle mükemmel iletişim kurar</li>
<li><strong>Liderlik:</strong> [Yönettiği projeler veya ekipler hakkında bilgi]</li>
</ul>

<h2>Kişisel Özellikler</h2>
<p>[Çalışan], güvenilir, disiplinli ve takım çalışmasına yatkın bir profesyoneldir. Zorlu koşullar altında bile pozitif yaklaşımını korur ve çevresindeki insanları motive eder.</p>

<p><strong>[Çalışan Adı]</strong>'nı herhangi bir pozisyon için güvenle tavsiye ederim. Kendisinin yeni görevinde de başarılı olacağından eminim.</p>

<p>Ek bilgi için benimle iletişime geçmekten çekinmeyiniz.</p>

<p>Saygılarımla,</p>
<br/>
<p><strong>[Referans Veren Ad Soyad]</strong><br/>[Ünvan]<br/>[Şirket Adı]<br/>Tel: [Telefon] | E-posta: [Email]</p>`,
        color: "bg-teal-700",
        category: "professional"
    },
    {
        id: "siir",
        title: "Şiir",
        description: "Şiir yazma şablonu",
        icon: Feather,
        content: `<h1 style="text-align: center; color: #7c2d12; font-style: italic;">Kayıp Zamanlar</h1>
<p style="text-align: center; color: #a16207;">— Bir şiir —</p>
<br/>

<p style="text-align: center; line-height: 2;">
Eskilerin rüzgârı eser sokaklardan,<br/>
Taş döşeli yollarda yankılanır adımlar.<br/>
Bir zamanlar burada çınlardı kahkahalar,<br/>
Şimdi sessizlik... ve solgun hatıralar.
</p>

<br/>

<p style="text-align: center; line-height: 2;">
Bulutlar geçer gökyüzünden ağır ağır,<br/>
Her biri bir hikâye taşır omuzlarında.<br/>
Ben pencerede dururum, camlar buğulu,<br/>
Parmağımla yazarım adını buzlarında.
</p>

<br/>

<p style="text-align: center; line-height: 2;">
Zaman bir nehir — akar, durulmaz,<br/>
Anılar bir kayık — batar, bulunmaz.<br/>
Ama sen kal kalbimde, son satıra dek,<br/>
Bu şiir bitmesin, bu söz tükenmesin tek.
</p>

<br/>
<p style="text-align: center; color: #92400e; font-style: italic;">— [Şair Adı], 2026 —</p>`,
        color: "bg-orange-700",
        category: "creative"
    },
    {
        id: "mulakat-hazirligi",
        title: "Mülakat Hazırlık",
        description: "İş mülakatı hazırlık notları",
        icon: UserCheck,
        content: `<h1 style="color: #4338ca;">🎯 Mülakat Hazırlık Notları</h1>
<p style="color: #64748b;"><strong>Pozisyon:</strong> [Pozisyon Adı] | <strong>Şirket:</strong> [Şirket Adı] | <strong>Tarih:</strong> [Mülakat Tarihi]</p>
<hr/>

<h2 style="color: #4338ca;">🏢 Şirket Araştırması</h2>
<ul>
<li><strong>Sektör:</strong> [Şirketin faaliyet alanı]</li>
<li><strong>Çalışan Sayısı:</strong> [Yaklaşık sayı]</li>
<li><strong>Misyon:</strong> [Şirketin misyon ifadesi]</li>
<li><strong>Son Haberler:</strong> [Güncel gelişmeler]</li>
<li><strong>Rakipler:</strong> [Ana rakipler]</li>
</ul>

<h2 style="color: #4338ca;">💬 Olası Sorular ve Yanıtlar</h2>

<h3>"Kendinizden bahseder misiniz?"</h3>
<p style="background: #f0f9ff; padding: 12px; border-radius: 6px;">[2 dakikalık elevator pitch: Eğitim, deneyim, güçlü yönler ve bu pozisyona neden uygun olduğunuz]</p>

<h3>"Neden bu şirkette çalışmak istiyorsunuz?"</h3>
<p style="background: #f0f9ff; padding: 12px; border-radius: 6px;">[Şirketin değerleri, projeler ve kariyer hedeflerinizle uyumu]</p>

<h3>"En büyük zayıf yönünüz nedir?"</h3>
<p style="background: #f0f9ff; padding: 12px; border-radius: 6px;">[Gerçekçi bir zayıflık + onu nasıl geliştirdiğiniz]</p>

<h3>"5 yıl sonra kendinizi nerede görüyorsunuz?"</h3>
<p style="background: #f0f9ff; padding: 12px; border-radius: 6px;">[Kariyer gelişim planınız, bu şirketteki büyüme fırsatları]</p>

<h2 style="color: #4338ca;">❓ Sizin Sorularınız</h2>
<ul>
<li>Ekibin yapısı ve çalışma kültürü nasıl?</li>
<li>Bu pozisyondaki ilk 90 günde benden beklentiler neler?</li>
<li>Şirketin önümüzdeki dönem büyüme planları nelerdir?</li>
<li>Mentorluk veya profesyonel gelişim programları var mı?</li>
</ul>

<h2 style="color: #4338ca;">✅ Check List</h2>
<ul>
<li>[ ] CV'nin güncel kopyasını yazdır (2 adet)</li>
<li>[ ] Portfolyo/referansları hazırla</li>
<li>[ ] Uygun kıyafet seç</li>
<li>[ ] Adres ve ulaşımı kontrol et</li>
<li>[ ] 10 dakika erken git</li>
</ul>`,
        color: "bg-fuchsia-600",
        category: "personal"
    },

    // ─── Araçlar ─────────────────────────────────────
    {
        id: "pdf",
        title: "PDF Düzenle",
        description: "PDF üzerine çizim yapın ve imzalayın",
        icon: FileText,
        content: "",
        color: "bg-red-500",
        category: "tools"
    },
];
