/**
 * seed-competitors.js
 * Chay: node scripts/seed-competitors.js
 * Muc dich: Import du lieu ban do doi thu vao Firestore (collections: providers + courses)
 */

import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const SEED_USER_ID = "seed-script";

const providers = [
  { name: "MCI (Hoc Vien Cong nghe MCI)", websiteUrl: "https://mcivietnam.com" },
  { name: "Mentora", websiteUrl: "https://mentora.edu.vn" },
  { name: "VTI Academy", websiteUrl: "https://vtiacademy.edu.vn" },
  { name: "FindSkill", websiteUrl: "https://findskill.ai" },
  { name: "X5 Academy", websiteUrl: "https://www.hocvienx5.com" },
  { name: "Udemy", websiteUrl: "https://www.udemy.com" },
  { name: "Data pot", websiteUrl: "https://datapot.vn" },
];

const coursesData = [
  // MCI
  {
    providerName: "MCI (Hoc Vien Cong nghe MCI)",
    title: "Khoa Hoc Huan Luyen AI Agent: Khai Pha Tuong Lai Cong Nghe AI",
    toolCombo: ["Custom GPTs", "Dify", "Coze", "RAG", "Vector Database", "Python", "API", "Function Calling"],
    targetAudience: [
      "Nha quan ly & lanh dao doanh nghiep",
      "Chuyen vien cac phong ban (Tai chinh, Van hanh, Marketing, Nhan su)",
      "Nguoi muon chuyen huong sang AI, Du lieu, Tu dong hoa",
      "Freelancer, ca nhan khoi nghiep, nguoi sang tao noi dung",
    ],
    durationDisplay: "05 buoi (moi buoi 2,5 - 3 tieng)",
    learningFormat: "Truc tuyen / Truc tiep",
    feeDisplay: "2.500.000d (Truc tuyen) / 3.000.000d (Truc tiep)",
    minFee: 2500000,
    maxFee: 3000000,
    strengths: [
      "Hoc qua case study & bai toan thuc te, cam tay chi viec tao san pham ngay",
      "Giang vien giau kinh nghiem thuc chien",
      "Khong yeu cau dau vao ve lap trinh hay AI",
      "Cam ket ho tro trong/sau khoa hoc va hoc lai mien phi",
    ],
    weaknesses: [
      "Thoi luong ngan, hoc vien can tu chu dong thuc hanh nhieu sau khoa hoc",
      "Tap trung vao No-code/Low-code, khong phu hop cho nguoi muon lap trinh sau ve ha tang AI Agent",
    ],
    insights: [],
    salesVolume: "3 khoa/thang; Truc tiep: 5~10 nguoi; Truc tuyen: dong (khong noi ro)",
    sourceUrl: "https://mcivietnam.com/course-detail/khoa-hoc-khoa-hoc-huan-luyen-ai-agent-khai-pha-tuong-lai-cong-nghe-ai/",
  },
  {
    providerName: "MCI (Hoc Vien Cong nghe MCI)",
    title: "Mastering Claude for Business",
    toolCombo: ["Claude", "Outlook", "Microsoft 365"],
    targetAudience: [
      "CEO, quan ly phong ban",
      "Nhan vien van phong",
      "Chuyen vien phan tich du lieu",
    ],
    durationDisplay: "06 buoi (2,5 tieng/buoi) Online",
    learningFormat: "Online",
    feeDisplay: "6.750.000d / 1 khoa (hoc vien tu mua Claude Pro ~530k/thang hoac 5,4tr/nam)",
    minFee: 6750000,
    maxFee: 6750000,
    strengths: [
      "Giang vien co kinh nghiem thuc chien",
      "Hien co ke hoach cho 7 lop trong thang 8",
      "1629 danh gia tren page",
    ],
    weaknesses: [
      "Doi tuong khach hang qua rong",
      "Chua to chuc offline",
      "Hoc vien tu bo chi phi mua Claude Pro",
    ],
    insights: [],
    salesVolume: "6-7 khoa/thang; 20-30 hoc vien/lop Zoom; co 1 GV + 1 tro giang",
    sourceUrl: "https://mcivietnam.com/course-detail/khoa-hoc-mastering-claude-for-business/",
  },
  // Mentora
  {
    providerName: "Mentora",
    title: "Xay dung Agentic AI - He thong tri tue nhan tao da tac nhan",
    toolCombo: [
      "Python", "LLM / Generative AI (GPT)", "OpenAI Agents SDK", "Multi-Agent Framework",
      "API & Tool Integration", "Docker / Kubernetes", "Workflow Automation",
    ],
    targetAudience: [
      "Lap trinh vien, ky su AI/ML, ky su du lieu",
      "Ky su phan mem, kien truc su he thong",
      "Nguoi muon phat trien ung dung AI Agent",
    ],
    durationDisplay: "20 buoi - 40 gio hoc",
    learningFormat: "Online co mentor dong hanh (lop 10-15 hoc vien)",
    feeDisplay: "3.000.000d - 10.000.000d (tuy muc do)",
    minFee: 3000000,
    maxFee: 10000000,
    strengths: [
      "Tap trung vao xu huong moi Agentic AI, khong chi dung o chatbot",
      "Thuc hanh cao (~74% thoi luong)",
      "Xay dung he thong AI Agent thuc te, kien truc nang cao (Multi-Agent, Planning, Reflection, Tool Calling)",
      "Co mentor ho tro trong qua trinh hoc",
    ],
    weaknesses: [
      "Yeu cau nen tang Python va AI co ban",
      "Kha chuyen sau, khong phu hop nguoi moi bat dau hoan toan",
      "Cong nghe AI Agent thay doi nhanh, can tu cap nhat sau khoa",
    ],
    insights: [],
    salesVolume: "3-6 khoa/thang",
    sourceUrl: "https://www.mentora.edu.vn/course/",
  },
  // VTI Academy
  {
    providerName: "VTI Academy",
    title: "Phan tich du lieu thuc chien tich hop AI (DA with AI)",
    toolCombo: ["Excel", "Python", "Power BI", "PostgreSQL", "MySQL", "Cloud", "Copilot"],
    targetAudience: [
      "Nguoi moi bat dau (Sinh vien / Nguoi nganh khac chuyen nghe)",
      "Nhan su khoi Kinh te (Ke toan, Tai chinh, Nhan su, Marketing)",
      "Lap trinh vien, Ky su du lieu muon mo rong sang Business Analytics",
    ],
    durationDisplay: "4-5 thang, T2-T4-T6",
    learningFormat: "Online + Offline",
    feeDisplay: "23.500.000d",
    minFee: 23500000,
    maxFee: 23500000,
    strengths: [
      "Chuong trinh toan dien: Excel, Power BI, SQL, Python, Deep Learning, Cloud, GenAI",
      "Dinh huong thuc chien: mini project, mock project, do an, portfolio",
      "Ket hop AI vao quy trinh phan tich (Copilot, Generative AI)",
      "Cam ket gioi thieu viec lam, ho tro 24/7",
    ],
    weaknesses: [
      "Chuong trinh kha rong va nang, de vuot nhu cau cua nguoi chi muon hoc DA co ban",
    ],
    insights: [],
    salesVolume: "~2 khoa/thang",
    sourceUrl: "https://vtiacademy.edu.vn/khoa-hoc-data-analyst",
  },
  // FindSkill
  {
    providerName: "FindSkill",
    title: "Data Analysis with AI",
    toolCombo: ["ChatGPT", "Claude", "Excel", "Google Sheets"],
    targetAudience: [
      "Chuyen vien phan tich (Data/Business Analyst) muon tang toc lam viec",
      "Nguoi lam kinh doanh, nhan su, van hanh can tu chu voi du lieu",
      "Nguoi moi bat dau, khong yeu cau lap trinh",
    ],
    durationDisplay: "8 bai hoc (tong 2,5 gio / 105 phut)",
    learningFormat: "Online tu hoc",
    feeDisplay: "$60/nam hoac $143 khong thoi han",
    minFee: 1500000,
    maxFee: 3600000,
    strengths: [
      "Khong yeu cau lap trinh (No-code)",
      "Thoi luong ngan gon, hoc nhanh (2,5 gio)",
      "Cho hoc thu 2 bai dau mien phi",
      "Lam duoc ngay 2 du an thuc te sau khi hoc",
      "Chung chi hoan thanh ho tro 9 ngon ngu (co tieng Viet)",
    ],
    weaknesses: [
      "Noi dung o muc Beginner, khong di sau vao ky thuat nang cao",
      "Chua tich hop Power BI hay Tableau",
    ],
    insights: [],
    salesVolume: "",
    sourceUrl: "https://findskill.ai/courses/data-analysis/",
  },
  // X5 Academy
  {
    providerName: "X5 Academy",
    title: "AI ke toan",
    toolCombo: ["ChatGPT", "AI Assistant", "Workflow Automation"],
    targetAudience: ["Ke toan", "Chu doanh nghiep", "Nhan vien tai chinh"],
    durationDisplay: "3 buoi, moi buoi 2 tieng",
    learningFormat: "Online, record",
    feeDisplay: "Lien he",
    minFee: 0,
    maxFee: 0,
    strengths: [
      "Tang nang suat va tiet kiem thoi gian",
      "Tu dong hoa quy trinh ke toan bang AI",
    ],
    weaknesses: [
      "Nguoi moi khong co nen tang co ban co the bi hong kien thuc nen",
    ],
    insights: [],
    salesVolume: "",
    sourceUrl: "https://www.hocvienx5.com/courses",
  },
  {
    providerName: "X5 Academy",
    title: "AI Founder Lab",
    toolCombo: ["ChatGPT", "AI Code Generator", "Workflow Automation"],
    targetAudience: ["Founder", "Nhan vien van phong co y tuong khoi nghiep", "Chu doanh nghiep"],
    durationDisplay: "3 ngay trong tuan (20:00-22:30)",
    learningFormat: "Online, record",
    feeDisplay: "Lien he",
    minFee: 0,
    maxFee: 0,
    strengths: [
      "Tap trung vao lam san pham thay vi ly thuyet",
      "Co coaching 1:1 va phat trien y tuong san pham",
    ],
    weaknesses: [
      "Hau nhu dua vao AI de tao san pham, kien thuc nen tang co the yeu",
    ],
    insights: [],
    salesVolume: "",
    sourceUrl: "https://www.hocvienx5.com/courses",
  },
  {
    providerName: "X5 Academy",
    title: "Vibecoding",
    toolCombo: ["AI Code Generator", "Workflow Automation"],
    targetAudience: ["Nguoi chua biet code", "Nhan vien van phong"],
    durationDisplay: "3 buoi, moi buoi 2 tieng",
    learningFormat: "Online, record",
    feeDisplay: "Lien he",
    minFee: 0,
    maxFee: 0,
    strengths: ["Xay website bang AI khong can code", "Hoc nhanh, tap trung thuc hanh"],
    weaknesses: ["Hau nhu dua vao AI, kien thuc co ban co the thieu hut"],
    insights: [],
    salesVolume: "",
    sourceUrl: "https://www.hocvienx5.com/courses",
  },
  // Udemy
  {
    providerName: "Udemy",
    title: "Complete Agentic AI Bootcamp With LangGraph and LangChain",
    toolCombo: ["LangChain", "LangGraph", "RAG", "Multi-Agent System", "Python"],
    targetAudience: ["Developer", "Data Scientist", "AI Engineer", "Nguoi lam cong nghe muon phat trien ung dung AI"],
    durationDisplay: "10-40+ gio hoc (linh hoat theo video)",
    learningFormat: "Online tu hoc",
    feeDisplay: "~300.000d - 1.400.000d",
    minFee: 300000,
    maxFee: 1400000,
    strengths: [
      "Nhieu khoa hoc thuc hanh, co project thuc te",
      "Cap nhat nhanh theo xu huong Generative AI",
      "Chi phi thap, hoc linh hoat",
      "Nhieu lua chon tu co ban den nang cao",
    ],
    weaknesses: [
      "Chat luong phu thuoc vao tung giang vien",
      "Can nen tang Python va kien thuc AI co ban",
      "Mot so khoa co the nhanh loi thoi do cong nghe AI thay doi nhanh",
    ],
    insights: [],
    salesVolume: "Hang nghin den hang chuc nghin hoc vien/thang",
    sourceUrl: "https://www.udemy.com",
  },
  {
    providerName: "Udemy",
    title: "AI Engineer Agentic Track: The Complete Agent and MCP Course",
    toolCombo: ["Workflow Automation", "Python", "MCP", "LangChain", "LangGraph"],
    targetAudience: [
      "Moi doi tuong tu khong chuyen den co kinh nghiem",
      "Ky su phan mem muon nang cao ky nang Agentic AI",
      "Nha quan ly, lanh dao, freelancer",
    ],
    durationDisplay: "21 gio 7 phut video (6 phan, 132 bai giang)",
    learningFormat: "Online tu hoc qua video, truy cap tron doi",
    feeDisplay: "349.000d",
    minFee: 349000,
    maxFee: 349000,
    strengths: [
      "Lo trinh thuc hanh ro rang, xay dung 8 du an thuc te trong 30 ngay / 6 tuan",
      "Mo rong tu No-Code den Frameworks, MCP",
      "Truy cap tron doi, chung chi hoan thanh",
      "363.419 hoc vien da dang ky",
    ],
    weaknesses: [
      "Noi dung chinh bang tieng Anh",
      "Can ngan sach nho (<$5) neu dung API mo hinh tra phi",
    ],
    insights: [],
    salesVolume: "363.419 hoc vien da dang ky",
    sourceUrl: "https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/",
  },
  // Data pot
  {
    providerName: "Data pot",
    title: "PL-300 - Microsoft Power BI Data Analyst",
    toolCombo: ["Power BI"],
    targetAudience: [
      "Nhan su kinh doanh, hanh chinh, marketing, tai chinh, ke toan, nhan su",
      "Chuyen gia phan tich muon nang cao ky nang va xay dung bao cao truc quan",
      "Nha quan ly, chu doanh nghiep muon doc bao cao Power BI",
      "Sinh vien Business Analytics / Data Analytics / Data Science",
    ],
    durationDisplay: "16 buoi, 2h/buoi",
    learningFormat: "Online / Offline",
    feeDisplay: "7.000.000d",
    minFee: 7000000,
    maxFee: 7000000,
    strengths: [
      "Bam theo tieu chuan PL-300 cua Microsoft",
      "Nhan manh thuc hanh, mo hinh hoa, truc quan hoa",
      "Co bai tap/du an va phan hoi hoc vien tich cuc",
      "Co de mau va chien luoc on tap cho chung chi",
    ],
    weaknesses: [
      "Thoi luong ngan, do phu kien thuc bi gioi han",
      "Kho di sau vao data modeling phuc tap hay toi uu DAX",
    ],
    insights: [],
    salesVolume: "~4 khoa/thang",
    sourceUrl: "https://datapot.vn/khoa-hoc/pl-300-microsoft-power-bi-data-analyst/",
  },
];

