// 所有站点文案集中在这里，后续替换内容只需改这个文件。
// 来源：GDG on Campus DVC — 2026-27 Drive
//   Leadership Handbook、Positions & Roles、Club Day 筹备纪要（9/14）、干部会议纪要（9/21）、
//   General Meeting 1 纪要（9/23）、General Meeting 2 议程（9/30）、Club Day 报名表（仅用人数）、
//   Hackathon Master Plan、How to Run a Hackathon、Partnerships CRM（仅用已确认赞助商）、
//   Outreach Email Templates、Quote Bank（社团自有标语）、External Resource Links、
//   Club Day 三折页 / Club Day 贴纸海报 / What is GDG 海报 / First General Meeting 海报 / Hackathon Collab 海报

export const site = {
  club: 'GDG on Campus',
  campus: 'Diablo Valley College',
  short: 'GDG DVC',
  year: '2026 — 27',
  motto: ['Code.', 'Build.', 'Create.', 'Connect.'],
  meeting: 'Wednesdays 2–3 PM · LC 200 / 205',
  // 放一个 mp4 到 public/media/hero.mp4 即可启用视频背景；文件不存在时自动回退到动态画布背景
  heroVideo: '', // 想要首页背景视频：把 mp4 放到 public/media/，这里填 'media/xxx.mp4'；留空就只显示像素动画
}

// 首屏：中间的标志字 + 顶部三栏信息
export const hero = {
  word: 'GDG on Campus',
  lines: ['GDG', 'on Campus'], // 首屏竖排：每行一个 TechText
  meta: [
    { label: 'Chapter', value: 'Diablo Valley College' },
    { label: 'Meetings', value: 'Wednesdays · 2–3 PM' },
    { label: 'Location', value: 'LC 200 / 205' },
  ],
}

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'events', label: 'Events' },
  { id: 'why', label: 'Why Join' },
  { id: 'partner', label: 'Partner' },
  { id: 'team', label: 'Team' },
  { id: 'join', label: 'Join' },
]

// 首屏与主体之间的衔接宣言
export const statement = [
  'Built by students, for students.',
  'Come for the code, stay for the community.',
  'Ship something. Break something. Learn something.',
]

// ---------- About：什么是 GDG（三折页 "What is GDG?" + Leadership Handbook 使命） ----------
export const about = {
  intro:
    'Google Developer Groups (GDG) on Campus DVC is a student tech club for people interested in coding, AI, apps, projects and building community — part of Google’s global GDG on Campus network.',
  mission:
    'We connect Diablo Valley College students to Google’s global developer community. We run technical workshops, hackathons and projects that give students real, hands-on experience with modern software and AI — and we build a leadership pipeline where officers grow into organizers, engineers and communicators.',
  pillars: [
    { icon: 'monitor', color: 'blue', photo: 'android', title: 'Workshops', text: 'Hands-on learning with real tools — from beginner to advanced.' },
    { icon: 'zap', color: 'red', photo: 'bikeClose', title: 'Hackathons', text: 'Build, create and turn ideas into real projects.' },
    { icon: 'bulb', color: 'yellow', photo: 'logoWall', title: 'Projects', text: 'Work on real-world projects with a team, and showcase what you make.' },
    { icon: 'link', color: 'green', photo: 'patio', title: 'Collabs', text: 'Partner with other clubs, initiatives and the wider community.' },
    { icon: 'users', color: 'blue', photo: 'googleShirts', title: 'Community', text: 'Meet fellow students, industry guests and mentors.' },
    { icon: 'heart', color: 'red', photo: 'bikes', title: 'Beginner-friendly', text: 'Any major, any experience level — just bring your curiosity.' },
  ],
  facts: [
    { value: 'officers', label: 'Officers across Executive, Publications & Promotions and R&D', short: 'Officers' },
    { value: '24', label: 'Students signed up at Club Day', short: 'Club Day sign-ups' },
    { value: '5', label: 'Campus clubs teaming up for the multi-club hackathon', short: 'Clubs in the hackathon' },
    { value: '100+', label: 'Builders expected at Hackathon Day', short: 'Builders on Hackathon Day' },
  ],
}

