import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding VORTEXA database...");

  // 1. Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.result.deleteMany();
  await prisma.score.deleteMany();
  await prisma.judgingCriteria.deleteMany();
  await prisma.judgeAssignment.deleteMany();
  await prisma.judge.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.problemStatement.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.roomAllocation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.eventSettings.deleteMany();

  // WARNING: These are DEVELOPMENT credentials only.
  // DO NOT use seed.ts to provision production environments.
  const seedPassword = process.env.SEED_PASSWORD || "password123";
  if (process.env.NODE_ENV === "production" && seedPassword === "password123") {
    console.warn("⚠️ WARNING: Seeding production database with default weak password!");
  }
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  // 2. Event Settings
  const now = new Date();
  const futureStart = new Date(now.getTime() + 86400000 * 2); // 2 days in future
  const futureEnd = new Date(now.getTime() + 86400000 * 4); // 4 days in future
  const futureDeadline = new Date(now.getTime() + 86400000 * 3.5);

  const eventSettings = await prisma.eventSettings.create({
    data: {
      event_name: "VORTEXA 2026",
      event_year: "2026",
      registration_open: true,
      registration_close: false,
      payment_deadline: futureStart,
      hackathon_start: futureStart,
      hackathon_end: futureEnd,
      submission_deadline: futureDeadline,
      max_team_size: 4,
      min_team_size: 1,
      payment_amount: 500,
      upi_id: "vortexa2026@upi",
      upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=vortexa2026@upi&pn=VORTEXA%20Hackathon&am=500&cu=INR",
      venue: "VORTEXA Innovation Center, Main Campus",
      official_email: "support@vortexa.io",
    },
  });
  console.log("✅ Created Event Settings:", eventSettings.event_name);

  // 3. Super Admin
  const superAdminUser = await prisma.user.create({
    data: {
      email: "superadmin@vortexa.io",
      password_hash: passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  await prisma.participant.create({
    data: {
      user_id: superAdminUser.id,
      name: "Chief Super Admin",
      phone: "+91 9876543210",
      college: "VORTEXA University",
      course: "B.Tech Computer Science",
      year: "4th Year",
    },
  });

  // 4. Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@vortexa.io",
      password_hash: passwordHash,
      role: "ADMIN",
    },
  });
  await prisma.participant.create({
    data: {
      user_id: adminUser.id,
      name: "Lead Admin Kunal",
      phone: "+91 9876543211",
      college: "VORTEXA University",
      course: "B.Tech Information Technology",
      year: "4th Year",
    },
  });

  // 5. Judge
  const judgeUser = await prisma.user.create({
    data: {
      email: "judge.alex@vortexa.io",
      password_hash: passwordHash,
      role: "JUDGE",
    },
  });
  const judgeParticipant = await prisma.participant.create({
    data: {
      user_id: judgeUser.id,
      name: "Dr. Alex Rivera",
      phone: "+91 9876543212",
      college: "MIT Tech Faculty",
      course: "Ph.D. Artificial Intelligence",
      year: "Faculty",
    },
  });
  const judgeProfile = await prisma.judge.create({
    data: {
      user_id: judgeUser.id,
      name: "Dr. Alex Rivera",
      expertise: "Distributed Systems, AI Agents & Cloud Security",
      bio: "Senior Principal Architect at Tech Corp & Adjunct Professor.",
    },
  });

  // 6. Volunteer
  const volunteerUser = await prisma.user.create({
    data: {
      email: "volunteer.sam@vortexa.io",
      password_hash: passwordHash,
      role: "VOLUNTEER",
    },
  });
  await prisma.participant.create({
    data: {
      user_id: volunteerUser.id,
      name: "Sam Volunteer",
      phone: "+91 9876543213",
      college: "VORTEXA Institute",
      course: "B.Tech Electronics",
      year: "2nd Year",
    },
  });

  // 7. Team Leader
  const leaderUser = await prisma.user.create({
    data: {
      email: "leader.kunal@vortexa.io",
      password_hash: passwordHash,
      role: "TEAM_LEADER",
    },
  });
  const leaderPart = await prisma.participant.create({
    data: {
      user_id: leaderUser.id,
      name: "Kunal Leader",
      phone: "+91 9876543214",
      college: "PICT College of Engineering",
      course: "B.Tech Computer Engineering",
      year: "3rd Year",
    },
  });

  // 8. Team Member
  const memberUser = await prisma.user.create({
    data: {
      email: "member.sarah@vortexa.io",
      password_hash: passwordHash,
      role: "PARTICIPANT",
    },
  });
  const memberPart = await prisma.participant.create({
    data: {
      user_id: memberUser.id,
      name: "Sarah Chen",
      phone: "+91 9876543215",
      college: "COEP Tech University",
      course: "B.Tech Data Science",
      year: "3rd Year",
    },
  });

  // 9. Create Team
  const team = await prisma.team.create({
    data: {
      team_code: "VTX26-00421",
      team_name: "Code Titans",
      leader_id: leaderPart.id,
      status: "CONFIRMED",
    },
  });

  await prisma.teamMember.create({
    data: {
      team_id: team.id,
      participant_id: leaderPart.id,
      role: "LEADER",
    },
  });

  await prisma.teamMember.create({
    data: {
      team_id: team.id,
      participant_id: memberPart.id,
      role: "MEMBER",
    },
  });

  // 10. Verified Payment
  const payment = await prisma.payment.create({
    data: {
      team_id: team.id,
      submitted_by_id: leaderUser.id,
      payer_name: "Kunal Leader",
      upi_id: "kunal@okaxis",
      utr_number: "UTR987654321012",
      amount: 500,
      screenshot_url: "/uploads/payment_vtx26-00421.png",
      status: "VERIFIED",
      verified_at: new Date(),
      verified_by_id: adminUser.id,
    },
  });

  // 11. Ticket
  const ticket = await prisma.ticket.create({
    data: {
      ticket_code: "VTX-TICK-98745210",
      team_id: team.id,
      status: "ACTIVE",
      qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VTX-TICK-98745210",
    },
  });

  // 12. Rooms
  const room1 = await prisma.room.create({
    data: {
      room_name: "A-102",
      building: "Main Tech Block",
      floor: "1st Floor",
      capacity: 4,
      description: "Air-Conditioned Lab with Gigabit Ethernet & Power Outlets",
      status: "OCCUPIED",
    },
  });

  await prisma.room.create({
    data: {
      room_name: "B-204",
      building: "Innovation Hub",
      floor: "2nd Floor",
      capacity: 6,
      description: "High-performance AI workstation lab",
      status: "AVAILABLE",
    },
  });

  // 13. Room Allocation
  await prisma.roomAllocation.create({
    data: {
      team_id: team.id,
      room_id: room1.id,
      allocated_by: "Lead Admin Kunal",
    },
  });

  // 14. Problem Statements
  await prisma.problemStatement.createMany({
    data: [
      {
        title: "Track 1: Autonomous AI Agents for Real-Time Emergency Response",
        description: "Develop an multi-agent AI framework that ingests live disaster signals, automatically parses emergency calls, and optimizes fleet routing for rescue teams.",
        category: "Artificial Intelligence",
        difficulty: "Hard",
        rules: "Must utilize open datasets and provide interactive dashboard.",
        resources: "API keys available at desk. OpenStreetMap & FEMA datasets.",
        is_published: true,
        created_by: adminUser.id,
      },
      {
        title: "Track 2: Decentralized Identity & Verifiable Credentials",
        description: "Build a zero-knowledge credential verification system for educational institutions and hackathon certificates.",
        category: "Blockchain & Security",
        difficulty: "Medium",
        rules: "Zero-knowledge proof validation required.",
        resources: "Polygon ID & IPFS gateway docs.",
        is_published: true,
        created_by: adminUser.id,
      },
      {
        title: "Track 3: Smart Campus Energy Optimization Engine",
        description: "Create an IoT & machine learning engine to predict campus power surges and automate HVAC load shed operations.",
        category: "IoT & Sustainability",
        difficulty: "Medium",
        rules: "Simulated sensor stream required.",
        resources: "Sample MQTT payload generator provided.",
        is_published: true,
        created_by: adminUser.id,
      },
    ],
  });

  // 15. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "🚀 Welcome to VORTEXA 2026!",
        message: "Registration is officially open! Form your teams (2-4 members) and complete your payment verification early to secure fast-track check-in.",
        priority: "IMPORTANT",
        target_audience: "ALL",
        is_published: true,
        created_by: adminUser.id,
      },
    ],
  });

  // 16. Judging Criteria
  const criteria1 = await prisma.judgingCriteria.create({
    data: { name: "Innovation & Originality", description: "Novelty of concept and creative problem-solving.", max_score: 20, weight: 1.0 },
  });
  const criteria2 = await prisma.judgingCriteria.create({
    data: { name: "Technical Complexity", description: "Architecture elegance, code quality, and robustness.", max_score: 25, weight: 1.0 },
  });
  const criteria3 = await prisma.judgingCriteria.create({
    data: { name: "Impact & Practical Utility", description: "Real-world market relevance and scalability.", max_score: 20, weight: 1.0 },
  });
  const criteria4 = await prisma.judgingCriteria.create({
    data: { name: "UI / UX Design", description: "Polished aesthetics, intuitive workflow, and accessibility.", max_score: 15, weight: 1.0 },
  });
  const criteria5 = await prisma.judgingCriteria.create({
    data: { name: "Presentation & Demo", description: "Clarity of pitch, live demonstration, and Q&A defense.", max_score: 20, weight: 1.0 },
  });

  // 17. Judge Assignment
  await prisma.judgeAssignment.create({
    data: {
      judge_id: judgeProfile.id,
      team_id: team.id,
    },
  });

  // 18. Sample Submission
  const submission = await prisma.submission.create({
    data: {
      team_id: team.id,
      project_title: "VORTEXA AI Rescue Core",
      description: "Real-time emergency dispatching agent network built with Next.js, FastAPI, PyTorch, and WebSockets.",
      tech_stack: "Next.js, TypeScript, Python, PyTorch, Tailwind CSS, PostgreSQL",
      github_url: "https://github.com/vortexa-titans/rescue-core",
      demo_url: "https://vortexa-rescue.demo.app",
      youtube_url: "https://youtube.com/watch?v=demo123",
      google_drive_url: "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view",
      video_url: "https://youtube.com/watch?v=demo123",
      status: "SUBMITTED",
    },
  });

  // 19. Sample Scores
  await prisma.score.createMany({
    data: [
      { judge_id: judgeProfile.id, submission_id: submission.id, criteria_id: criteria1.id, score_value: 19, comments: "Exceptional concept and real-time processing." },
      { judge_id: judgeProfile.id, submission_id: submission.id, criteria_id: criteria2.id, score_value: 24, comments: "Clean architecture and modular multi-agent structure." },
      { judge_id: judgeProfile.id, submission_id: submission.id, criteria_id: criteria3.id, score_value: 18, comments: "Very practical for municipal emergency services." },
      { judge_id: judgeProfile.id, submission_id: submission.id, criteria_id: criteria4.id, score_value: 14, comments: "Great dark glass visual design, fast response." },
      { judge_id: judgeProfile.id, submission_id: submission.id, criteria_id: criteria5.id, score_value: 19, comments: "Confident presentation and crisp demo." },
    ],
  });

  // 20. Sample Audit Log
  await prisma.auditLog.create({
    data: {
      actor_id: adminUser.id,
      actor_email: "admin@vortexa.io",
      action: "PAYMENT_VERIFIED",
      entity: "Payment",
      entity_id: payment.id,
      details: "Payment UTR987654321012 verified for Team Code Titans (VTX26-00421).",
    },
  });

  console.log("\n🎉 VORTEXA Database successfully seeded!");
  console.log("------------------------------------------------");
  console.log("Super Admin  : superadmin@vortexa.io  / password123");
  console.log("Admin        : admin@vortexa.io       / password123");
  console.log("Judge        : judge.alex@vortexa.io  / password123");
  console.log("Volunteer    : volunteer.sam@vortexa.io / password123");
  console.log("Team Leader  : leader.kunal@vortexa.io / password123 (Team: VTX26-00421)");
  console.log("Participant  : member.sarah@vortexa.io / password123");
  console.log("------------------------------------------------\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
