import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin role required", 403);
    }

    const { batchId, records } = await req.json();

    if (!records || !Array.isArray(records)) {
      return apiError("Invalid payload", 400);
    }

    const summary = {
      created: 0,
      updated: 0,
      skipped: 0,
      rejected: 0,
      errors: [] as { row: number; error: string }[],
    };

    const batch = batchId || `BATCH-${Date.now()}`;

    // Process each team sequentially to avoid race conditions with user creation
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        // Validate required fields
        if (!record.teamName || !record.members || !Array.isArray(record.members) || record.members.length === 0) {
          throw new Error("Missing team name or members");
        }

        const leader = record.members.find((m: any) => m.role === "LEADER") || record.members[0];
        if (!leader.email || !leader.name) {
          throw new Error("Leader missing email or name");
        }

        // Check for duplicates by externalTeamId if provided
        if (record.externalTeamId) {
          const existingTeam = await db.team.findFirst({
            where: {
              members: {
                some: {
                  participant: {
                    external_registration_id: record.externalTeamId
                  }
                }
              }
            }
          });
          
          if (existingTeam) {
            summary.skipped++;
            continue;
          }
        }

        // Start a transaction for this team import
        await db.$transaction(async (tx) => {
          // Create users & participants
          const createdMembers = [];
          for (const member of record.members) {
            if (!member.email || !member.name) {
              throw new Error(`Member missing email or name`);
            }

            // Check if user already exists
            let user = await tx.user.findUnique({ where: { email: member.email.toLowerCase() } });
            
            if (!user) {
              // Create user with impossible password and inactive status
              const randomHash = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
              user = await tx.user.create({
                data: {
                  email: member.email.toLowerCase(),
                  name: member.name,
                  password_hash: randomHash,
                  role: "PARTICIPANT",
                  is_active: false,
                }
              });
            }

            // Check if participant already exists
            let participant = await tx.participant.findUnique({ where: { user_id: user.id } });
            if (!participant) {
              participant = await tx.participant.create({
                data: {
                  user_id: user.id,
                  name: member.name,
                  phone: member.phone || "N/A",
                  college: member.college || "N/A",
                  course: member.course || "N/A",
                  year: member.year || "N/A",
                  registration_source: "IMPORTED",
                  external_registration_id: record.externalTeamId || null,
                  import_batch_id: batch,
                }
              });
            }

            createdMembers.push({
              participant_id: participant.id,
              user_id: user.id,
              role: member.role === "LEADER" ? "LEADER" : "MEMBER",
              email: user.email
            });
          }

          // Generate Team Code
          const count = await tx.team.count();
          const nextNum = (count + 1).toString().padStart(5, "0");
          const teamCode = `VTX26-${nextNum}`;

          // Identify Leader ID
          const leaderData = createdMembers.find(m => m.role === "LEADER") || createdMembers[0];
          const leaderId = leaderData.participant_id;

          // Create Team
          const team = await tx.team.create({
            data: {
              team_code: teamCode,
              team_name: record.teamName,
              leader_id: leaderId,
              status: record.paymentStatus === "VERIFIED" ? "CONFIRMED" : "PENDING",
            }
          });

          // Create Team Members
          for (const m of createdMembers) {
            await tx.teamMember.create({
              data: {
                team_id: team.id,
                participant_id: m.participant_id,
                role: m.role,
              }
            });
          }

          // Create Payment if Verified
          if (record.paymentStatus === "VERIFIED") {
            await tx.payment.create({
              data: {
                team_id: team.id,
                submitted_by_id: leaderData.user_id,
                payer_name: leaderData.email,
                upi_id: "IMPORTED",
                utr_number: `IMPORT-${team.id.slice(0,8)}`,
                amount: record.paymentAmount || 625,
                screenshot_url: "IMPORTED",
                status: "VERIFIED",
                verified_at: new Date(),
                verified_by_id: session?.userId || null,
              }
            });

            // Also create Ticket automatically
            await tx.ticket.create({
              data: {
                ticket_code: `TKT-${teamCode}`,
                team_id: team.id,
                status: "ACTIVE",
              }
            });
          }

          summary.created++;
        }, {
          timeout: 10000,
        });

      } catch (err: any) {
        summary.rejected++;
        summary.errors.push({ row: i + 1, error: err.message || "Unknown error" });
      }
    }

    return apiResponse(true, summary);
  } catch (error: any) {
    return apiError(error.message || "Failed to process import", 500);
  }
}