// ---------- Events（Hackathon Master Plan、各活动海报、9/23 会议纪要） ----------
export const events = {
  featured: {
    tag: 'Flagship event',
    title: 'Multi-Club Hackathon',
    date: 'Saturday, February 27, 2027',
    text:
      'The biggest hackathon GDG on Campus DVC has hosted. All four CS-related clubs on campus join GDG to build, design, code and create together — 100+ students, one day of turning ideas into real projects.',
    points: [
      { k: 'Format', v: 'GDG leads logistics; each partner club runs its own lane — judging support, a workshop track, promotion or a themed challenge track.' },
      { k: 'The day', v: 'Check-in → opening → workshops → hacking time → judging → closing.' },
      { k: 'Judging', v: 'One rubric for every project: Technical Difficulty, Creativity, Execution and Presentation.' },
      { k: 'Prizes', v: 'Best Overall, Best Beginner Hack, Best Hardware Hack — plus a Best Use of [Sponsor] category per confirmed sponsor.' },
      { k: 'Registration', v: 'Opens the week of January 9, 2027 — follow @gdgoc_dvc for the announcement.' },
    ],
    sponsor: 'Confirmed sponsor: Unvibe',
    partners: ['GDG on Campus DVC', 'Control-Z', 'Movement in Computer Science', 'Code to Change', '3D Printing Club'],
  },
  list: [
    {
      icon: 'calendar',
      color: 'blue',
      when: 'Every Wednesday · 2–3 PM',
      title: 'Weekly Meetings',
      // 结构化字段（新版日程 Schedule.jsx 用；旧版只读 when）
      recur: 'WE', start: '14:00', end: '15:00', room: 'LC 200 / 205',
      text: 'LC 200 / 205 (LC 205 is on the 2nd floor). Google AI and software tools, small projects, guest speakers and hackathon prep — come meet the team and learn what GDG is all about.',
    },
    {
      icon: 'gift',
      color: 'yellow',
      when: 'Wed, Sept 16 · 9 AM – 2 PM',
      title: 'Club Day',
      date: '2026-09-16', start: '09:00', end: '14:00',
      text: 'Food, Google stickers and a raffle with 3 winners. 24 students signed up at our table in three steps: follow Instagram, join DVC Sync, sign in.',
    },
    {
      icon: 'pin',
      color: 'red',
      when: 'Wed, Sept 23 · LC 200',
      title: 'General Meeting 1',
      date: '2026-09-23', room: 'LC 200',
      text: 'Officer intros, the hackathon preview, scholarship opportunities and plans for possible visits to Google — plus a Google-themed Blooket game, pizza and sticker prizes.',
    },
    {
      icon: 'cpu',
      color: 'green',
      when: 'Wed, Sept 30 · LC 200',
      title: 'GDG × SNES: Build a Computer',
      date: '2026-09-30', room: 'LC 200',
      text: 'A hands-on collab with SNES: learn what the CPU, motherboard, RAM, GPU, storage, power supply, cooling and case each do — then build a PC together.',
    },
  ],
}

// 路线图：三个阶段（Hackathon Master Plan + 会议纪要），done 按 2026-10-01 计算
export const roadmap = [
  { phase: 'Fall · Launch', items: [{ t: 'Club Day', done: true }, { t: 'General Meeting 1', done: true }, { t: 'General Meeting 2', done: true }] },
  { phase: 'Fall · Build', items: [{ t: 'Hackathon kickoff' }, { t: 'Sponsor outreach' }, { t: 'Lock speakers & judges' }] },
  { phase: 'Winter · Ship', items: [{ t: 'Registration opens', date: '2027-01-09' }, { t: 'Logistics lock' }, { t: 'Hackathon Day · Feb 27', date: '2027-02-27' }] },
]

