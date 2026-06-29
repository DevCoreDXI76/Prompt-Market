export interface PromptProduct {
  id: string;
  title: string;
  titleEn?: string;
  price: number;
  category: "ChatGPT" | "Midjourney" | "Stable Diffusion" | "Claude";
  description: string;
  descriptionEn?: string;
  images: string[];
  prompt_text: string;
  tags: string[];
  rating: number;
  author: string;
  views: number;
  salesCount: number;
}

export function getLocalizedProduct(product: PromptProduct, locale: string): PromptProduct {
  if (locale !== "en") {
    return product;
  }

  const staticRef = PROMPT_PRODUCTS.find((p) => p.id === product.id);
  const titleEn = product.titleEn ?? staticRef?.titleEn;
  const descriptionEn = product.descriptionEn ?? staticRef?.descriptionEn;

  if (!titleEn || !descriptionEn) {
    return product;
  }

  return {
    ...product,
    title: titleEn,
    description: descriptionEn,
  };
}

export const PROMPT_PRODUCTS: PromptProduct[] = [
  {
    id: "1",
    title: "Pixar 스타일 3D 입체 캐릭터 생성기",
    titleEn: "Pixar Style 3D Character Generator",
    price: 7900,
    category: "Midjourney",
    description: "디즈니-픽사(Pixar) 스타일의 생생하고 귀여운 3D 입체 캐릭터를 생성하는 미드저니 프롬프트입니다.\n\n이 프롬프트는 캐릭터의 세부 표정, 장식물, 의상 스타일은 물론 부드러운 하이라이트 조명(Volumetric Lighting)과 질감을 섬세하게 조정할 수 있게 최적화되어 있습니다.\n\n### [활용 방법]\n1. 캐릭터 성별, 착용 의상, 들고 있는 소품 등의 변수만 수정하여 커스텀 캐릭터를 생성하세요.\n2. 발표용 PPT, 마케팅 배너 이미지, 서비스 캐릭터 디자인 등에 완벽하게 매칭됩니다.\n\n### [주의사항]\n- Midjourney v6 및 v5.2 버전에 최적화되어 있습니다.\n- 캐릭터가 너무 복잡한 소품을 쥐고 있는 경우 단어가 왜곡될 수 있으므로, 단순하고 특징적인 소품 사용을 추천합니다.",
    descriptionEn: "A Midjourney prompt for generating vivid, adorable 3D characters in Disney-Pixar animation style.\n\nThis prompt is optimized to let you finely tune facial expressions, accessories, outfit styles, as well as soft volumetric lighting and textures.\n\n### [How to Use]\n1. Customize characters by adjusting variables such as gender, clothing, and held props.\n2. Perfect for presentation slides, marketing banners, and service character design.\n\n### [Notes]\n- Optimized for Midjourney v6 and v5.2.\n- If the character holds overly complex props, words may distort — use simple, distinctive props.",
    images: [
      "https://picsum.photos/seed/pixar-char-1/800/600",
      "https://picsum.photos/seed/pixar-char-2/800/600",
      "https://picsum.photos/seed/pixar-char-3/800/600"
    ],
    prompt_text: "/imagine prompt: a super cute, chubby 3D animal character in full Pixar animation style, rendering by disney artists, highly detailed soft fur, holding a glowing small lantern, looking curious, dreamy magical forest background, warm cinematic volumetric lighting, octane render, 8k, ray tracing, ultra high quality --ar 4:3 --v 6.0",
    tags: ["Pixar", "3D Character", "Cute", "Midjourney v6"],
    rating: 4.9,
    author: "VisualArtisans",
    views: 1250,
    salesCount: 342
  },
  {
    id: "2",
    title: "구글 상위 노출(SEO) 매직 블로그 메이커",
    titleEn: "Google SEO Magic Blog Maker",
    price: 4900,
    category: "ChatGPT",
    description: "구글 검색엔진 상위 랭킹(SEO)을 완벽하게 저격하는 롱폼 블로그 포스트 개요 및 원고 생성 프롬프트입니다.\n\n작성하고자 하는 주제와 타겟 키워드만 넣으면, 구글 알고리즘이 선호하는 구조(H1, H2, H3의 유기적 배치, 독자 이탈 방지용 인트로 도입부, 키워드 밀도 유지, CTA 유도 등)에 맞춘 전문 원고를 집필해 드립니다.\n\n### [특장점]\n- 단순히 정보를 나열하는 기계적인 글이 아닌, 실제 전문 필진이 쓴 것 같은 흐름과 어조를 형성합니다.\n- 독자의 궁금증을 정확히 타겟팅하는 FAQ 섹션을 하단에 자동 구성합니다.\n\n### [활용 가이드]\n- ChatGPT Plus(GPT-4o) 및 일반 버전에서 모두 훌륭하게 작동하며, 세부 문체를 변경하고 싶을 때 유용한 '어조 가이드 옵션'이 프롬프트 내에 상세히 내장되어 있습니다.",
    descriptionEn: "A long-form blog post outline and draft generation prompt designed to target top Google search rankings (SEO).\n\nSimply enter your topic and target keywords, and it will write professional content structured for Google's preferred format — organic H1/H2/H3 placement, engaging intros to reduce bounce rate, balanced keyword density, and CTA prompts.\n\n### [Highlights]\n- Produces natural flow and tone like a professional writer, not mechanical information dumps.\n- Automatically builds an FAQ section at the bottom that targets reader questions.\n\n### [Usage Guide]\n- Works excellently on both ChatGPT Plus (GPT-4o) and the standard version.\n- Includes detailed 'tone guide options' for adjusting writing style.",
    images: [
      "https://picsum.photos/seed/seo-content-1/800/600",
      "https://picsum.photos/seed/seo-content-2/800/600"
    ],
    prompt_text: "당신은 구글 검색엔진 최적화(SEO) 및 카피라이팅 분야의 15년 차 수석 에디터입니다.\n\n제시된 [주제]와 [타겟 키워드]를 반영하여 독자의 스크롤을 끝까지 머무르게 할 고품질 블로그 콘텐츠를 집필해 주세요.\n\n■ 가이드라인:\n1. 서론: 강렬한 후킹 질문과 솔루션 제시를 통해 초반 이탈률(Bounce Rate)을 극소화합니다.\n2. 구성: H2와 H3 소제목 태그를 사용하여 논리적인 흐름으로 본문을 조직합니다.\n3. 자연스러운 키워드 포함: 타겟 키워드를 문맥상 전혀 어색하지 않게 전체 글자 수 대비 1.5% 수준으로 고르게 안배합니다.\n4. 가독성: 한 문장은 최대한 간결하게 쓰고, 글머리 기호(bullet points)와 굵은 글씨를 활용하여 모바일 가독성을 높입니다.\n5. 결론: 확실한 원 페이퍼 요약과 함께 자연스럽게 다른 정보나 구독을 안내하는 강력한 Call to Action(CTA)으로 끝을 맺습니다.\n\n[주제]: (원하는 주제를 입력하세요)\n[타겟 키워드]: (핵심 키워드 2-3개를 입력하세요)",
    tags: ["SEO", "Copywriting", "Blog writing", "ChatGPT"],
    rating: 4.8,
    author: "ContentGuru",
    views: 2430,
    salesCount: 812
  },
  {
    id: "3",
    title: "시네마틱 아날로그 인물 포트레이트 마스터",
    titleEn: "Cinematic Analog Portrait Master",
    price: 9900,
    category: "Stable Diffusion",
    description: "스튜디오 대형 조명과 35mm 아날로그 필름 질감을 고스란히 재현하는 스테이블 디퓨전 고해상도 인물 사진 프롬프트입니다.\n\n인공적인 AI 느낌을 완전히 걷어내고, 미세한 잔털, 피부 결, 자연스러운 안구 반사광(Catchlight), 그리고 렌즈 특유의 보케(Bokeh) 효과를 극대화할 수 있는 마법의 네거티브 및 포지티브 조합을 포함하고 있습니다.\n\n### [특장점]\n- 현실적인 주름, 비대칭, 피부 모공 묘사를 통해 사진작가들의 리얼한 카메라 워크 결과물처럼 속여질 정도의 퀄리티를 보장합니다.\n- SDXL 1.0, SD 1.5 및 각종 극사실계 리얼 계열 체크포인트에 훌륭하게 대응합니다.",
    descriptionEn: "A high-resolution Stable Diffusion portrait prompt that faithfully reproduces studio lighting and 35mm analog film texture.\n\nCompletely removes the artificial AI look, with a powerful positive/negative prompt combination that maximizes fine facial hair, skin texture, natural catchlights, and lens bokeh effects.\n\n### [Highlights]\n- Realistic wrinkles, asymmetry, and pore detail deliver quality indistinguishable from a professional photographer's work.\n- Works excellently with SDXL 1.0, SD 1.5, and various photorealistic checkpoints.",
    images: [
      "https://picsum.photos/seed/portrait-sd-1/800/600",
      "https://picsum.photos/seed/portrait-sd-2/800/600",
      "https://picsum.photos/seed/portrait-sd-3/800/600"
    ],
    prompt_text: "Prompt: RAW photo, a stunning detailed portrait of a gorgeous 25yo woman, warm cozy turtleneck, standing outdoors in light rain in central London, soft night streetlights bokeh, masterpiece, highest quality, cinematic lighting, shot on 35mm film, Fujifilm Superia 400, natural skin texture, visible pores, soft catchlights, sharp focus on eyes, nostalgic analog aesthetic\n\nNegative Prompt: (deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, watermark, text, signature, low quality, photorealistic rendering, plastic skin, airbrushed, doll-like, cg, render",
    tags: ["SDXL", "Portrait", "Analog Film", "Cinematic photo"],
    rating: 4.7,
    author: "FocusMaster",
    views: 1890,
    salesCount: 450
  },
  {
    id: "4",
    title: "Claude 3.5 Sonnet 풀스택 기획 & 아키텍트 가이드",
    titleEn: "Claude 3.5 Sonnet Full-Stack Planning & Architecture Guide",
    price: 12900,
    category: "Claude",
    description: "사용자가 제시한 소규모/스타트업 앱 기획 아이디어를 프로덕션 레벨의 완전한 풀스택 설계서로 바꾸어 주는 Claude 3.5 전용 메타 프롬프트입니다.\n\n이 프롬프트를 적용하면 대형 프로젝트 수준의 아키텍처 문서가 단 몇 초 만에 체계적으로 구조화되어 쏟아져 나옵니다.\n\n### [출력 범위]\n1. 핵심 기능 상세 및 사용자 스토리 매핑\n2. Drizzle ORM 또는 Prisma 스키마 코드\n3. Next.js App Router 기준의 폴더 구조도\n4. 백엔드 API RESTful 명세서 작성\n5. 완벽한 5단계 개발 로드맵 및 예상 에러 사전 예방 체크리스트\n\n### [강력한 추천 대상]\n- 1인 개발자, 프리랜서, MVP(최소 기능 제품) 개발 단계의 PM 및 시니어 아키텍트 역할이 필요한 개발 팀원들에게 최적의 동반자가 되어 드립니다.",
    descriptionEn: "A Claude 3.5 meta-prompt that transforms your small-scale or startup app idea into a production-level full-stack design document.\n\nApply this prompt and a large-project-grade architecture document will be systematically structured in just seconds.\n\n### [Output Scope]\n1. Core feature details and user story mapping\n2. Drizzle ORM or Prisma schema code\n3. Folder structure based on Next.js App Router\n4. Backend RESTful API specification\n5. Complete 5-phase development roadmap and error prevention checklist\n\n### [Recommended For]\n- Solo developers, freelancers, MVP-stage PMs, and team members who need senior architect-level guidance.",
    images: [
      "https://picsum.photos/seed/claude-arch-1/800/600",
      "https://picsum.photos/seed/claude-arch-2/800/600"
    ],
    prompt_text: "You are an elite Staff Software Architect and Technical PM with 20 years of experience. I will give you a core software idea. \n\nYour task is to decompose my concept and output a pristine, comprehensive Technical Architecture & Product Requirement Document (PRD) with the following exact structure:\n\n1. SYSTEM ARCHITECTURE & TECH STACK DEEP DIVE: Select the ideal stack (Next.js, Node, PostgreSQL, Tailwind, etc.) with strict justification for scalability and performance.\n2. PRODUCTION-READY DB SCHEMA: Write the complete database schema in TypeScript using Drizzle ORM syntax, complete with indices, relations, and cascade triggers.\n3. DIRECTORY STRUCTURE TREE: Map out a modular, highly scalable folder and directory structure matching best practices (e.g. Next.js App Router design).\n4. RESTful API & ENDPOINT DESIGN: Draft full endpoint specifications (e.g., POST /api/v1/auth/signup, GET /api/v1/jobs) including requests, typical payloads, and error codes.\n5. TIGHT ROADMAP: Outline a 5-phased agile dev schedule keeping MVP lean first. Warn about the Top 3 architectural pitfalls and how to mitigate them in code.\n\nConcept Idea: [여기에 기획 아이디어를 간단히 입력해 주세요. 예: '운동 메이트 매칭 매니저 앱']",
    tags: ["Claude 3.5", "Architecture", "DB Schema", "Fullstack Development"],
    rating: 5.0,
    author: "DevArchitect",
    views: 3120,
    salesCount: 1105
  }
];
