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
    { id: "blank", label: "Blank Documents" },
    { id: "professional", label: "Professional" },
    { id: "business", label: "Business" },
    { id: "creative", label: "Creative Writing" },
    { id: "education", label: "Education" },
    { id: "personal", label: "Personal" },
    { id: "tools", label: "Tools" },
    { id: "converters", label: "Converters" },
];

export const TEMPLATES: Template[] = [
    // ─── Blank Documents ────────────────────────────────
    {
        id: "blank",
        title: "Blank Document",
        description: "Start from scratch",
        icon: Plus,
        content: "<h1>Untitled Document</h1><p>Start typing...</p>",
        color: "bg-blue-500",
        category: "blank"
    },
    {
        id: "diary",
        title: "Diary",
        description: "What happened today?",
        icon: Feather,
        content: `<h1>Dear Diary,</h1>
<p><i>${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</i></p>
<br/>
<p>Today...</p>`,
        color: "bg-indigo-500",
        category: "personal"
    },

    // ─── Professional ─────────────────────────────────
    {
        id: "resume-modern",
        title: "Modern Resume",
        description: "Sleek and modern design",
        icon: Briefcase,
        content: `<h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 8px;">JOHN DOE</h1>
<p style="color: #64748b; font-size: 14px;">Senior Software Engineer | New York, USA | john.doe@email.com | +1 555 123 4567</p>

<h2 style="color: #2563eb; margin-top: 24px;">Professional Summary</h2>
<p>Full-Stack Software Engineer with 10+ years of experience specializing in large-scale web applications and microservices architectures. Deep technical knowledge in React, Node.js, and cloud technologies. Proven success in working with Agile methodologies and team leadership.</p>

<h2 style="color: #2563eb;">Work Experience</h2>
<h3>Senior Software Engineer — TechCorp Inc.</h3>
<p style="color: #64748b; font-size: 13px;">January 2021 - Present | New York</p>
<ul>
<li>Designed the re-architecture of an e-commerce platform serving 2M+ monthly users</li>
<li>Led the microservices migration, reducing system response time by 40%</li>
<li>Mentored a team of 5 developers, increasing team efficiency by 30%</li>
<li>Established CI/CD pipelines, reducing deployment time from 2 hours to 15 minutes</li>
</ul>

<h3>Software Developer — InnoSoft LLC</h3>
<p style="color: #64748b; font-size: 13px;">June 2018 - December 2020 | San Francisco</p>
<ul>
<li>Developed an enterprise customer portal using React and TypeScript</li>
<li>Performed RESTful API design and implementation</li>
<li>Improved query times by 60% through PostgreSQL database optimizations</li>
</ul>

<h2 style="color: #2563eb;">Education</h2>
<h3>M.S. in Computer Engineering</h3>
<p style="color: #64748b;">Tech University — 2018</p>
<h3>B.S. in Computer Engineering</h3>
<p style="color: #64748b;">Science Institute — 2016</p>

<h2 style="color: #2563eb;">Technical Skills</h2>
<p><strong>Languages:</strong> JavaScript, TypeScript, Python, Java, Go</p>
<p><strong>Frontend:</strong> React, Next.js, Vue.js, Tailwind CSS</p>
<p><strong>Backend:</strong> Node.js, Express, Django, Spring Boot</p>
<p><strong>Database:</strong> PostgreSQL, MongoDB, Redis</p>
<p><strong>Tools:</strong> Docker, Kubernetes, AWS, Git, Jenkins</p>

<h2 style="color: #2563eb;">Languages</h2>
<p>English (Native) | Spanish (Advanced) | German (Intermediate)</p>`,
        color: "bg-violet-600",
        category: "professional"
    },
    {
        id: "resume-classic",
        title: "Classic Resume",
        description: "Traditional and formal format",
        icon: Briefcase,
        content: `<h1 style="text-align: center; letter-spacing: 4px;">JANE SMITH</h1>
<p style="text-align: center; color: #666; font-size: 13px;">Marketing Manager<br/>London, UK | jane.smith@email.com | +44 20 7946 0958</p>
<hr/>

<h2>CAREER OBJECTIVE</h2>
<p>Marketing professional with 15 years of experience specializing in digital marketing strategies and brand management. Proven success in increasing company revenues through data-driven decision making and creative campaign management.</p>

<h2>WORK EXPERIENCE</h2>
<p><strong>Marketing Manager</strong> — GlobalBrand Inc.<br/><em>March 2020 - Present</em></p>
<ul>
<li>Manages marketing department with an annual budget of $5M</li>
<li>Increased brand awareness by 45% through digital marketing strategies</li>
<li>Grew organic traffic 3x through SEO and content marketing</li>
</ul>

<p><strong>Senior Marketing Specialist</strong> — MediaWorld<br/><em>January 2017 - February 2020</em></p>
<ul>
<li>Increased engagement rates by 200% through social media campaigns</li>
<li>Raised conversion rates by 35% by establishing email marketing automation</li>
</ul>

<h2>EDUCATION</h2>
<p><strong>Master of Business Administration (MBA)</strong><br/>City University — 2017</p>
<p><strong>B.A. in Communications</strong><br/>State College — 2012</p>

<h2>CERTIFICATIONS</h2>
<ul>
<li>Google Analytics Certification</li>
<li>HubSpot Inbound Marketing Certification</li>
<li>Facebook Blueprint Certification</li>
</ul>

<h2>REFERENCES</h2>
<p>Available upon request.</p>`,
        color: "bg-zinc-700",
        category: "professional"
    },
    // ─── Converters ──────────────────────────────
    {
        id: "pdf-to-pptx",
        title: "PDF to PPTX",
        description: "Convert PDF file to PowerPoint presentation",
        icon: PieChart,
        content: "",
        color: "bg-orange-600",
        category: "converters",
    },
    {
        id: "pptx-to-pdf",
        title: "PPTX to PDF",
        description: "Convert PowerPoint file to PDF document",
        icon: Library,
        content: "",
        color: "bg-blue-600",
        category: "converters",
    },
    {
        id: "pdf-to-word",
        title: "PDF to Word",
        description: "Convert PDF file to editable Word document",
        icon: FileText,
        content: "",
        color: "bg-blue-500",
        category: "converters"
    },
    {
        id: "word-to-pdf",
        title: "Word to PDF",
        description: "Convert Word document to PDF format",
        icon: FileSearch,
        content: "",
        color: "bg-red-500",
        category: "converters"
    },
    {
        id: "resume-creative",
        title: "Creative Resume",
        description: "Eye-catching and unique design",
        icon: Crown,
        content: `<h1 style="color: #e11d48; font-size: 32px;">✦ ALEX RIVERA</h1>
<p style="font-size: 18px; color: #e11d48; font-weight: 600;">UI/UX Designer & Creative Director</p>
<p style="color: #94a3b8;">alex@studio.design | Portfolio: alexrivera.design | Berlin, Germany</p>

<h2 style="color: #e11d48;">🎨 About Me</h2>
<p>UI/UX designer with 8 years of experience turning user experience into art. I have developed award-winning projects that blend minimalist aesthetics with functionality. Expert in Figma, Adobe Creative Suite, and modern web technologies.</p>

<h2 style="color: #e11d48;">💼 Projects & Experience</h2>
<h3>Lead Designer — PixelPerfect Studio</h3>
<p><em>2022 - Present</em></p>
<ul>
<li>Corporate identity design for 50+ brands</li>
<li>Webby Awards 2024 Finalist — Best Mobile App Design</li>
<li>Accelerated design process by 50% by creating a Design System</li>
</ul>

<h3>UI/UX Designer — Digital Minds Agency</h3>
<p><em>2019 - 2022</em></p>
<ul>
<li>Increased conversion rates by 40% through an e-commerce app redesign project</li>
<li>UX optimization through user research and A/B testing</li>
</ul>

<h2 style="color: #e11d48;">🛠 Tools & Skills</h2>
<p><strong>Design:</strong> Figma, Sketch, Adobe XD, Photoshop, Illustrator, After Effects</p>
<p><strong>Code:</strong> HTML/CSS, React, Framer Motion, Three.js</p>
<p><strong>Methodology:</strong> Design Thinking, User Research, Rapid Prototyping</p>

<h2 style="color: #e11d48;">🏆 Awards</h2>
<ul>
<li>Webby Awards 2024 — Finalist</li>
<li>A'Design Award 2023 — Silver</li>
<li>Awwwards Site of the Day — 3 times</li>
</ul>`,
        color: "bg-rose-600",
        category: "professional"
    },
    {
        id: "cover-letter",
        title: "Cover Letter",
        description: "Job application cover letter",
        icon: Mail,
        content: `<p style="text-align: right;">February 19, 2026</p>

<p><strong>Hiring Manager</strong><br/>XYZ Technology Inc.<br/>Silicon Valley, CA</p>

<p>Dear Hiring Manager,</p>

<p>I am very pleased to submit my application for the Senior Software Engineer position open at XYZ Technology Inc. With over ten years of software development experience and expertise in modern web technologies, I believe I can make significant contributions to your team.</p>

<p>In my current position, I successfully designed the re-architecture of a large-scale e-commerce platform serving more than 2 million monthly users. By leading the microservices migration, I reduced system response times by 40% and optimized CI/CD processes, reducing deployment time from 2 hours to 15 minutes.</p>

<p>Your company's innovative approach and technology vision excite me greatly. Especially your AI-integrated products and contributions to the open-source community offer an ideal environment for the next step of my career.</p>

<p>I look forward to discussing how my background and skills would be a good fit for your team.</p>

<p>Sincerely,</p>
<br/>
<p><strong>John Doe</strong><br/>john.doe@email.com<br/>+1 555 123 4567</p>`,
        color: "bg-teal-600",
        category: "professional"
    },

    // ─── Business ──────────────────────────────────
    {
        id: "business-letter",
        title: "Official Business Letter",
        description: "Corporate correspondence template",
        icon: Mail,
        content: `<p style="text-align: right;"><strong>ABC Consulting Inc.</strong><br/>Main Street 123<br/>10001 New York, NY<br/>Tel: +1 212 555 0000</p>

<p>February 19, 2026</p>

<p>Dear Mr. Smith,<br/>CEO<br/>DEF Industries LLC<br/>Industrial Park, Chicago</p>

<p><strong>Subject:</strong> Regarding Collaboration Proposal</p>

<p>Dear Mr. Smith,</p>

<p>We are closely following your company's successful work in the sector. As ABC Consulting, with our 15 years of experience in digital transformation and process optimization, we believe we can contribute to DEF Industries' growth targets.</p>

<p>We request you to review our collaboration proposal attached, and we would be pleased to plan a meeting to discuss details at a convenient date.</p>

<p>Sincerely,</p>
<br/>
<p><strong>Dr. Sarah Wilson</strong><br/>Founding Partner<br/>ABC Consulting Inc.</p>`,
        color: "bg-emerald-600",
        category: "business"
    },
    {
        id: "meeting-minutes",
        title: "Meeting Minutes",
        description: "Professional meeting notes",
        icon: Users,
        content: `<h1 style="color: #1e3a5f;">Meeting Minutes</h1>
<hr/>

<p><strong>Date:</strong> Wednesday, February 19, 2026</p>
<p><strong>Time:</strong> 14:00 - 15:30</p>
<p><strong>Location:</strong> Main Meeting Room / Zoom</p>
<p><strong>Chairperson:</strong> Robert Evans</p>
<p><strong>Secretary:</strong> Linda White</p>

<h2>Participants</h2>
<ul>
<li>Robert Evans — CEO</li>
<li>Linda White — Project Manager</li>
<li>David Brown — Tech Lead</li>
<li>Emily Green — Marketing Manager</li>
<li>Chris Miller — Finance Director</li>
</ul>

<h2>Agenda Items</h2>
<ol>
<li>Q1 2026 performance evaluation</li>
<li>New product launch timeline</li>
<li>Budget revision</li>
<li>Other topics</li>
</ol>

<h2>Decisions</h2>
<ul>
<li>✅ 95% of Q1 targets were met, Q2 targets will be revised upwards by 10%</li>
<li>✅ New product launch is set for April 15, 2026</li>
<li>✅ Marketing budget increased by 15%</li>
</ul>

<h2>Action Items</h2>
<ul>
<li>[ ] David — Will present technical readiness report by March 1st</li>
<li>[ ] Emily — Will prepare launch campaign plan by March 5th</li>
<li>[ ] Chris — Will present revised budget table to the board</li>
</ul>

<p><strong>Next Meeting:</strong> Wednesday, March 5, 2026, 14:00</p>`,
        color: "bg-indigo-600",
        category: "business"
    },
    {
        id: "proposal",
        title: "Proposal Letter",
        description: "Professional business proposal",
        icon: FileText,
        content: `<h1 style="color: #1e40af; text-align: center;">BUSINESS PROPOSAL</h1>
<p style="text-align: center; color: #64748b;">ABC Tech — Web Development Services</p>
<hr/>

<h2>1. Project Summary</h2>
<p>This proposal covers the corporate website and e-commerce platform development project for DEF Company. The project will be completed within a 12-week period using modern web technologies.</p>

<h2>2. Scope</h2>
<ul>
<li>Responsive corporate website design and development</li>
<li>E-commerce module integration</li>
<li>Content management system (CMS)</li>
<li>SEO optimization</li>
<li>Mobile application (iOS & Android)</li>
<li>6-month maintenance and support</li>
</ul>

<h2>3. Pricing</h2>

<p><strong>Website Design:</strong> $15,000</p>
<p><strong>E-Commerce Module:</strong> $12,000</p>
<p><strong>Mobile Application:</strong> $25,000</p>
<p><strong>Maintenance (6 months):</strong> $3,000</p>
<p style="font-size: 18px;"><strong>Total: $55,000</strong></p>

<h2>4. Timeline</h2>
<ul>
<li><strong>Weeks 1-2:</strong> Discovery and planning</li>
<li><strong>Weeks 3-6:</strong> Design and prototyping</li>
<li><strong>Weeks 7-10:</strong> Development</li>
<li><strong>Weeks 11-12:</strong> Testing and launch</li>
</ul>

<h2>5. Payment Terms</h2>
<p>30% of the project will be paid upon signing the contract, 40% at mid-delivery, and 30% at final delivery.</p>

<br/>
<p><strong>Approval:</strong> ___________________________</p>
<p><strong>Date:</strong> ___________________________</p>`,
        color: "bg-blue-700",
        category: "business"
    },
    {
        id: "invoice",
        title: "Invoice Template",
        description: "Professional invoice",
        icon: Receipt,
        content: `<h1 style="color: #059669; border-bottom: 3px solid #059669; padding-bottom: 8px;">INVOICE</h1>

<p><strong>From:</strong> ABC Solutions Inc.<br/>New York, NY<br/>Tax ID: 1234567890</p>

<p><strong>To:</strong> XYZ LLC<br/>Chicago, IL<br/>Tax ID: 0987654321</p>

<p><strong>Invoice No:</strong> 2026-0219<br/><strong>Date:</strong> February 19, 2026<br/><strong>Due Date:</strong> March 19, 2026</p>

<hr/>

<h2>Items</h2>

<p>1. Website Development Service — $8,000</p>
<p>2. Logo and Corporate Identity Design — $2,500</p>
<p>3. SEO Consultancy (3 Months) — $1,500</p>
<p>4. Hosting and Domain (1 Year) — $400</p>

<hr/>

<p><strong>Subtotal:</strong> $12,400</p>
<p><strong>Tax (10%):</strong> $1,240</p>
<p style="font-size: 20px; color: #059669;"><strong>TOTAL AMOUNT: $13,640</strong></p>

<hr/>

<p><strong>Bank Details:</strong><br/>ABC Solutions Inc.<br/>Global Bank — SWIFT: GBLBUS33<br/>Account: 1234 5678 9012 3456</p>`,
        color: "bg-emerald-700",
        category: "business"
    },

    // ─── Creative Writing ──────────────────────────
    {
        id: "novel-chapter",
        title: "Novel Chapter",
        description: "Write your masterpiece",
        icon: BookOpen,
        content: `<h1 style="text-align: center; margin-top: 60px; letter-spacing: 6px; color: #1a1a1a;">CHAPTER ONE</h1>
<h2 style="text-align: center; color: #666; font-style: italic; font-weight: 400;">Dark Waters</h2>

<br/>

<p>The wind howled through the ancient trees, whispering secrets forgotten by time. It was the last days of September and the leaves hadn't yet begun to change color, but there was a scent of change in the air — that familiar smell of freshly cut grass and approaching rain.</p>

<p>Elif sat on the old pier by the lake, swinging her feet over the water. The letter in her pocket — her grandmother's last letter — left a sweat in her palm. She didn't dare open it. Because she knew that the words inside that envelope would change everything.</p>

<p>"Once some doors are opened," her grandmother had said at their last meeting, with that familiar glint in her eyes, "they can never be closed again."</p>

<p style="text-align: center; color: #999;">* * *</p>

<p>The town was small — the kind of place where everyone knew everyone and secrets echoed off the walls. Elif had grown up here but never quite felt like she belonged. Perhaps it wasn't because her family lived in the oldest house in this town, but what was hidden in the basement under that house.</p>

<p>As the sun began to set, golden ripples appeared on the surface of the water. Elif took a deep breath and opened the envelope.</p>

<p style="font-style: italic; margin-left: 40px;">"My dear granddaughter, when you read this letter I will no longer be by your side. But I want you to know that the most precious legacy I left you is the key in that old house. Find it. And no matter what, open the door in the basement..."</p>`,
        color: "bg-orange-600",
        category: "creative"
    },
    {
        id: "screenplay",
        title: "Screenplay Draft",
        description: "Movie or TV series script",
        icon: Clapperboard,
        content: `<h1 style="text-align: center; letter-spacing: 8px;">LOST CITY</h1>
<p style="text-align: center; color: #666;">Written by: [Your Name]</p>
<p style="text-align: center; color: #666;">Draft 1 — February 19, 2026</p>

<hr/>

<h2>SCENE 1 - EXT. HUDSON RIVER - NIGHT</h2>

<p style="font-style: italic; color: #555;">The full moon illuminates the dark waters of the Hudson. A distant foghorn is heard. The camera slowly rises from the water surface and focuses on an old mansion on the shore.</p>

<p style="text-align: center; font-weight: bold; text-transform: uppercase;">ELIF (30)</p>
<p style="text-align: center; margin-left: 80px; margin-right: 80px;">Standing on the balcony of the mansion, looking at an old photograph in her hand.</p>

<p style="margin-left: 120px;"><strong>ELIF</strong><br/>(to herself)<br/>Who is this woman in the photo? And why is she pictured with my mother's necklace?</p>

<p style="margin-left: 120px;"><strong>KEREM (O.S.)</strong><br/>Elif? Elif, where are you?</p>

<p style="font-style: italic; color: #555;">Elif quickly puts the photo in her pocket and turns inside.</p>

<h2>SCENE 2 - INT. MANSION - LIVING ROOM - NIGHT</h2>

<p style="font-style: italic; color: #555;">A large living room filled with antique furniture and crystal chandeliers. The walls are covered with faded oil paintings.</p>

<p style="margin-left: 120px;"><strong>ELIF</strong><br/>I'm here. What happened?</p>

<p style="margin-left: 120px;"><strong>KEREM</strong><br/>(excitedly)<br/>We found something in the basement. You need to come.</p>`,
        color: "bg-pink-600",
        category: "creative"
    },
    {
        id: "short-story",
        title: "Short Story",
        description: "Tell your story",
        icon: PenTool,
        content: `<h1 style="text-align: center; font-style: italic;">The Last Train</h1>
<p style="text-align: center; color: #94a3b8;">A short story</p>

<br/>

<p>The station clock showed midnight and the platform was empty. There was only one man — an old man sitting on the bench with his grey coat and old suitcase.</p>

<p>The last train was late, again. Everything was late in this town — the seasons, the news, even sometimes people's emotions.</p>

<p>The man took a pocket watch out of his pocket. On the inside of the watch cover was a faded photo: a young woman, smiling in a sunny garden. The photo was at least forty years old.</p>

<p>"Still waiting?" said a voice coming out of the darkness.</p>

<p>The man looked up. In front of him stood a tall woman in a black hat. Her eyes were as dark as the night, and her smile was as bright as the moonlight.</p>

<p>"I always wait," said the man in a calm voice. "It's the nature of this business."</p>

<p>A train whistle blew in the distance. The rails began to vibrate.</p>

<p style="text-align: center; color: #999;">— THE END —</p>`,
        color: "bg-amber-600",
        category: "creative"
    },

    // ─── Education ──────────────────────────────────────
    {
        id: "academic-paper",
        title: "Academic Paper",
        description: "Academic writing format",
        icon: GraduationCap,
        content: `<h1 style="text-align: center;">The Transformative Impact of Artificial Intelligence<br/>on Education Systems: A Review</h1>
<p style="text-align: center; color: #666;">Prof. Dr. [Your Name]<br/>[University Name], [Faculty]<br/>email@university.edu</p>

<hr/>

<h2>Abstract</h2>
<p>This study comprehensively examines the impact of artificial intelligence technologies on modern education systems. The research systematically analyzes more than 150 academic articles published between 2020 and 2025. Findings reveal that AI-powered learning tools increase student success by an average of 23%, but significant challenges in equity and accessibility persist.</p>

<p><strong>Keywords:</strong> Artificial intelligence, education technology, adaptive learning, digital transformation, student success</p>

<h2>1. Introduction</h2>
<p>The field of education has been directly influenced by technological developments throughout history. From the invention of the printing press to the internet revolution, each new technology has fundamentally transformed the production, distribution, and consumption of knowledge. The rapid development of AI technologies in the 2020s brings about a new paradigm shift in education.</p>

<h2>2. Method</h2>
<p>A systematic literature review method was used in this research. Databases such as Web of Science, Scopus, and Google Scholar were searched with the keywords "artificial intelligence AND education".</p>

<h2>3. Findings</h2>
<p>[Write your findings here...]</p>

<h2>4. Discussion</h2>
<p>[Write your discussion here...]</p>

<h2>5. Conclusion</h2>
<p>[Write your conclusion here...]</p>

<h2>References</h2>
<p style="margin-left: 40px; text-indent: -40px;">Doe, J. (2024). AI and Education. <em>Journal of Educational Sciences</em>, 45(2), 123-145.</p>
<p style="margin-left: 40px; text-indent: -40px;">Smith, B. & Jones, C. (2023). Adaptive Learning Systems. <em>Technology and Society</em>, 12(1), 56-78.</p>`,
        color: "bg-sky-700",
        category: "education"
    },
    {
        id: "lecture-notes",
        title: "Lecture Notes",
        description: "Organized lecture notes template",
        icon: StickyNote,
        content: `<h1 style="color: #7c3aed;">📚 Data Structures and Algorithms</h1>
<p style="color: #64748b;"><strong>Course:</strong> CS 201 | <strong>Week:</strong> 5 | <strong>Date:</strong> February 19, 2026</p>
<p style="color: #64748b;"><strong>Professor:</strong> Prof. Dr. David Smith</p>
<hr/>

<h2 style="color: #7c3aed;">📌 This Week's Topic: Tree Data Structures</h2>

<h3>Basic Concepts</h3>
<ul>
<li><strong>Tree:</strong> A hierarchical data structure</li>
<li><strong>Root:</strong> The top node of the tree</li>
<li><strong>Leaf:</strong> Nodes with no children</li>
<li><strong>Depth:</strong> Distance from the root to a node</li>
</ul>

<h3>Binary Search Tree (BST)</h3>
<p>A tree structure where each node has at most two children:</p>
<ul>
<li>All values in the left subtree < root value</li>
<li>All values in the right subtree > root value</li>
<li>Search complexity: O(log n) — average case</li>
</ul>

<h3>⚠️ Important Points</h3>
<ul>
<li>Complexity can drop to O(n) in unbalanced trees</li>
<li>AVL and Red-Black trees remain balanced</li>
<li>Exam question: Mandatory to know tree traversal methods (inorder, preorder, postorder)</li>
</ul>

<h3>📝 Homework</h3>
<ul>
<li>[ ] Read Chapter 5 of the book</li>
<li>[ ] Solve LeetCode #94, #144, #145</li>
<li>[ ] Implement BST (Java or Python)</li>
</ul>

<h3>🔗 Resources</h3>
<ul>
<li>Introduction to Algorithms — Cormen et al.</li>
<li>Visualgo.net — Tree animations</li>
</ul>`,
        color: "bg-purple-600",
        category: "education"
    },

    // ─── Business (Extra) ────────────────────────────
    {
        id: "petition",
        title: "Petition",
        description: "Official petition template",
        icon: ScrollText,
        content: `<h1 style="text-align: center; color: #1e3a5f;">PETITION</h1>

<p style="text-align: right;">February 19, 2026</p>

<p><strong>To:</strong><br/>[Agency Name]<br/>[Department Name]<br/>[City]</p>

<p><strong>Subject:</strong> [Briefly write the subject of the petition]</p>

<p>Dear Sir/Madam,</p>

<p>[Write your petition text here. Express your request clearly. State your reasons and any legal regulations you rely on.]</p>

<p>[Additional information, supporting documents or details can be given in the second paragraph.]</p>

<p>I request that the necessary action be taken.</p>

<br/>

<p style="text-align: right;"><strong>[Full Name]</strong><br/>ID Number: [xxxxxxxxxxx]<br/>Address: [Your Address]<br/>Tel: [Your phone number]<br/>Signature: _______________</p>

<p style="color: #888; font-size: 11px;"><strong>Attachments:</strong><br/>1. [List of supporting documents if any]<br/>2. [Copy of ID card]</p>`,
        color: "bg-slate-700",
        category: "business"
    },
    {
        id: "contract",
        title: "Contract",
        description: "Work contract draft",
        icon: ClipboardList,
        content: `<h1 style="text-align: center; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">SERVICE CONTRACT</h1>

<p style="text-align: center; color: #64748b;">Contract No: 2026/SC-001</p>

<h2>ARTICLE 1 — PARTIES</h2>
<p><strong>CLIENT (EMPLOYER):</strong><br/>Title: [Company Name] Inc.<br/>Address: [Company Address]<br/>Tax ID: [Tax ID Number]<br/>(Hereinafter referred to as the "Employer".)</p>

<p><strong>SERVICE PROVIDER (CONTRACTOR):</strong><br/>Title/Full Name: [Contractor Name]<br/>Address: [Contractor Address]<br/>Tax ID/SSN: [Number]<br/>(Hereinafter referred to as the "Contractor".)</p>

<h2>ARTICLE 2 — SUBJECT OF THE CONTRACT</h2>
<p>This contract regulates the conditions for the Contractor to provide [service description] services to the Employer.</p>

<h2>ARTICLE 3 — DURATION</h2>
<p>The contract duration is <strong>12 (twelve)</strong> months from the date of signature. Unless one of the parties gives written notice 30 days before the end of the term, the contract is extended for another 1 year under the same conditions.</p>

<h2>ARTICLE 4 — FEE AND PAYMENT</h2>
<p>Monthly service fee: <strong>$[Amount]</strong><br/>Payment: Last business day of each month<br/>Payment method: Bank transfer</p>

<h2>ARTICLE 5 — CONFIDENTIALITY</h2>
<p>The parties undertake to keep all information and documents acquired under this contract confidential.</p>

<h2>ARTICLE 6 — TERMINATION</h2>
<p>Each of the parties can terminate the contract by giving 30 days' prior written notice.</p>

<h2>ARTICLE 7 — DISPUTE</h2>
<p>The courts of [City] are authorized for disputes arising from this contract.</p>

<br/>
<p><strong>EMPLOYER</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>CONTRACTOR</strong></p>
<p>_____________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________</p>
<p>Date: __/__/2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: __/__/2026</p>`,
        color: "bg-cyan-700",
        category: "business"
    },
    {
        id: "work-report",
        title: "Work Report",
        description: "Weekly/monthly work report",
        icon: BarChart,
        content: `<h1 style="color: #1e40af;">📊 Weekly Activity Report</h1>
<p style="color: #64748b;"><strong>Prepared by:</strong> [Full Name] | <strong>Department:</strong> Software Development | <strong>Date:</strong> February 19, 2026</p>
<hr/>

<h2 style="color: #1e40af;">1. Summary</h2>
<p>90% of the sprint goals were completed this week. Critical Module A was successfully taken to production. 2 blocker bugs were resolved, and performance improvements were made.</p>

<h2 style="color: #1e40af;">2. Completed Work</h2>
<ul>
<li>✅ User authentication module — OAuth 2.0 integration</li>
<li>✅ Database migration script — Update to v3.2.0</li>
<li>✅ API rate limiting implementation</li>
<li>✅ Dashboard performance optimization (page load speeded up by 40%)</li>
<li>✅ 47 unit tests written, test coverage increased from 78% to 85%</li>
</ul>

<h2 style="color: #1e40af;">3. In-Progress Work</h2>
<ul>
<li>🔄 Notification system development — 70% completed</li>
<li>🔄 Mobile responsive adjustments — 50% completed</li>
</ul>

<h2 style="color: #1e40af;">4. Issues and Risks</h2>
<ul>
<li>⚠️ Slowness in 3rd party payment API — support request opened</li>
<li>⚠️ 1 person from QA team on leave, test capacity decreased</li>
</ul>

<h2 style="color: #1e40af;">5. Next Week's Plan</h2>
<ul>
<li>[ ] Notification system will be completed</li>
<li>[ ] Load testing will be performed</li>
<li>[ ] v3.2.0 release notes will be prepared</li>
</ul>

<h2 style="color: #1e40af;">6. Metrics</h2>
<p><strong>Sprint Velocity:</strong> 42 points (target: 45)</p>
<p><strong>Bug Count:</strong> 3 open, 12 resolved</p>
<p><strong>Uptime:</strong> 99.97%</p>`,
        color: "bg-blue-800",
        category: "business"
    },

    // ─── Personal ─────────────────────────────────────
    {
        id: "blog-post",
        title: "Blog Post",
        description: "Personal blog post template",
        icon: Newspaper,
        content: `<h1 style="font-size: 28px; color: #0f172a;">Being Human in the Age of Artificial Intelligence: Thoughts and Observations</h1>
<p style="color: #94a3b8; font-size: 13px;">📅 February 19, 2026 | ✍️ [Author Name] | 🏷️ Technology, Philosophy | ⏱️ 5 min read</p>
<hr/>

<p style="font-size: 16px; color: #334155; font-style: italic; border-left: 4px solid #6366f1; padding-left: 16px;">"Technology is an extension of man — but it does not replace man." — Marshall McLuhan</p>

<h2>Introduction</h2>
<p>AI tools that have entered our lives in the last few years have radically changed the way we do business. So where is this change taking us? And most importantly, what does it mean to be "human" in this transformation?</p>

<h2>My Observations</h2>
<p>Last week I had an interesting experience at a conference. The speaker read a poem written by AI, and no one in the room realized it was written by a machine. This moment started a deep thought process for me.</p>

<p>However, I also observe this: the area where AI is most unsuccessful is precisely what makes humans human — empathy, intuition, and the creative spark.</p>

<h2>Conclusion</h2>
<p>Perhaps the real question shouldn't be "will AI surpass us?", but "how will we define ourselves?". Technology is a tool; how we use it is entirely up to us.</p>

<p><strong>What do you think?</strong> I'm waiting for your comments. 💬</p>

<hr/>
<p style="color: #94a3b8; font-size: 11px;">This article reflects my personal views. I request you to cite the source when sharing.</p>`,
        color: "bg-indigo-500",
        category: "personal"
    },
    {
        id: "todo-list",
        title: "To-Do List",
        description: "Daily/weekly task list",
        icon: ListChecks,
        content: `<h1 style="color: #059669;">✅ Weekly To-Do List</h1>
<p style="color: #64748b;">Week: February 19–25, 2026 | Priority: 🔴 High 🟡 Medium 🟢 Low</p>
<hr/>

<h2 style="color: #dc2626;">🔴 Urgent and Important</h2>
<ul>
<li>[ ] Prepare project presentation (Deadline: February 20)</li>
<li>[ ] Send client meeting notes</li>
<li>[ ] Complete budget report and present to manager</li>
</ul>

<h2 style="color: #ca8a04;">🟡 Important but Not Urgent</h2>
<ul>
<li>[ ] Create new project plan draft</li>
<li>[ ] Perform team performance evaluations</li>
<li>[ ] Complete online training module</li>
<li>[ ] Order office supplies</li>
</ul>

<h2 style="color: #16a34a;">🟢 Can Be Done</h2>
<ul>
<li>[ ] Organize email inbox</li>
<li>[ ] Organize desk</li>
<li>[ ] Register for networking event</li>
</ul>

<h2>📌 Notes</h2>
<ul>
<li>Wednesday at 14:00 — department meeting</li>
<li>Submit leave form to HR by Friday</li>
</ul>

<h2>🏆 Completed This Week</h2>
<ul>
<li>[x] Q4 report sent</li>
<li>[x] New software installation done</li>
</ul>`,
        color: "bg-emerald-500",
        category: "personal"
    },
    {
        id: "presentation-notes",
        title: "Presentation Notes",
        description: "Professional presentation draft",
        icon: Presentation,
        content: `<h1 style="color: #7c3aed; text-align: center;">🎯 Digital Transformation Strategy 2026</h1>
<p style="text-align: center; color: #64748b;">Board Presentation | February 19, 2026</p>
<hr/>

<h2 style="color: #7c3aed;">Slide 1 — Agenda</h2>
<ol>
<li>Current status analysis</li>
<li>Digital transformation roadmap</li>
<li>Budget and resource planning</li>
<li>Expected results and KPIs</li>
<li>Q&A</li>
</ol>

<h2 style="color: #7c3aed;">Slide 2 — Current Status</h2>
<p><strong>Strengths:</strong></p>
<ul>
<li>Strong customer base (50,000+ active users)</li>
<li>Experienced technical team</li>
</ul>
<p><strong>Weaknesses:</strong></p>
<ul>
<li>Old infrastructure (legacy systems)</li>
<li>Excessive manual processes</li>
</ul>

<h2 style="color: #7c3aed;">Slide 3 — Roadmap</h2>
<p><strong>Q1 2026:</strong> Infrastructure modernization → Cloud migration</p>
<p><strong>Q2 2026:</strong> Automation → Digitalize business processes</p>
<p><strong>Q3 2026:</strong> AI integration → Improving customer experience</p>
<p><strong>Q4 2026:</strong> Scaling → Expanding into new markets</p>

<h2 style="color: #7c3aed;">Slide 4 — Budget</h2>
<p>Total investment: <strong>$1,000,000</strong></p>
<p>Expected ROI: <strong>180% (within 18 months)</strong></p>

<h2 style="color: #7c3aed;">Slide 5 — Questions?</h2>
<p style="text-align: center; font-size: 18px;">Thank you! 🙏<br/>Contact: [email@company.com]</p>`,
        color: "bg-violet-500",
        category: "business"
    },
    {
        id: "project-plan",
        title: "Project Plan",
        description: "Detailed project management plan",
        icon: FolderKanban,
        content: `<h1 style="color: #0369a1;">📋 Project Plan: Mobile App Development</h1>
<p style="color: #64748b;"><strong>Project Manager:</strong> [Full Name] | <strong>Start:</strong> March 1, 2026 | <strong>End:</strong> June 30, 2026</p>
<hr/>

<h2 style="color: #0369a1;">1. Project Summary</h2>
<p>Development of a mobile application for our customers running on iOS and Android platforms. The app will offer all core features of the existing web platform in a mobile environment.</p>

<h2 style="color: #0369a1;">2. Goals</h2>
<ul>
<li>🎯 10,000 downloads in the first 3 months</li>
<li>🎯 App Store rating 4.5+</li>
<li>🎯 Customer satisfaction 85%+</li>
<li>🎯 Delivery within budget</li>
</ul>

<h2 style="color: #0369a1;">3. Phases</h2>

<h3>Phase 1 — Discovery and Planning (Weeks 1-2)</h3>
<ul>
<li>[ ] Requirements analysis</li>
<li>[ ] User research (survey + interview)</li>
<li>[ ] Technical feasibility report</li>
<li>[ ] Approval of project scope</li>
</ul>

<h3>Phase 2 — Design (Weeks 3-5)</h3>
<ul>
<li>[ ] Wireframe designs</li>
<li>[ ] UI/UX design (Figma)</li>
<li>[ ] Prototype and user testing</li>
<li>[ ] Design approval</li>
</ul>

<h3>Phase 3 — Development (Weeks 6-12)</h3>
<ul>
<li>[ ] Backend API development</li>
<li>[ ] Frontend (React Native) development</li>
<li>[ ] 3rd party integrations</li>
<li>[ ] Unit and integration tests</li>
</ul>

<h3>Phase 4 — Testing and Launch (Weeks 13-16)</h3>
<ul>
<li>[ ] QA testing</li>
<li>[ ] Beta testing (100 users)</li>
<li>[ ] App Store/Play Store publishing</li>
<li>[ ] Launch campaign</li>
</ul>

<h2 style="color: #0369a1;">4. Team</h2>
<p>1 Project Manager, 2 Backend Devs, 2 Frontend Devs, 1 UI/UX Designer, 1 QA Engineer</p>

<h2 style="color: #0369a1;">5. Budget</h2>
<p><strong>Total:</strong> $250,000 (personnel: $180K, infrastructure: $40K, marketing: $30K)</p>`,
        color: "bg-sky-600",
        category: "business"
    },
    {
        id: "reference-letter",
        title: "Reference Letter",
        description: "Professional reference note",
        icon: Award,
        content: `<h1 style="text-align: center; color: #1e3a5f;">REFERENCE LETTER</h1>
<hr/>

<p style="text-align: right;">February 19, 2026</p>

<p><strong>To:</strong> Whom It May Concern</p>

<p>Dear Sir/Madam,</p>

<p>This letter has been prepared to evaluate the professional competencies and personal characteristics of <strong>[Employee Full Name]</strong>.</p>

<p>[Employee Name] served as <strong>[Position]</strong> in our company between <strong>[Start Date] - [End Date]</strong>. During this time, I had the opportunity to work closely with them and observed their performance closely.</p>

<h2>Professional Competencies</h2>
<ul>
<li><strong>Technical Skills:</strong> [Employee] has a strong technical background in their field. [Specific skills and projects]</li>
<li><strong>Problem Solving:</strong> Has the capacity to produce creative and effective solutions to complex problems</li>
<li><strong>Communication:</strong> Communicates excellently both within the team and with customers</li>
<li><strong>Leadership:</strong> [Information about projects or teams managed]</li>
</ul>

<h2>Personal Characteristics</h2>
<p>[Employee] is a reliable, disciplined, and team-oriented professional. They maintain their positive approach even under challenging conditions and motivate those around them.</p>

<p>I confidently recommend <strong>[Employee Name]</strong> for any position. I am sure they will be successful in their new role as well.</p>

<p>Please do not hesitate to contact me for additional information.</p>

<p>Sincerely,</p>
<br/>
<p><strong>[Reference Giver Full Name]</strong><br/>[Title]<br/>[Company Name]<br/>Tel: [Phone] | Email: [Email]</p>`,
        color: "bg-teal-700",
        category: "professional"
    },
    {
        id: "poem",
        title: "Poem",
        description: "Poetry writing template",
        icon: Feather,
        content: `<h1 style="text-align: center; color: #7c2d12; font-style: italic;">Lost Times</h1>
<p style="text-align: center; color: #a16207;">— A poem —</p>
<br/>

<p style="text-align: center; line-height: 2;">
The wind of the ancients blows from the streets,<br/>
Steps echo on stone-paved roads.<br/>
Once laughter rang out here,<br/>
Now silence... and pale memories.
</p>

<br/>

<p style="text-align: center; line-height: 2;">
Clouds pass across the sky slowly,<br/>
Each carries a story on its shoulders.<br/>
I stand at the window, the glass is misty,<br/>
I write your name in the frost with my finger.
</p>

<br/>

<p style="text-align: center; line-height: 2;">
Time is a river — flows, doesn't stop,<br/>
Memories are a boat — sinks, isn't found.<br/>
But stay in my heart, until the last line,<br/>
Let this poem not end, let this word not run out.
</p>

<br/>
<p style="text-align: center; color: #92400e; font-style: italic;">— [Poet Name], 2026 —</p>`,
        color: "bg-orange-700",
        category: "creative"
    },
    {
        id: "interview-prep",
        title: "Interview Prep",
        description: "Job interview preparation notes",
        icon: UserCheck,
        content: `<h1 style="color: #4338ca;">🎯 Interview Prep Notes</h1>
<p style="color: #64748b;"><strong>Position:</strong> [Position Name] | <strong>Company:</strong> [Company Name] | <strong>Date:</strong> [Interview Date]</p>
<hr/>

<h2 style="color: #4338ca;">🏢 Company Research</h2>
<ul>
<li><strong>Sector:</strong> [Company's field of activity]</li>
<li><strong>Number of Employees:</strong> [Approximate number]</li>
<li><strong>Mission:</strong> [Company's mission statement]</li>
<li><strong>Recent News:</strong> [Current developments]</li>
<li><strong>Competitors:</strong> [Main competitors]</li>
</ul>

<h2 style="color: #4338ca;">💬 Likely Questions and Answers</h2>

<h3>"Tell me about yourself?"</h3>
<p style="background: #f0f9ff; padding: 12px; border-radius: 6px;">[2-minute elevator pitch: Education, experience, strengths, and why you are suitable for this position]</p>

<h3>"Why do you want to work for this company?"</h3>
<p style="background: #f0f9ff; padding: 12px; border-radius: 6px;">[Compatibility with company values, projects, and your career goals]</p>

<h3>"What is your greatest weakness?"</h3>
<p style="background: #f0f9ff; padding: 12px; border-radius: 6px;">[A realistic weakness + how you are improving it]</p>

<h3>"Where do you see yourself in 5 years?"</h3>
<p style="background: #f0f9ff; padding: 12px; border-radius: 6px;">[Your career development plan, growth opportunities in this company]</p>

<h2 style="color: #4338ca;">❓ Your Questions</h2>
<ul>
<li>What is the team structure and working culture like?</li>
<li>What are the expectations from me in the first 90 days in this position?</li>
<li>What are the company's growth plans for the coming period?</li>
<li>Are there mentoring or professional development programs?</li>
</ul>

<h2 style="color: #4338ca;">✅ Check List</h2>
<ul>
<li>[ ] Print updated copies of CV (2 copies)</li>
<li>[ ] Prepare portfolio/references</li>
<li>[ ] Choose appropriate attire</li>
<li>[ ] Check address and transportation</li>
<li>[ ] Go 10 minutes early</li>
</ul>`,
        color: "bg-fuchsia-600",
        category: "personal"
    },

    // ─── Tools ─────────────────────────────────────
    {
        id: "pdf",
        title: "Edit PDF",
        description: "Draw and sign on PDF",
        icon: FileText,
        content: "",
        color: "bg-red-500",
        category: "tools"
    },
];