// ---------- Why Join ----------
export const benefits = [
  { icon: 'book', color: 'blue', title: 'Learn Google technologies', text: 'Hands-on sessions on tools like Gemini, Firebase, Android and Google Cloud — from your first line of code to advanced topics.' },
  { icon: 'bulb', color: 'yellow', title: 'Build real projects', text: 'Collaborate with other students and leave with work you can actually show.' },
  { icon: 'zap', color: 'red', title: 'Compete at hackathons', text: 'Join the multi-club hackathon and team up with builders from across campus.' },
  { icon: 'award', color: 'green', title: 'Scholarships & Google visits', text: 'We share scholarship opportunities with members and are exploring visits to Google.' },
  { icon: 'briefcase', color: 'blue', title: 'Lead something real', text: 'Officers own budgets, calendars, roadmaps and campaigns across three divisions — applications are open.' },
  { icon: 'users', color: 'green', title: 'Find your people', text: 'Fellow students, industry guests and mentors — plus pizza, stickers and prizes along the way.' },
]

// ---------- Partner with us（Outreach Email Templates；SNES / Code to Change 来自会议纪要） ----------
export const partner = {
  intro: 'GDG on Campus DVC is part of Google’s global Developer Groups network. We’re always looking for people and organizations to build with.',
  ways: [
    { icon: 'award', color: 'blue', title: 'Sponsors', text: 'Support an event with funding, swag, API credits or a speaker — and get featured in our promotion, on-site signage and opening remarks.' },
    { icon: 'mic', color: 'red', title: 'Speakers', text: 'Give a talk or run a workshop at a meeting or event, in person or virtual. Our members want to hear from people building in tech.' },
    { icon: 'link', color: 'green', title: 'Clubs & organizations', text: 'Co-host an event, a workshop series or mentorship. We’ve built a PC with SNES and are teaming up with four clubs for the hackathon.' },
  ],
}

// ---------- Team（Leadership Handbook、Positions & Roles、9/23 会议点名） ----------
// 头像：把照片放到 public/media/team/ 下，然后在对应成员上填 photo: 'media/team/xxx.jpg'
export const team = [
  {
    id: 'exec',
    name: 'Executive Leadership',
    short: 'Exec',
    color: 'blue',
    blurb: 'Strategy, operations, finance and the relationship with Google and DVC.',
    members: [
      { name: 'Preston Susanto', photo: 'media/team/preston.jpg', role: 'President / GDG Lead', duty: 'Sets overall direction and owns the relationship with Google and DVC.', lead: true },
      { name: 'Aaron Timothy', photo: 'media/team/aaron-timothy.jpg', role: 'Vice President', duty: 'Backs up the President and steps in on cross-team issues.' },
      { name: 'Austin Cao', photo: 'media/team/austin.jpg', role: 'Lead Software Architect', duty: 'Builds the club’s software projects and web presence — including this site.' },
      { name: 'Ella Moon', photo: 'media/team/ella.jpg', role: 'Chief Finance Officer', duty: 'Owns the budget, reimbursements and DVCSync paperwork.' },
      { name: 'Micah Iswaranata', photo: 'media/team/micah.jpg', role: 'Secretary', duty: 'Meeting notes, attendance and leadership records.' },
      { name: 'Frisko Natan Gautama', wheel: 'Frisko Gautama', photo: 'media/team/frisko.jpg', role: 'ICC Representative', duty: 'All communication and deadlines with DVC student government.' },
      { name: 'Suyeon Kim', photo: 'media/team/suyeon.jpg', role: 'Marketing Lead / CMO', duty: 'Keeps GDG’s digital identity — Instagram and social design.' },
    ],
  },
  {
    id: 'pp',
    name: 'Publications & Promotions',
    short: 'P&P',
    color: 'yellow',
    blurb: 'Promotional strategy, content calendar and everything public-facing.',
    members: [
      { name: 'Aaron Iskandar', photo: 'media/team/aaron-iskandar.jpg', role: 'VP of Publications & Promotions', duty: 'Leads promo strategy and approves anything public-facing.', lead: true },
      { name: 'Kingston Li', photo: 'media/team/kingston.jpg', role: 'Officer', duty: 'Outreach, student engagement, event awareness and distribution.' },
      { name: 'Christabel “Chelsea” Prabawa', photo: 'media/team/chelsea.jpg', wheel: 'Chelsea Prabawa', role: 'Officer', duty: 'Content creation, campus engagement and Canva visuals.' },
      { name: 'Annabelle', photo: 'media/team/annabelle.jpg', role: 'Officer', duty: 'Written announcements, event info, editing and captions.' },
      { name: 'Jesslyn', photo: 'media/team/jesslyn.jpg', role: 'Officer', duty: 'Publications & Promotions team.' },
      { name: 'Audrey', photo: 'media/team/audrey.jpg', role: 'PR & Marketing', duty: 'Public relations and marketing for GDG DVC.' },
    ],
  },
  {
    id: 'rd',
    name: 'Research & Development',
    short: 'R&D',
    color: 'green',
    blurb: 'Which technologies, partnerships and hackathons GDG should pursue next.',
    members: [
      { name: 'Brenda', photo: 'media/team/brenda.jpg', role: 'VP of Research & Development', duty: 'Owns the R&D roadmap and leads the research officers.', lead: true },
      { name: 'David Howard Cahyadi Ng', wheel: 'David Ng', photo: 'media/team/david.jpg', role: 'Research Officer', duty: 'Carries out assigned research and brings proposals back.' },
      { name: 'Ethan Alexander Saputra', wheel: 'Ethan Saputra', photo: 'media/team/ethan.jpg', role: 'Research Officer', duty: 'Carries out assigned research and brings proposals back.' },
    ],
  },
]

