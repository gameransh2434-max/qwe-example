import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gameransh2434@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gameransh2434@gmail.com";
const ADMIN_USERNAME = "admin";

async function seedAdmin() {
  console.log(`\n🔐 Seeding admin account: ${ADMIN_EMAIL}`);

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL)).limit(1);

  if (existing.length > 0) {
    if (existing[0].role === "admin") {
      console.log("✅ Admin account already exists — skipping.");
    } else {
      await db.update(usersTable)
        .set({ role: "admin", isVerified: true })
        .where(eq(usersTable.email, ADMIN_EMAIL));
      console.log("✅ Existing user promoted to admin.");
    }
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await db.insert(usersTable).values({
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    isVerified: true,
    discordUsername: null,
  });

  console.log("✅ Admin account created successfully!");
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Username: ${ADMIN_USERNAME}`);
  console.log(`   Role: admin`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Failed to seed admin:", err);
  process.exit(1);
});
