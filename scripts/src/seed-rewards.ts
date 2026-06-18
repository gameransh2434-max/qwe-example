import { db, categoriesTable, rewardsTable } from "@workspace/db";

const categories = [
  { name: "Discord", slug: "discord", icon: "💬", description: "Discord server growth rewards", order: 1 },
  { name: "Invite Rewards", slug: "invite-rewards", icon: "🎁", description: "Earn rewards by inviting members", order: 2 },
  { name: "Invite Rewards V2", slug: "invite-rewards-v2", icon: "🎯", description: "Premium invite rewards", order: 3 },
  { name: "Instagram", slug: "instagram", icon: "📸", description: "Instagram growth rewards", order: 4 },
  { name: "TikTok", slug: "tiktok", icon: "🎵", description: "TikTok growth rewards", order: 5 },
  { name: "Telegram", slug: "telegram", icon: "✈️", description: "Telegram channel rewards", order: 6 },
  { name: "YouTube", slug: "youtube", icon: "▶️", description: "YouTube channel rewards", order: 7 },
  { name: "Roblox", slug: "roblox", icon: "🎮", description: "Roblox rewards", order: 8 },
  { name: "Minecraft Server", slug: "minecraft", icon: "⛏️", description: "Minecraft server hosting rewards", order: 9 },
  { name: "Nitro Event", slug: "nitro-event", icon: "⚡", description: "Discord Nitro event rewards", order: 10 },
  { name: "Logos & Avatars", slug: "logos", icon: "🎨", description: "Custom logo and avatar rewards", order: 11 },
];

