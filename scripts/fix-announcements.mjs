import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing announcements in database...');
  
  try {
    // Delete the WiFi announcement
    const deleted = await prisma.announcement.deleteMany({
      where: {
        title: {
          contains: "WiFi & Network Credentials Released"
        }
      }
    });
    console.log(`Deleted ${deleted.count} WiFi announcement(s).`);

    // Update the Welcome announcement
    const updated = await prisma.announcement.updateMany({
      where: {
        title: {
          contains: "Welcome to VORTEXA 2026!"
        }
      },
      data: {
        message: "Registration is officially open! Form your teams (2-4 members) and complete your payment verification early to secure fast-track check-in."
      }
    });
    console.log(`Updated ${updated.count} Welcome announcement(s).`);
    
    console.log('Database fix complete!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