async function seed() {
  console.log("Bat dau seed du lieu doi thu canh tranh...\n");

  // 1. Tao providers
  const providerIdMap = {};

  for (const p of providers) {
    const existing = await db.collection("providers").where("name", "==", p.name).get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      providerIdMap[p.name] = doc.id;
      console.log(`[SKIP] Provider da ton tai: ${p.name} (id: ${doc.id})`);
      continue;
    }

    const docRef = await db.collection("providers").add({
      name: p.name,
      websiteUrl: p.websiteUrl,
      createdBy: SEED_USER_ID,
      createdAt: new Date().toISOString(),
    });
    providerIdMap[p.name] = docRef.id;
    console.log(`[OK]   Da them provider: ${p.name} (id: ${docRef.id})`);
  }

  console.log("\n--- Bat dau them courses ---\n");

  // 2. Tao courses
  let courseCount = 0;
  for (const course of coursesData) {
    const providerId = providerIdMap[course.providerName] || null;

    const existing = await db.collection("courses").where("title", "==", course.title).get();
    if (!existing.empty) {
      console.log(`[SKIP] Khoa hoc da ton tai: "${course.title}"`);
      continue;
    }

    await db.collection("courses").add({
      title: course.title,
      provider: course.providerName,
      providerId: providerId,
      toolCombo: course.toolCombo,
      targetAudience: course.targetAudience,
      durationDisplay: course.durationDisplay,
      learningFormat: course.learningFormat,
      feeDisplay: course.feeDisplay,
      minFee: course.minFee,
      maxFee: course.maxFee,
      strengths: course.strengths,
      weaknesses: course.weaknesses,
      insights: course.insights,
      salesVolume: course.salesVolume,
      sourceUrl: course.sourceUrl,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`[OK]   Da them: "${course.title}" (${course.providerName})`);
    courseCount++;
  }

  console.log(`\nHoan tat! Da seed ${courseCount} khoa hoc moi va ${Object.keys(providerIdMap).length} don vi dao tao.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Loi khi seed:", err);
  process.exit(1);
});