const rewardsByCategory: Record<string, Array<{
  title: string;
  description: string;
  requirement: string;
  requirementValue?: number;
  rewardValue: string;
  isFeatured?: boolean;
}>> = {
  discord: [
    { title: "100 Members Offline", description: "Get 100 Discord server members offline", requirement: "100 members offline", requirementValue: 100, rewardValue: "1 Gmail", isFeatured: true },
    { title: "100 Members Online", description: "Get 100 Discord server members online simultaneously", requirement: "100 members online", requirementValue: 100, rewardValue: "3 Gmail", isFeatured: true },
    { title: "10 Real Members Joined", description: "Get 10 real verified members to join the server", requirement: "10 real members joined", requirementValue: 10, rewardValue: "1 Gmail" },
    { title: "1 Server Boost", description: "Boost the QWE Discord server", requirement: "1 server boost", requirementValue: 1, rewardValue: "3 Gmail", isFeatured: true },
  ],
  "invite-rewards": [
    { title: "CapCut Pro", description: "Get CapCut Pro access", requirement: "5 invites", requirementValue: 5, rewardValue: "CapCut Pro" },
    { title: "YouTube Premium", description: "Get YouTube Premium subscription", requirement: "5 invites", requirementValue: 5, rewardValue: "YouTube Premium", isFeatured: true },
    { title: "Cat VPN Premium", description: "Get Cat VPN Premium access", requirement: "5 invites", requirementValue: 5, rewardValue: "Cat VPN Premium" },
    { title: "Hypic Pro", description: "Get Hypic Pro photo editing app", requirement: "5 invites", requirementValue: 5, rewardValue: "Hypic Pro" },
    { title: "SnapTube Mod", description: "Get SnapTube Mod", requirement: "5 invites", requirementValue: 5, rewardValue: "SnapTube Mod" },
    { title: "YT Music", description: "Get YouTube Music subscription", requirement: "5 invites", requirementValue: 5, rewardValue: "YT Music" },
    { title: "Panda VPN Premium", description: "Get Panda VPN Premium access", requirement: "5 invites", requirementValue: 5, rewardValue: "Panda VPN Premium" },
    { title: "PicsArt Pro", description: "Get PicsArt Pro subscription", requirement: "5 invites", requirementValue: 5, rewardValue: "PicsArt Pro" },
    { title: "Clone App Lifetime VIP", description: "Get Clone App Lifetime VIP access", requirement: "5 invites", requirementValue: 5, rewardValue: "Clone App Lifetime VIP" },
    { title: "Spotify+", description: "Get Spotify+ subscription", requirement: "5 invites", requirementValue: 5, rewardValue: "Spotify+", isFeatured: true },
    { title: "Roblox 1000 Codes", description: "Get 1000 Roblox promo codes", requirement: "5 invites", requirementValue: 5, rewardValue: "Roblox 1000 Codes" },
    { title: "Renew VCC Method", description: "Get the Renew VCC Method guide", requirement: "5 invites", requirementValue: 5, rewardValue: "Renew VCC Method" },
    { title: "PeakGen", description: "Get PeakGen access", requirement: "5 invites", requirementValue: 5, rewardValue: "PeakGen" },
    { title: "Nitro Method", description: "Get the Nitro earning method", requirement: "5 invites", requirementValue: 5, rewardValue: "Nitro Method" },
    { title: "Owo Method", description: "Get the Owo bot method", requirement: "5 invites", requirementValue: 5, rewardValue: "Owo Method" },
    { title: "Spotify OP Method", description: "Get the Spotify OP Method guide", requirement: "5 invites", requirementValue: 5, rewardValue: "Spotify OP Method" },
    { title: "Robux Method", description: "Get the Robux earning method", requirement: "5 invites", requirementValue: 5, rewardValue: "Robux Method" },
    { title: "Nitro Generator", description: "Get a Nitro generator tool", requirement: "5 invites", requirementValue: 5, rewardValue: "Nitro Generator" },
    { title: "Owo Autoplay.py", description: "Get the Owo autoplay script", requirement: "5 invites", requirementValue: 5, rewardValue: "Owo Autoplay.py" },
  ],
  "invite-rewards-v2": [
    { title: "Avatar from Professional", description: "Get a custom avatar made by a professional designer", requirement: "5 invites", requirementValue: 5, rewardValue: "Professional Avatar", isFeatured: true },
    { title: "1000 TikTok Views", description: "Get 1000 TikTok views on your video", requirement: "5 invites", requirementValue: 5, rewardValue: "1000 TikTok Views", isFeatured: true },
    { title: "CapCut Pro V2", description: "Get CapCut Pro (V2 batch)", requirement: "5 invites", requirementValue: 5, rewardValue: "CapCut Pro" },
    { title: "200 Roblox Accounts", description: "Get 200 Roblox accounts", requirement: "5 invites", requirementValue: 5, rewardValue: "200 Roblox Accounts" },
    { title: "Foxify VPN Premium", description: "Get Foxify VPN Premium access", requirement: "5 invites", requirementValue: 5, rewardValue: "Foxify VPN Premium" },
    { title: "IP Tools Premium", description: "Get IP Tools Premium access", requirement: "5 invites", requirementValue: 5, rewardValue: "IP Tools Premium" },
    { title: "PicsArt Premium Gold", description: "Get PicsArt Premium Gold subscription", requirement: "5 invites", requirementValue: 5, rewardValue: "PicsArt Premium Gold" },
    { title: "YouTube Premium V2", description: "Get YouTube Premium (V2 batch)", requirement: "5 invites", requirementValue: 5, rewardValue: "YouTube Premium" },
    { title: "Telegram Premium", description: "Get Telegram Premium subscription", requirement: "5 invites", requirementValue: 5, rewardValue: "Telegram Premium", isFeatured: true },
    { title: "TikTok Views Method", description: "Get the TikTok Views boosting method guide", requirement: "10 invites", requirementValue: 10, rewardValue: "TikTok Views Method" },
    { title: "500 Roblox Accounts", description: "Get 500 Roblox accounts", requirement: "10 invites", requirementValue: 10, rewardValue: "500 Roblox Accounts" },
    { title: "1000 Roblox Accounts", description: "Get 1000 Roblox accounts", requirement: "15 invites", requirementValue: 15, rewardValue: "1000 Roblox Accounts" },
  ],
  instagram: [
    { title: "1K Instagram Views", description: "Get 1,000 views on your Instagram post", requirement: "1000 views", requirementValue: 1000, rewardValue: "1 Gmail" },
    { title: "5K Instagram Views", description: "Get 5,000 views on your Instagram post", requirement: "5000 views", requirementValue: 5000, rewardValue: "2 Gmail" },
    { title: "10K Instagram Views", description: "Get 10,000 views on your Instagram post", requirement: "10000 views", requirementValue: 10000, rewardValue: "3 Gmail", isFeatured: true },
    { title: "50K Instagram Views", description: "Get 50,000 views on your Instagram post", requirement: "50000 views", requirementValue: 50000, rewardValue: "7 Gmail" },
    { title: "100K Instagram Views", description: "Get 100,000 views on your Instagram post", requirement: "100000 views", requirementValue: 100000, rewardValue: "10 Gmail" },
    { title: "1K Instagram Likes", description: "Get 1,000 likes on your Instagram post", requirement: "1000 likes", requirementValue: 1000, rewardValue: "1 Gmail" },
    { title: "5K Instagram Likes", description: "Get 5,000 likes on your Instagram post", requirement: "5000 likes", requirementValue: 5000, rewardValue: "2 Gmail" },
    { title: "10K Instagram Likes", description: "Get 10,000 likes on your Instagram post", requirement: "10000 likes", requirementValue: 10000, rewardValue: "3 Gmail" },
    { title: "50K Instagram Likes", description: "Get 50,000 likes on your Instagram post", requirement: "50000 likes", requirementValue: 50000, rewardValue: "7 Gmail" },
    { title: "30K+ Instagram Likes", description: "Get 30,000+ likes on your Instagram post", requirement: "30000+ likes", requirementValue: 30000, rewardValue: "10 Gmail" },
    { title: "100 Instagram Followers", description: "Get 100 Instagram followers", requirement: "100 followers", requirementValue: 100, rewardValue: "2 Gmail" },
    { title: "500 Instagram Followers", description: "Get 500 Instagram followers", requirement: "500 followers", requirementValue: 500, rewardValue: "10 Gmail", isFeatured: true },
    { title: "1000 Instagram Followers", description: "Get 1,000 Instagram followers", requirement: "1000 followers", requirementValue: 1000, rewardValue: "16 Gmail" },
  ],
  tiktok: [
    { title: "1K TikTok Views", description: "Get 1,000 views on your TikTok video", requirement: "1000 views", requirementValue: 1000, rewardValue: "1 Gmail" },
    { title: "5K TikTok Views", description: "Get 5,000 views on your TikTok video", requirement: "5000 views", requirementValue: 5000, rewardValue: "3 Gmail" },
    { title: "10K TikTok Views", description: "Get 10,000 views on your TikTok video", requirement: "10000 views", requirementValue: 10000, rewardValue: "5 Gmail", isFeatured: true },
    { title: "20K TikTok Views", description: "Get 20,000 views on your TikTok video", requirement: "20000 views", requirementValue: 20000, rewardValue: "7 Gmail" },
    { title: "30K TikTok Views", description: "Get 30,000 views on your TikTok video", requirement: "30000 views", requirementValue: 30000, rewardValue: "10 Gmail" },
    { title: "1K TikTok Likes", description: "Get 1,000 likes on your TikTok video", requirement: "1000 likes", requirementValue: 1000, rewardValue: "1 Gmail" },
    { title: "5K TikTok Likes", description: "Get 5,000 likes on your TikTok video", requirement: "5000 likes", requirementValue: 5000, rewardValue: "3 Gmail" },
    { title: "10K TikTok Likes", description: "Get 10,000 likes on your TikTok video", requirement: "10000 likes", requirementValue: 10000, rewardValue: "5 Gmail" },
    { title: "20K TikTok Likes", description: "Get 20,000 likes on your TikTok video", requirement: "20000 likes", requirementValue: 20000, rewardValue: "7 Gmail" },
    { title: "30K TikTok Likes", description: "Get 30,000 likes on your TikTok video", requirement: "30000 likes", requirementValue: 30000, rewardValue: "10 Gmail" },
    { title: "100 TikTok Followers", description: "Get 100 TikTok followers", requirement: "100 followers", requirementValue: 100, rewardValue: "2 Gmail" },
    { title: "500 TikTok Followers", description: "Get 500 TikTok followers", requirement: "500 followers", requirementValue: 500, rewardValue: "10 Gmail", isFeatured: true },
    { title: "1000 TikTok Followers", description: "Get 1,000 TikTok followers", requirement: "1000 followers", requirementValue: 1000, rewardValue: "16 Gmail" },
  ],
  telegram: [
    { title: "13 Telegram Stars", description: "Send 13 Telegram Stars", requirement: "13 stars", requirementValue: 13, rewardValue: "2 Gmail" },
    { title: "21 Telegram Stars", description: "Send 21 Telegram Stars", requirement: "21 stars", requirementValue: 21, rewardValue: "3 Gmail" },
    { title: "50 Telegram Stars", description: "Send 50 Telegram Stars", requirement: "50 stars", requirementValue: 50, rewardValue: "6 Gmail", isFeatured: true },
    { title: "5K Telegram Followers", description: "Get 5,000 Telegram channel followers", requirement: "5000 followers", requirementValue: 5000, rewardValue: "1 Gmail" },
    { title: "30K Telegram Followers", description: "Get 30,000 Telegram channel followers", requirement: "30000 followers", requirementValue: 30000, rewardValue: "5 Gmail" },
  ],
  youtube: [
    { title: "100 YouTube Views", description: "Get 100 views on your YouTube video", requirement: "100 views", requirementValue: 100, rewardValue: "1 Gmail" },
    { title: "500 YouTube Views", description: "Get 500 views on your YouTube video", requirement: "500 views", requirementValue: 500, rewardValue: "5 Gmail" },
    { title: "1K YouTube Views", description: "Get 1,000 views on your YouTube video", requirement: "1000 views", requirementValue: 1000, rewardValue: "10 Gmail", isFeatured: true },
    { title: "100 YouTube Likes", description: "Get 100 likes on your YouTube video", requirement: "100 likes", requirementValue: 100, rewardValue: "2 Gmail" },
    { title: "2K YouTube Likes", description: "Get 2,000 likes on your YouTube video", requirement: "2000 likes", requirementValue: 2000, rewardValue: "15 Gmail" },
    { title: "5K YouTube Likes", description: "Get 5,000 likes on your YouTube video", requirement: "5000 likes", requirementValue: 5000, rewardValue: "40 Gmail", isFeatured: true },
    { title: "100 YouTube Subscribers", description: "Get 100 subscribers to your YouTube channel", requirement: "100 subscribers", requirementValue: 100, rewardValue: "5 Gmail" },
    { title: "YouTube Premium + Music", description: "Provide YouTube Premium + Music combo proof", requirement: "YouTube Premium + Music", rewardValue: "10 Gmail" },
  ],
  roblox: [
    { title: "Voice Chat Enabled", description: "Enable voice chat on your Roblox account and provide proof", requirement: "voice chat enabled", rewardValue: "2 Gmail" },
    { title: "All Promo Codes", description: "Redeem all available Roblox promo codes", requirement: "all promo codes redeemed", rewardValue: "2 Gmail" },
    { title: "Robux Method Renew", description: "Provide proof of Robux method renewal", requirement: "robux method renew", rewardValue: "2 Gmail" },
  ],
  minecraft: [
    { title: "Minecraft Server 10GB", description: "Earn a Minecraft server with 10GB RAM, 200% CPU, 50GB disk", requirement: "10 invites", requirementValue: 10, rewardValue: "RAM 10GB, CPU 200%, DISK 50GB", isFeatured: true },
    { title: "Minecraft Server 16GB", description: "Earn a Minecraft server with 16GB RAM, 240% CPU, 50GB disk", requirement: "16 invites", requirementValue: 16, rewardValue: "RAM 16GB, CPU 240%, DISK 50GB" },
    { title: "Minecraft Server 24GB", description: "Earn a Minecraft server with 24GB RAM, 300% CPU, 50GB disk", requirement: "25 invites", requirementValue: 25, rewardValue: "RAM 24GB, CPU 300%, DISK 50GB" },
  ],
  "nitro-event": [
    { title: "Nitro Decoration ($4.99)", description: "Get a Discord Nitro Decoration worth $4.99", requirement: "5 Gmail", requirementValue: 5, rewardValue: "Decoration ($4.99)", isFeatured: true },
    { title: "Boosted Nitro", description: "Get Boosted Discord Nitro", requirement: "10 Gmail", requirementValue: 10, rewardValue: "Boosted Nitro", isFeatured: true },
    { title: "Server Boost", description: "Get a Discord Server Boost", requirement: "3 Gmail", requirementValue: 3, rewardValue: "Server Boost" },
    { title: "Nitro Generator", description: "Get a Nitro Generator tool", requirement: "1 Gmail", requirementValue: 1, rewardValue: "Nitro Generator" },
    { title: "Nitro Promo", description: "Get a Nitro promotional code", requirement: "1 Gmail", requirementValue: 1, rewardValue: "Nitro Promo" },
  ],
  logos: [
    { title: "Custom Avatar", description: "Get a custom avatar made by QWE designers", requirement: "5 invites", requirementValue: 5, rewardValue: "Custom Avatar", isFeatured: true },
  ],
};