// 指导老师（9/21 干部会议纪要：adviser 身份确认流程进行中）
export const adviser = 'Charles Sun'

export function teamSize() {
  return team.reduce((n, d) => n + d.members.length, 0)
}

// ---------- Join（三折页 "3 Easy Steps" + Important Links 文档） ----------
export const join = {
  steps: [
    { title: 'Follow our Instagram', text: '@gdgoc_dvc — announcements, events and hackathon news.', qr: 'media/gdg-instagram-qr.png', href: 'https://instagram.com/gdgoc_dvc' },
    { title: 'Join us on DVC Sync', text: 'Become an official member through DVC’s club platform.', qr: 'media/gdg-dvcsync-qr.png' },
    { title: 'Come to a meeting', text: 'Every Wednesday, 2:00–3:00 PM in LC 200 / 205. No experience needed.' },
  ],
  officer: { label: 'Apply to be an officer', href: 'https://tally.so/r/jaAAEx' },
  chapter: { label: 'Our chapter on gdg.community.dev', href: 'https://gdg.community.dev' },
  program: { label: 'About the GDG program', href: 'https://developers.google.com/community/gdg' },
  instagram: { label: '@gdgoc_dvc', href: 'https://instagram.com/gdgoc_dvc' },
}

// ---------- 谷歌元素 ----------
// 社团活动里实际用到的 Google 技术（三折页 / 会议纪要）：TechSentence.jsx 里的链接 + 一句话说明 + 官方开发者网站
export const techLinks = [
  { name: 'Gemini', line: 'Build with the Gemini API and Google AI Studio.', href: 'https://ai.google.dev', host: 'ai.google.dev', tone: 'gemini' },
  { name: 'Firebase', line: 'Ship apps with auth, a database and hosting in minutes.', href: 'https://firebase.google.com', host: 'firebase.google.com', tone: 'firebase' },
  { name: 'Android', line: 'Make native apps for the phone in your pocket.', href: 'https://developer.android.com', host: 'developer.android.com', tone: 'android' },
  { name: 'Google Cloud', line: 'Deploy, scale and run your projects for real.', href: 'https://cloud.google.com', host: 'cloud.google.com', tone: 'cloud' },
]

