import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning testing data...');
  
  try {
    // Delete related records first
    console.log('Deleting Audit Logs & Notifications...');
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    
    console.log('Deleting Payments, Tickets, Check-ins...');
    await prisma.payment.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.checkIn.deleteMany({});
    await prisma.roomAllocation.deleteMany({});
    
    console.log('Deleting Submissions & Results...');
    await prisma.judgeAssignment.deleteMany({});
    await prisma.submission.deleteMany({});
    await prisma.result.deleteMany({});
    await prisma.certificate.deleteMany({});
    
    console.log('Deleting Teams & Members...');
    await prisma.teamMember.deleteMany({});
    await prisma.team.deleteMany({});
    
    console.log('Deleting Participants...');
    await prisma.participant.deleteMany({});
    
    // We optionally delete non-admin users so the admins remain untouched
    console.log('Deleting non-admin User accounts...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          notIn: ["ADMIN", "SUPER_ADMIN"]
        }
      }
    });
    console.log(`Deleted ${deletedUsers.count} testing user accounts.`);

    console.log('✅ All testing data successfully wiped! The database is clean.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
