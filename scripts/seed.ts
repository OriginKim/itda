/**
 * 재능잇다 (itda) 데모 시드 스크립트
 *
 * 실행: npm run seed
 *
 * SUPABASE_SERVICE_ROLE_KEY로 접속해 RLS를 우회하여 더미 데이터를 생성한다.
 * 이 스크립트는 절대 클라이언트(브라우저) 코드에서 재사용하지 않는다.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env.local에 설정되어 있어야 합니다.",
  );
  process.exit(1);
}

const db = createClient(supabaseUrl, serviceRoleKey);

// ============================================================
// 매칭 점수 계산 (PROJECT.md 6장과 동일한 공식)
// lib/matching.ts가 STEP 4에서 정식으로 구현되기 전까지
// 시드 데이터의 match_score를 채우기 위해 동일 공식을 사용한다.
// ============================================================
type StudentForScore = {
  skills: string[];
  interests: string[];
  weekly_hours: number;
  completed_count: number;
  completion_rate: number;
  ontime_rate: number;
};
type ProjectForScore = {
  required_skills: string[];
  category: string;
  estimated_hours: number;
};

function calcMatchScore(student: StudentForScore, project: ProjectForScore) {
  const requiredTotal = project.required_skills.length || 1;
  const ownedCount = project.required_skills.filter((skill) =>
    student.skills.includes(skill),
  ).length;
  const skill = Math.round((ownedCount / requiredTotal) * 40);

  const availability =
    student.weekly_hours >= project.estimated_hours
      ? 20
      : Math.round((student.weekly_hours / project.estimated_hours) * 20);

  const experience = Math.round((Math.min(student.completed_count, 4) / 4) * 20);

  const interest = student.interests.includes(project.category) ? 10 : 0;

  const trust = Math.round(
    (student.completion_rate * 0.6 + student.ontime_rate * 0.4) * 10,
  );

  const total = skill + availability + experience + interest + trust;

  return {
    total,
    breakdown: { skill, availability, experience, interest, trust },
  };
}

// ============================================================
// 학생 10명 — 스킬/가용시간/실적/신뢰도를 의도적으로 다양하게 구성
// ============================================================
const students = [
  {
    name: "김도윤",
    major: "시각디자인학과",
    skills: ["photoshop", "illustrator", "figma"],
    interests: ["design"],
    weekly_hours: 20,
    completed_count: 5,
    completion_rate: 0.95,
    ontime_rate: 0.9,
  },
  {
    name: "이서연",
    major: "영상학과",
    skills: ["video", "premiere", "aftereffects"],
    interests: ["video", "content"],
    weekly_hours: 15,
    completed_count: 3,
    completion_rate: 0.9,
    ontime_rate: 0.85,
  },
  {
    name: "박지훈",
    major: "경영학과",
    skills: ["excel", "ppt", "marketing"],
    interests: ["marketing"],
    weekly_hours: 10,
    completed_count: 1,
    completion_rate: 0.8,
    ontime_rate: 0.8,
  },
  {
    name: "최유나",
    major: "국어국문학과",
    skills: ["copywriting", "blog", "content"],
    interests: ["content"],
    weekly_hours: 8,
    completed_count: 0,
    completion_rate: 1.0,
    ontime_rate: 1.0,
  },
  {
    name: "정민재",
    major: "컴퓨터공학과",
    skills: ["figma", "photoshop", "illustrator"],
    interests: ["design", "content"],
    weekly_hours: 25,
    completed_count: 6,
    completion_rate: 0.98,
    ontime_rate: 0.95,
  },
  {
    name: "한소희",
    major: "영어영문학과",
    skills: ["translation", "english"],
    interests: ["translation"],
    weekly_hours: 12,
    completed_count: 2,
    completion_rate: 0.85,
    ontime_rate: 0.9,
  },
  {
    name: "오태양",
    major: "광고홍보학과",
    skills: ["instagram", "marketing", "ppt", "content"],
    interests: ["marketing", "content"],
    weekly_hours: 18,
    completed_count: 4,
    completion_rate: 0.92,
    ontime_rate: 0.88,
  },
  {
    name: "강하은",
    major: "미술학과",
    skills: ["illustrator", "photoshop", "canva"],
    interests: ["design"],
    weekly_hours: 6,
    completed_count: 1,
    completion_rate: 0.75,
    ontime_rate: 0.7,
  },
  {
    name: "윤도현",
    major: "미디어커뮤니케이션학과",
    skills: ["video", "instagram", "content"],
    interests: ["video", "content"],
    weekly_hours: 22,
    completed_count: 3,
    completion_rate: 0.88,
    ontime_rate: 0.82,
  },
  {
    name: "서지우",
    major: "산업디자인학과",
    skills: ["photoshop", "illustrator", "video"],
    interests: ["design", "video"],
    weekly_hours: 14,
    completed_count: 2,
    completion_rate: 0.9,
    ontime_rate: 0.93,
  },
];

// ============================================================
// 매장 5곳
// ============================================================
const merchants = [
  { name: "카페 온기", category: "카페", district: "마포구" },
  { name: "브런치 미소", category: "음식점", district: "강남구" },
  { name: "공방 나무결", category: "공방", district: "성동구" },
  { name: "편집샵 오브젝트", category: "소매점", district: "종로구" },
  { name: "헤어살롱 리본", category: "미용실", district: "서초구" },
];

async function main() {
  console.log("시드 데이터 생성을 시작합니다...");

  // ---- 기존 데이터 초기화 (재실행 가능하도록) ----
  await db.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("issues").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("merchants").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // ---- 학생 ----
  const { data: insertedStudents, error: studentError } = await db
    .from("students")
    .insert(students)
    .select();
  if (studentError) throw studentError;
  console.log(`학생 ${insertedStudents.length}명 생성 완료`);

  const studentByName = Object.fromEntries(
    insertedStudents.map((s) => [s.name, s]),
  );

  // ---- 매장 ----
  const { data: insertedMerchants, error: merchantError } = await db
    .from("merchants")
    .insert(merchants)
    .select();
  if (merchantError) throw merchantError;
  console.log(`매장 ${insertedMerchants.length}곳 생성 완료`);

  const merchantByName = Object.fromEntries(
    insertedMerchants.map((m) => [m.name, m]),
  );

  // ---- 프로젝트 8건 ----
  type ProjectSeed = {
    merchant: string;
    student: string | null;
    raw_request: string;
    title: string;
    goal: string;
    category: string;
    deliverables: string[];
    required_skills: string[];
    difficulty: "mini" | "standard";
    estimated_hours: number;
    duration_days: number;
    status: string;
  };

  const projectSeeds: ProjectSeed[] = [
    // recruiting (3)
    {
      merchant: "카페 온기",
      student: null,
      raw_request: "카페 신메뉴 홍보용 인스타 카드뉴스 만들어주세요",
      title: "인스타그램 카드뉴스 제작",
      goal: "신메뉴를 소개하는 카드뉴스 4장 제작",
      category: "content",
      deliverables: ["카드뉴스 4장 (1080x1080)"],
      required_skills: ["photoshop", "illustrator"],
      difficulty: "mini",
      estimated_hours: 8,
      duration_days: 5,
      status: "recruiting",
    },
    {
      merchant: "편집샵 오브젝트",
      student: null,
      raw_request: "신상품 짧은 홍보영상 만들어주세요 (30초 내외)",
      title: "상품 소개 영상 제작",
      goal: "신상품 홍보용 30초 영상 제작",
      category: "video",
      deliverables: ["30초 홍보영상 1편"],
      required_skills: ["video", "premiere"],
      difficulty: "standard",
      estimated_hours: 15,
      duration_days: 10,
      status: "recruiting",
    },
    {
      merchant: "헤어살롱 리본",
      student: null,
      raw_request: "시술 메뉴판 새로 디자인해주세요",
      title: "메뉴판 디자인",
      goal: "매장 시술 메뉴판 디자인 리뉴얼",
      category: "design",
      deliverables: ["메뉴판 디자인 시안 (A4)"],
      required_skills: ["photoshop", "illustrator"],
      difficulty: "mini",
      estimated_hours: 6,
      duration_days: 4,
      status: "recruiting",
    },
    // in_progress (2)
    {
      merchant: "브런치 미소",
      student: "최유나",
      raw_request: "블로그에 올릴 브런치 메뉴 소개글 써주세요",
      title: "블로그 리뷰 콘텐츠 제작",
      goal: "브런치 메뉴 소개 블로그 포스팅 작성",
      category: "content",
      deliverables: ["블로그 포스팅 2편"],
      required_skills: ["blog", "copywriting"],
      difficulty: "mini",
      estimated_hours: 6,
      duration_days: 5,
      status: "in_progress",
    },
    {
      merchant: "공방 나무결",
      student: "윤도현",
      raw_request: "공방 작업 과정을 담은 짧은 영상 편집해주세요",
      title: "제품 촬영 영상 편집",
      goal: "공방 작업 과정 홍보 영상 편집",
      category: "video",
      deliverables: ["1분 영상 1편"],
      required_skills: ["video", "instagram"],
      difficulty: "standard",
      estimated_hours: 12,
      duration_days: 7,
      status: "in_progress",
    },
    // completed (3)
    {
      merchant: "카페 온기",
      student: "김도윤",
      raw_request: "카페 로고를 좀 더 세련되게 리디자인해주세요",
      title: "매장 로고 리디자인",
      goal: "카페 브랜드 로고 리디자인",
      category: "design",
      deliverables: ["로고 파일 (AI, PNG)"],
      required_skills: ["illustrator", "photoshop"],
      difficulty: "standard",
      estimated_hours: 10,
      duration_days: 7,
      status: "completed",
    },
    {
      merchant: "편집샵 오브젝트",
      student: "오태양",
      raw_request: "인스타그램 운영 방향 정리한 제안서 만들어주세요",
      title: "SNS 마케팅 전략 제안서",
      goal: "인스타그램 운영 전략 제안서 작성",
      category: "marketing",
      deliverables: ["마케팅 제안서 (PPT)"],
      required_skills: ["marketing", "ppt"],
      difficulty: "mini",
      estimated_hours: 8,
      duration_days: 5,
      status: "completed",
    },
    {
      merchant: "헤어살롱 리본",
      student: "한소희",
      raw_request: "외국인 고객을 위한 영문 시술 메뉴 번역해주세요",
      title: "영문 메뉴 번역",
      goal: "시술 메뉴판 영문 번역",
      category: "translation",
      deliverables: ["영문 메뉴판 번역본"],
      required_skills: ["translation", "english"],
      difficulty: "mini",
      estimated_hours: 4,
      duration_days: 3,
      status: "completed",
    },
  ];

  const insertedProjects: Record<
    string,
    { row: { id: string }; seed: ProjectSeed }
  > = {};
  for (const seed of projectSeeds) {
    const student = seed.student ? studentByName[seed.student] : null;
    const { data, error } = await db
      .from("projects")
      .insert({
        merchant_id: merchantByName[seed.merchant].id,
        student_id: student?.id ?? null,
        raw_request: seed.raw_request,
        title: seed.title,
        goal: seed.goal,
        category: seed.category,
        deliverables: seed.deliverables,
        required_skills: seed.required_skills,
        difficulty: seed.difficulty,
        estimated_hours: seed.estimated_hours,
        duration_days: seed.duration_days,
        revision_count: 1,
        is_out_of_scope: false,
        status: seed.status,
      })
      .select()
      .single();
    if (error) throw error;
    insertedProjects[seed.title] = { row: data, seed };
  }
  console.log(`프로젝트 ${projectSeeds.length}건 생성 완료`);

  // ---- 지원(applications) ----
  // 진행중/완료 프로젝트: 배정된 학생의 accepted 지원서
  const acceptedApplications: { title: string; studentName: string }[] = [
    { title: "블로그 리뷰 콘텐츠 제작", studentName: "최유나" },
    { title: "제품 촬영 영상 편집", studentName: "윤도현" },
    { title: "매장 로고 리디자인", studentName: "김도윤" },
    { title: "SNS 마케팅 전략 제안서", studentName: "오태양" },
    { title: "영문 메뉴 번역", studentName: "한소희" },
  ];

  for (const { title, studentName } of acceptedApplications) {
    const { row, seed } = insertedProjects[title];
    const student = studentByName[studentName];
    const { total, breakdown } = calcMatchScore(student, seed);
    const { error } = await db.from("applications").insert({
      project_id: row.id,
      student_id: student.id,
      match_score: total,
      score_breakdown: breakdown,
      status: "accepted",
    });
    if (error) throw error;
  }

  // 모집중 프로젝트: 지원자 2명씩 (아직 미확정)
  const pendingApplications: { title: string; studentName: string }[] = [
    { title: "인스타그램 카드뉴스 제작", studentName: "강하은" },
    { title: "인스타그램 카드뉴스 제작", studentName: "정민재" },
    { title: "상품 소개 영상 제작", studentName: "이서연" },
    { title: "상품 소개 영상 제작", studentName: "서지우" },
    { title: "메뉴판 디자인", studentName: "정민재" },
    { title: "메뉴판 디자인", studentName: "강하은" },
  ];

  for (const { title, studentName } of pendingApplications) {
    const { row, seed } = insertedProjects[title];
    const student = studentByName[studentName];
    const { total, breakdown } = calcMatchScore(student, seed);
    const { error } = await db.from("applications").insert({
      project_id: row.id,
      student_id: student.id,
      match_score: total,
      score_breakdown: breakdown,
      status: "applied",
    });
    if (error) throw error;
  }
  console.log(
    `지원 ${acceptedApplications.length + pendingApplications.length}건 생성 완료`,
  );

  // ---- 완료 프로젝트 상호 평가 ----
  const reviewSeeds = [
    {
      title: "매장 로고 리디자인",
      merchantComment: "시안 퀄리티가 높고 소통도 빨라서 만족스러웠어요.",
      studentComment: "요청사항을 명확히 전달해주셔서 작업하기 편했습니다.",
    },
    {
      title: "SNS 마케팅 전략 제안서",
      merchantComment: "제안서가 구체적이고 바로 적용 가능한 내용이었어요.",
      studentComment: "피드백을 신속하게 주셔서 일정 안에 마칠 수 있었어요.",
    },
    {
      title: "영문 메뉴 번역",
      merchantComment: "번역이 자연스럽고 마감도 정확히 지켜주셨습니다.",
      studentComment: "결제와 커뮤니케이션 모두 원활했습니다.",
    },
  ];

  for (const { title, merchantComment, studentComment } of reviewSeeds) {
    const { row } = insertedProjects[title];
    const { error: err1 } = await db.from("reviews").insert({
      project_id: row.id,
      direction: "merchant_to_student",
      rating: 5,
      comment: merchantComment,
    });
    if (err1) throw err1;
    const { error: err2 } = await db.from("reviews").insert({
      project_id: row.id,
      direction: "student_to_merchant",
      rating: 5,
      comment: studentComment,
    });
    if (err2) throw err2;
  }
  console.log(`상호 평가 ${reviewSeeds.length * 2}건 생성 완료`);

  // ---- 관리자 이슈 4건 (타입별로 다르게) ----
  const issueSeeds = [
    {
      title: "인스타그램 카드뉴스 제작",
      type: "match_failed",
      description: "지원자는 있으나 요구 스킬 충족도가 낮아 매칭이 지연되고 있습니다.",
      status: "open",
    },
    {
      title: "메뉴판 디자인",
      type: "no_response",
      description: "지원한 학생이 3일간 연락에 응답하지 않고 있습니다.",
      status: "open",
    },
    {
      title: "제품 촬영 영상 편집",
      type: "dropout",
      description: "배정된 학생이 개인 사정으로 프로젝트를 중도 포기했습니다.",
      status: "open",
    },
    {
      title: "SNS 마케팅 전략 제안서",
      type: "scope_dispute",
      description: "산출물 범위(추가 시안 요청)에 대한 이견이 있었으나 협의 후 해결되었습니다.",
      status: "resolved",
    },
  ];

  for (const { title, type, description, status } of issueSeeds) {
    const { row } = insertedProjects[title];
    const { error } = await db.from("issues").insert({
      project_id: row.id,
      type,
      description,
      status,
    });
    if (error) throw error;
  }
  console.log(`관리자 이슈 ${issueSeeds.length}건 생성 완료`);

  console.log("시드 데이터 생성이 모두 완료되었습니다.");
}

main().catch((error) => {
  console.error("시드 실행 중 오류가 발생했습니다:", error);
  process.exit(1);
});