// 谷歌园区照片：Wikimedia Commons，CC BY-SA 4.0，必须保留署名和许可链接
const commons = (path, w = 1280) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${w}px-${path.split('/').pop()}`
export const photos = {
  googleplex: {
    src: commons('4/4f/Googleplex_-_June_2019_%285856%29.jpg', 1920),
    alt: 'The Google logo on a glass building at the Googleplex in Mountain View',
    credit: 'Gregory Varnum',
    href: 'https://commons.wikimedia.org/wiki/File:Googleplex_-_June_2019_(5856).jpg',
  },
  android: {
    src: commons('c/c5/Googleplex_-_June_2019_%285837%29.jpg'),
    alt: 'Android statue at the Googleplex',
    credit: 'Gregory Varnum',
    href: 'https://commons.wikimedia.org/wiki/File:Googleplex_-_June_2019_(5837).jpg',
  },
  bikes: {
    src: commons('2/20/Mountain_View_%28CA%2C_USA%29%2C_Charleston_Road%2C_Google-Fahrr%C3%A4der_--_2022_--_2901.jpg'),
    alt: 'Google campus bikes in Mountain View',
    credit: 'Dietmar Rabich',
    href: 'https://commons.wikimedia.org/wiki/File:Mountain_View_(CA,_USA),_Charleston_Road,_Google-Fahrr%C3%A4der_--_2022_--_2901.jpg',
  },
}
Object.assign(photos, {
  logoWall: {
    src: commons('3/39/Googleplex_-_June_2019_%285865%29.jpg'),
    alt: 'Large Google letters on a building at the Googleplex',
    credit: 'Gregory Varnum',
    href: 'https://commons.wikimedia.org/wiki/File:Googleplex_-_June_2019_(5865).jpg',
  },
  patio: {
    src: commons('0/0e/Googleplex-Patio-Aug-2014.JPG'),
    alt: 'Outdoor patio with colorful umbrellas at the Googleplex',
    credit: 'Jijithecat',
    href: 'https://commons.wikimedia.org/wiki/File:Googleplex-Patio-Aug-2014.JPG',
  },
  lawn: {
    src: commons('d/dd/Mountain_View_%28CA%2C_USA%29%2C_Charleston_Road%2C_Google-Erholungsfl%C3%A4che_--_2022_--_2909.jpg'),
    alt: 'Outdoor seating area on the Google campus',
    credit: 'Dietmar Rabich',
    href: 'https://commons.wikimedia.org/wiki/File:Mountain_View_(CA,_USA),_Charleston_Road,_Google-Erholungsfl%C3%A4che_--_2022_--_2909.jpg',
  },
  sign: {
    src: commons('e/ea/Mountain_View_%28CA%2C_USA%29%2C_Charleston_Road%2C_Google-Schild_--_2022_--_2896.jpg'),
    alt: 'Google sign on Charleston Road, Mountain View',
    credit: 'Dietmar Rabich',
    href: 'https://commons.wikimedia.org/wiki/File:Mountain_View_(CA,_USA),_Charleston_Road,_Google-Schild_--_2022_--_2896.jpg',
  },
  bikeClose: {
    src: commons('7/79/Mountain_View_%28CA%2C_USA%29%2C_Charleston_Road%2C_Google-Fahrr%C3%A4der_--_2022_--_2903.jpg'),
    alt: 'Close-up of a Google campus bike',
    credit: 'Dietmar Rabich',
    href: 'https://commons.wikimedia.org/wiki/File:Mountain_View_(CA,_USA),_Charleston_Road,_Google-Fahrr%C3%A4der_--_2022_--_2903.jpg',
  },
})
// 全球 GDG 社区活动照片 + 更多谷歌园区照片（同样来自 Wikimedia Commons，CC BY-SA 4.0）
Object.assign(photos, {
  devfest: {
    src: commons('3/39/Devfest.jpg'),
    alt: 'Developers coding on laptops at DevFest 2018, hosted by GDG Algiers',
    credit: 'GDG Algiers',
    href: 'https://commons.wikimedia.org/wiki/File:Devfest.jpg',
  },
  gdgLome: {
    src: commons('8/8c/Gdg_lome.jpg'),
    alt: 'Members of GDG Lomé celebrating at a community event',
    credit: 'Jackm ged',
    href: 'https://commons.wikimedia.org/wiki/File:Gdg_lome.jpg',
  },
  prayagraj: {
    src: commons('a/a3/Devfest_GDG_Prayagraj_2024.jpg'),
    alt: 'Audience at DevFest 2024, hosted by GDG Prayagraj',
    credit: 'Authorankit07',
    href: 'https://commons.wikimedia.org/wiki/File:Devfest_GDG_Prayagraj_2024.jpg',
  },
  sculptures: {
    src: commons('8/88/Android_sculptures.jpg'),
    alt: 'Android version sculptures on the Google campus',
    credit: 'Baltakatei',
    href: 'https://commons.wikimedia.org/wiki/File:Android_sculptures.jpg',
  },
  doors: {
    src: commons('c/cd/Googleplex_-_June_2019_%285891%29.jpg'),
    alt: 'Entrance with the Google logo at the Googleplex',
    credit: 'Gregory Varnum',
    href: 'https://commons.wikimedia.org/wiki/File:Googleplex_-_June_2019_(5891).jpg',
  },
})

// 2026 年换上的新照片（同样来自 Wikimedia Commons，但许可协议各不相同，所以每张单独写 license）
const LICENSES = {
  'CC BY-SA 3.0': { label: 'CC BY-SA 3.0', href: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  'CC BY 4.0': { label: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
}
Object.assign(photos, {
  devfestCatania: {
    src: commons('1/17/GiovanniPen_during_a_Wikipedia_presentation_at_DevFest_Catania_2025.jpg'),
    alt: 'A talk at DevFest Catania 2025, with the audience facing a slide titled “Google, Wikipedia, us and our cities”',
    credit: 'Auregann',
    href: 'https://commons.wikimedia.org/wiki/File:GiovanniPen_during_a_Wikipedia_presentation_at_DevFest_Catania_2025.jpg',
  },
  io2019: {
    src: commons('e/e0/Google_I-O_2019.jpg'),
    alt: 'The Google I/O 2019 keynote stage at Shoreline Amphitheatre, with a large crowd in front of the screens',
    credit: 'Александр Щербаков',
    href: 'https://commons.wikimedia.org/wiki/File:Google_I-O_2019.jpg',
    license: LICENSES['CC BY-SA 3.0'],
  },
  liquidGalaxy: {
    src: commons('c/c5/Google_Earth_Liquid_Galaxy.jpg'),
    alt: 'A Google Earth Liquid Galaxy: a curved wall of screens showing a 3D city, flanked by “Explore your world” panels',
    credit: 'Runner1928',
    href: 'https://commons.wikimedia.org/wiki/File:Google_Earth_Liquid_Galaxy.jpg',
    license: LICENSES['CC BY-SA 3.0'],
  },
  waymo: {
    src: commons('7/75/Waymo_Jaguar_I-Pace_in_San_Francisco_2023_dllu.jpg'),
    alt: 'A white Waymo self-driving Jaguar I-Pace with roof sensors on a San Francisco street',
    credit: 'Dllu',
    href: 'https://commons.wikimedia.org/wiki/File:Waymo_Jaguar_I-Pace_in_San_Francisco_2023_dllu.jpg',
    license: LICENSES['CC BY 4.0'],
  },
})

// Unsplash 上的照片（Unsplash License：网站可以免费使用，不需要付费；仍然标注作者以示尊重）
const unsplash = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`
const UNSPLASH_LICENSE = { label: 'Unsplash', href: 'https://unsplash.com/license' } // 署名写短一点，窄卡片里不会折行
Object.assign(photos, {
  hackathonNight: {
    src: unsplash('1504384764586-bb4cdc1707b0'),
    alt: 'Developers coding on laptops late at night at a hackathon, lit in purple',
    credit: 'Alex Kotliarskyi',
    href: 'https://unsplash.com/photos/ourQHRTE2IM',
    license: UNSPLASH_LICENSE,
  },
  geminiAd: {
    src: unsplash('1777785113207-c0fdd05ae937', 1200),
    alt: 'A Google Gemini ad on a street display reading “A new kind of help from Google”',
    credit: 'Igor Shalyminov',
    href: 'https://unsplash.com/photos/coyQjf-qjy0',
    license: UNSPLASH_LICENSE,
  },
  pixelCloseup: {
    src: unsplash('1729302784412-c36bbab2a6ef', 1400),
    alt: 'Close-up of a Google Pixel phone’s camera bar in raking light',
    credit: 'Samuel Angor',
    href: 'https://unsplash.com/photos/IHkYPDanoUg',
    license: UNSPLASH_LICENSE,
  },
  hackathonRoom: {
    src: unsplash('1504384308090-c894fdcc538d', 1200),
    alt: 'A room full of developers working on laptops at a hackathon, lit in purple',
    credit: 'Alex Kotliarskyi',
    href: 'https://unsplash.com/photos/QBpZGqEMsKg',
    license: UNSPLASH_LICENSE,
  },
  googleNeon: {
    src: unsplash('1573804633927-bfcbcd909acd', 1200),
    alt: 'A glowing neon Google logo on a dark wall',
    credit: 'Mitchell Luo',
    href: 'https://unsplash.com/photos/jz4ca36oJ_M',
    license: UNSPLASH_LICENSE,
  },
  googleNight: {
    src: unsplash('1638136264464-2711f0078d1e', 1200),
    alt: 'The Google logo lit up on a building at night',
    credit: 'Sascha Bosshard',
    href: 'https://unsplash.com/photos/et3Fex4JiBw',
    license: UNSPLASH_LICENSE,
  },
  hackCode: {
    graphic: 'code',
    alt: 'A code editor typing out the hackathon details, then running them in a terminal',
  },
  geminiPoster: {
    graphic: 'gemini',
    alt: 'The Gemini wordmark with a sparkle above, over five light strands that converge, braid together and spread apart',
  },
  aiStudio: {
    graphic: 'ai-studio',
    alt: 'Google AI Studio — the fastest path from prompt to production with Gemini',
  },
  googleShirts: {
    src: unsplash('1773883925979-73e8eb2f36ac', 1600),
    alt: 'Six people in white T-shirts lined up so the letters on their shirts spell “Google”, seen from above with long shadows',
    credit: 'dilara irem sancar',
    href: 'https://unsplash.com/photos/1gxrjzZ0v-8',
    license: UNSPLASH_LICENSE,
  },
  googleEntrance: {
    src: unsplash('1690983730723-37220d10db46', 1400),
    alt: 'People walking past the glass entrance of a Google office with the Google logo above the doors',
    credit: 'Karollyne Videira Hubert',
    href: 'https://unsplash.com/photos/BaQsbDu8Oso',
    license: UNSPLASH_LICENSE,
  },
})

// Events 里的照片墙：全球 GDG 社区 + 谷歌园区
export const gallery = [
  { photo: 'hackathonRoom', caption: 'Hack night' },
  { photo: 'googleNeon', caption: 'Google, in neon' },
  { photo: 'googleNight', caption: 'Google, after dark' },
  { photo: 'waymo', caption: 'Waymo self-driving car · San Francisco' },
]

export const PHOTO_LICENSE = { label: 'CC BY-SA 4.0', href: 'https://creativecommons.org/licenses/by-sa/4.0/' }