async function seed() {
  console.log("🌱 Seeding categories...");

  const insertedCategories: Record<string, number> = {};

  for (const cat of categories) {
    const existing = await db.select().from(categoriesTable).then(rows => rows.find(r => r.slug === cat.slug));
    if (existing) {
      insertedCategories[cat.slug] = existing.id;
      console.log(`  ⏭️  Category already exists: ${cat.name}`);
      continue;
    }
    const [inserted] = await db.insert(categoriesTable).values(cat).returning({ id: categoriesTable.id });
    insertedCategories[cat.slug] = inserted.id;
    console.log(`  ✅ Inserted category: ${cat.name}`);
  }

  console.log("\n🌱 Seeding rewards...");
  let total = 0;

  for (const [slug, rewards] of Object.entries(rewardsByCategory)) {
    const categoryId = insertedCategories[slug];
    if (!categoryId) {
      console.warn(`  ⚠️  No category found for slug: ${slug}`);
      continue;
    }
    for (const reward of rewards) {
      const existing = await db.select().from(rewardsTable).then(rows =>
        rows.find(r => r.title === reward.title && r.categoryId === categoryId)
      );
      if (existing) {
        console.log(`  ⏭️  Reward already exists: ${reward.title}`);
        continue;
      }
      await db.insert(rewardsTable).values({
        ...reward,
        categoryId,
        isFeatured: reward.isFeatured ?? false,
        isActive: true,
        claimCount: 0,
      });
      total++;
      console.log(`  ✅ ${reward.title}`);
    }
  }

  console.log(`\n✨ Done! Seeded ${total} rewards across ${categories.length} categories.`);
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
