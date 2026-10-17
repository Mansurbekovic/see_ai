# SEE AI — Think Deeper. See Further.

SEE AI — ilg‘or AI assistent, tadqiqot platformasi, dasturlash yordamchisi va unumdorlik ish maydoni.

---

## 🚀 Texnologik Stack

- **Framework**: [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack, React 19.3)
- **Til**: Strict TypeScript 5
- **Uslublar**: Tailwind CSS 4 + Maxsus Dizayn Tizimi (qorong‘u/yorug‘/tizim mavzulari)
- **Ma'lumotlar bazasi**: Netlify Database (PostgreSQL) + [Drizzle ORM](https://orm.drizzle.team/)
- **Autentifikatsiya**: Auth.js v5 (`next-auth@beta`) + `bcryptjs`
- **AI Provayderlar**:
  - **Google Gemini**: Rasmiy `@google/genai` SDK (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`)
  - **Anthropic Claude**: Rasmiy `@anthropic-ai/sdk` (`claude-sonnet-4-20250514`, `claude-3-5-sonnet-latest`, `claude-3-5-haiku-latest`)
- **Veb-qidiruv**: Brave Search API + Google Search Grounding orqali real manbalarga tayangan tadqiqot
- **Fayllarni qayta ishlash**: Xavfsiz multimodal rasm (base64) va hujjatlar (.txt, .md, kod fayllari)
- **Til qo'llab-quvvatlashi**: O'zbekcha (asosiy), Inglizcha, Ruscha
- **Testlar**: Vitest 3 + TypeScript verification + ESLint

---

## 📁 Loyiha Tuzilmasi

```
see_ai/
├── db/
│   └── schema.ts                # Drizzle sxemasi (User, Conversation, Message, Attachment va boshqalar)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/            # Auth.js va ro'yxatdan o'tish endpointlari
│   │   │   ├── chat/            # Server-Sent Events (SSE) AI streaming marshruti
│   │   │   ├── conversations/   # Suhbatlarni saqlash, yuklash, qidirish, o'chirish
│   │   │   ├── files/           # Xavfsiz fayl va rasm yuklash endpointi
│   │   │   ├── models/          # Mavjud AI modellari ro'yxati
│   │   │   ├── search/          # Haqiqiy veb-tadqiqot qidiruv endpointi
│   │   │   └── settings/        # Foydalanuvchi sozlamalari
│   │   ├── chat/                # Yangi suhbat va /chat/[id] sahifalari
│   │   ├── login/               # Kirish va ro'yxatdan o'tish sahifasi
│   │   ├── settings/            # Mavzu, til va maxfiylik sozlamalari
│   │   ├── globals.css          # SEE AI dizayn tizimi va animatsiyalar
│   │   ├── layout.tsx           # I18nProvider va ThemeProvider bilan ildiz layout
│   │   └── page.tsx             # SEE AI asosiy landing sahifasi
│   ├── components/
│   │   ├── chat/                # Composer, MessageList, Message, CodeBlock, CitationCard, Welcome
│   │   ├── layout/              # Sidebar, Header, MobileNav
│   │   └── ui/                  # Button, Input, Spinner, Avatar
│   ├── hooks/                   # useChat, useConversations, useTheme
│   ├── lib/
│   │   ├── ai/                  # Yagona provayder interfeysi, Gemini & Claude adapterlari, kontekst menejeri
│   │   ├── auth/                # Data Access Layer (DAL) va sessiya tekshiruvi
│   │   ├── configuration/       # Zod asosidagi atrof-muhit o'zgaruvchilari validatsiyasi
│   │   ├── database/            # Prisma Client singleton
│   │   ├── files/               # Hujjatlarni xavfsiz o'qish va tahlil qilish
│   │   ├── i18n/                # uz.ts, en.ts, ru.ts tarjimalari va reaktiv kontekst
│   │   ├── search/              # Qidiruv orkestratori va iqtiboslar formati
│   │   └── security/            # Rate limiter, SSRF himoyasi, fayl sanitizatsiyasi, Zod sxemalari
│   └── tests/                   # Xavfsizlik, provayderlar va AI kontekst unit testlari
└── vitest.config.ts             # Vitest konfiguratsiyasi
```

---

## ⚙️ O'rnatish va Ishga Tushirish

### 1. Talablar
- Node.js `20.9.0` yoki undan yuqori
- PostgreSQL ma'lumotlar bazasi

### 2. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 3. Muhit o'zgaruvchilarini sozlash
`.env.example` faylidan nusxa oling:
```bash
cp .env.example .env.local
```

`.env.local` fayliga kerakli qiymatlarni kiriting:
```env
# Ma'lumotlar bazasi
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/see_ai?schema=public"

# Autentifikatsiya (openssl rand -base64 32 orqali hosil qiling)
AUTH_SECRET="your-generated-secret"
AUTH_URL="http://localhost:3000"

# AI Provayderlar
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Ixtiyoriy: Anthropic Claude
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="claude-sonnet-4-20250514"

# Ixtiyoriy: Veb qidiruv (Brave Search)
WEB_SEARCH_PROVIDER="brave"
WEB_SEARCH_API_KEY=""
```

### 4. Ma'lumotlar bazasi migratsiyalari
Sxema o'zgarganda migratsiya yarating (Netlify deploy vaqtida avtomatik qo'llaydi):
```bash
npx drizzle-kit generate --name <migratsiya_nomi>
```

### 5. Dasturni ishga tushirish
Ishlab chiqish rejimida:
```bash
npm run dev
```

Production rejimida:
```bash
npm run build
npm run start
```

---

## 🧪 Sinovlar va Sifat Nazorati

Barcha testlar va tekshiruvlar 100% muvaffaqiyat bilan o'tadi:

```bash
# 1. Unit va integratsion testlarni ishga tushirish (17 ta test)
npx vitest run

# 2. Strict TypeScript tekshiruvi (0 ta xato)
npx tsc --noEmit

# 3. Kod sifatini tekshirish (0 ta xato, 0 ta ogohlantirish)
npx eslint src/

# 4. Production build yaratish
npm run build
```

---

## 🛡️ Xavfsizlik Arxitekturasi

1. **SSRF himoyasi**: `isAllowedUrl` funksiyasi barcha ichki tarmoqlar (10.x, 172.16-31.x, 192.168.x), localhost, 0.0.0.0, bulutli metadata IP (169.254.169.254) va xavfli protokollarni bloklaydi.
2. **Fayllar xavfsizligi**: MIME-type va kengaytma tekshiruvi, xavfli simvollarni tozalash (`sanitizeFilename`), hajmni cheklash (10MB) va zararli kodlarni serverda ijro etmaslik.
3. **So'rovlar chastotasi nazorati (Rate Limiting)**: Har bir foydalanuvchi uchun chat, qidiruv, fayl yuklash va autentifikatsiya endpointlarida alohida slayd-oyna cheklovlari.
4. **Prompt Injection himoyasi**: Veb-qidiruv va tashqi hujjatlar matni tizim ko'rsatmasi sifatida emas, balki "UNTRUSTED CONTENT" chegarasi bilan ajratilgan holda taqdim etiladi.
5. **Autentifikatsiya va Izolyatsiya**: Barcha shaxsiy suhbatlar, xabarlar va biriktirmalar ma'lumotlar bazasi darajasida `userId` orqali qat'iy izolyatsiya qilingan. Birovning ID raqamini so'rovda ko'rsatish orqali boshqa foydalanuvchi ma'lumotlariga kirish imkonsiz.
