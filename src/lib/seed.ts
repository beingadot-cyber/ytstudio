import { db } from "@/db";
import { users, videos, videoAnalytics, dailyAnalytics, comments, revenue, settings } from "@/db/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

const VIDEO_DATA = [
  {
    title: "Master React in 2024 — Complete Beginner to Pro Guide",
    description: "In this comprehensive tutorial, we cover everything from React fundamentals to advanced patterns including hooks, context, and performance optimization. Perfect for both beginners and developers looking to level up their skills.",
    category: "Programming",
    tags: ["react", "javascript", "webdev", "frontend", "tutorial"],
    visibility: "public",
    status: "published",
    daysAgo: 85,
  },
  {
    title: "Node.js + PostgreSQL Full Stack App — Build from Scratch",
    description: "Build a complete full-stack application using Node.js, Express, and PostgreSQL. We cover database design, REST APIs, authentication, and deployment.",
    category: "Programming",
    tags: ["nodejs", "postgresql", "fullstack", "backend", "express"],
    visibility: "public",
    status: "published",
    daysAgo: 78,
  },
  {
    title: "TypeScript Deep Dive — Advanced Types & Generics Explained",
    description: "Unlock the full power of TypeScript with advanced type techniques. This video covers generics, conditional types, mapped types, and template literal types with real-world examples.",
    category: "Programming",
    tags: ["typescript", "javascript", "programming", "types"],
    visibility: "public",
    status: "published",
    daysAgo: 72,
  },
  {
    title: "Next.js 15 App Router — Everything You Need to Know",
    description: "Complete guide to the Next.js App Router including server components, server actions, streaming, and the latest features in Next.js 15.",
    category: "Programming",
    tags: ["nextjs", "react", "webdev", "appRouter"],
    visibility: "public",
    status: "published",
    daysAgo: 65,
  },
  {
    title: "CSS Grid vs Flexbox — When to Use Each (2024)",
    description: "A definitive comparison of CSS Grid and Flexbox. Learn when to use each layout system with practical examples and real UI patterns.",
    category: "Design",
    tags: ["css", "flexbox", "grid", "webdesign", "frontend"],
    visibility: "public",
    status: "published",
    daysAgo: 60,
  },
  {
    title: "System Design for Beginners — Design a URL Shortener",
    description: "Learn the fundamentals of system design by building a URL shortener from scratch. We cover scalability, databases, caching, and load balancing.",
    category: "System Design",
    tags: ["systemdesign", "architecture", "backend", "interview"],
    visibility: "public",
    status: "published",
    daysAgo: 55,
  },
  {
    title: "Docker & Kubernetes Crash Course for Developers",
    description: "Get started with containerization and orchestration. This crash course covers Docker fundamentals, container networking, and Kubernetes deployments.",
    category: "DevOps",
    tags: ["docker", "kubernetes", "devops", "containers"],
    visibility: "public",
    status: "published",
    daysAgo: 48,
  },
  {
    title: "GraphQL API Design — Best Practices & Real Examples",
    description: "Learn how to design robust GraphQL APIs. We cover schema design, resolvers, mutations, subscriptions, and performance optimization.",
    category: "Programming",
    tags: ["graphql", "api", "backend", "webdev"],
    visibility: "public",
    status: "published",
    daysAgo: 42,
  },
  {
    title: "Tailwind CSS Masterclass — Build Beautiful UIs Fast",
    description: "Master Tailwind CSS with this comprehensive course. From utility classes to custom configurations, plugins, and building production-ready UI components.",
    category: "Design",
    tags: ["tailwind", "css", "webdesign", "ui"],
    visibility: "public",
    status: "published",
    daysAgo: 38,
  },
  {
    title: "Redis Caching Strategies — Speed Up Your Applications 10x",
    description: "Learn advanced Redis caching strategies to dramatically improve your application performance. Covers cache invalidation, pub/sub, and distributed caching patterns.",
    category: "Programming",
    tags: ["redis", "caching", "performance", "backend"],
    visibility: "public",
    status: "published",
    daysAgo: 32,
  },
  {
    title: "AWS for Beginners — Deploy Your First App to the Cloud",
    description: "Step-by-step guide to deploying your first application on AWS. We cover EC2, S3, RDS, Lambda, and CloudFront with a hands-on project.",
    category: "Cloud",
    tags: ["aws", "cloud", "deployment", "devops"],
    visibility: "public",
    status: "published",
    daysAgo: 28,
  },
  {
    title: "The Art of Code Review — Writing Better Pull Requests",
    description: "Learn how to write effective code reviews and pull requests. Best practices for giving constructive feedback, reviewing for security, and maintaining code quality.",
    category: "Programming",
    tags: ["codereview", "bestpractices", "git", "teamwork"],
    visibility: "public",
    status: "published",
    daysAgo: 25,
  },
  {
    title: "Prisma ORM — The Complete Database Toolkit for TypeScript",
    description: "Master Prisma ORM for TypeScript applications. We cover schema design, migrations, querying, relations, and advanced Prisma Client features.",
    category: "Programming",
    tags: ["prisma", "orm", "typescript", "database"],
    visibility: "public",
    status: "published",
    daysAgo: 21,
  },
  {
    title: "Web Performance 2024 — Core Web Vitals Optimization",
    description: "Improve your website's Core Web Vitals scores. This video covers LCP, FID, CLS optimization techniques with real-world case studies.",
    category: "Performance",
    tags: ["performance", "webvitals", "seo", "optimization"],
    visibility: "public",
    status: "published",
    daysAgo: 18,
  },
  {
    title: "Microservices Architecture — From Monolith to Microservices",
    description: "Learn how to break down a monolithic application into microservices. Covers service discovery, API gateways, inter-service communication, and monitoring.",
    category: "Architecture",
    tags: ["microservices", "architecture", "backend", "systemdesign"],
    visibility: "public",
    status: "published",
    daysAgo: 14,
  },
  {
    title: "JavaScript Async/Await Mastery — Promises, Generators & More",
    description: "Deep dive into JavaScript asynchronous programming. Master Promises, async/await, generators, and error handling patterns for production code.",
    category: "Programming",
    tags: ["javascript", "async", "promises", "programming"],
    visibility: "public",
    status: "published",
    daysAgo: 11,
  },
  {
    title: "MongoDB vs PostgreSQL — Choosing the Right Database",
    description: "An in-depth comparison of MongoDB and PostgreSQL. When to use each, performance benchmarks, data modeling patterns, and real-world use cases.",
    category: "Database",
    tags: ["mongodb", "postgresql", "database", "comparison"],
    visibility: "public",
    status: "published",
    daysAgo: 8,
  },
  {
    title: "React Testing Library — Write Tests That Actually Matter",
    description: "Learn how to write meaningful tests for React applications using React Testing Library. Covers unit tests, integration tests, and testing best practices.",
    category: "Testing",
    tags: ["testing", "react", "jest", "frontend"],
    visibility: "public",
    status: "published",
    daysAgo: 5,
  },
  {
    title: "Secure Authentication with JWT & Refresh Tokens",
    description: "Build secure authentication systems using JWT and refresh tokens. Covers token rotation, revocation, secure storage, and protecting against common attacks.",
    category: "Security",
    tags: ["security", "jwt", "authentication", "backend"],
    visibility: "draft",
    status: "draft",
    daysAgo: 3,
  },
  {
    title: "Building Real-time Apps with WebSockets & Socket.io",
    description: "Create real-time features like live chat, notifications, and collaborative editing using WebSockets and Socket.io with React and Node.js.",
    category: "Programming",
    tags: ["websockets", "socketio", "realtime", "nodejs"],
    visibility: "scheduled",
    status: "scheduled",
    daysAgo: -2,
  },
];

const DEMO_COMMENTS = [
  "This is exactly what I needed! Thanks so much for the detailed explanation.",
  "Wow, I've been struggling with this concept for weeks and this finally made it click!",
  "Best tutorial I've seen on this topic. Clear, concise, and well-paced.",
  "Could you make a follow-up video on advanced topics? This was fantastic!",
  "I've watched this 3 times already. Every time I learn something new.",
  "Your teaching style is incredible. Please keep making these videos!",
  "Just finished implementing this in my project. Works perfectly!",
  "This should have way more views. Genuinely top-tier content.",
  "I was about to give up on this but your video saved me. Thank you!",
  "Finally a tutorial that doesn't skip the hard parts. Subscribed!",
  "The code examples are super helpful. Much better than the documentation.",
  "Been coding for 5 years and still learned something new today. Great job!",
  "Sharing this with my entire dev team. This is required watching.",
  "Your explanations are so clear. Wish my professors taught like this.",
  "Already applied this in my production app. Saved me hours of debugging!",
  "The part about performance optimization blew my mind. Never thought of it that way.",
  "Perfect timing! Was literally working on this exact problem today.",
  "Can you share the source code? Would love to reference it.",
  "This is why I love this channel. Always delivering quality content.",
  "Just passed my technical interview thanks to your videos. THANK YOU!",
];

const AUTHOR_NAMES = [
  "TechEnthusiast_Dev", "CodeNinja42", "JavaScriptJunkie", "ReactDeveloper",
  "BackendBeast", "FrontendWizard", "FullStackFred", "DevOpsGuru",
  "DatabaseDave", "CloudArchitect", "SecuritySam", "PerformancePete",
  "MobileMarco", "APIAlpha", "TypescriptTom", "GraphQLGrace",
  "NodeNinja", "CSSCrafter", "DockerDan", "KubernetesKate",
  "PrismaPatrick", "RedisRita", "AWSAlex", "TestingTina",
  "WebDevWala", "CodeWithKaran", "TechTalkIndia", "ProgrammerPriya",
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAnalyticsForVideo(videoIndex: number, daysAgo: number) {
  // Higher-indexed videos have more varied performance
  const isViral = videoIndex % 5 === 0;
  const isSteady = videoIndex % 3 === 0;

  const baseViews = isViral
    ? randomBetween(800_000, 2_500_000)
    : isSteady
    ? randomBetween(200_000, 600_000)
    : randomBetween(50_000, 300_000);

  const likeRate = randomBetween(4, 9) / 100;
  const commentRate = randomBetween(1, 4) / 1000;
  const avgDuration = randomBetween(180, 720); // 3–12 min
  const watchTime = Math.floor((baseViews * avgDuration) / 60); // minutes
  const rpm = randomBetween(80, 280); // INR per 1000 views
  const totalRevenue = (baseViews / 1000) * rpm;
  const subscribersGained = Math.floor(baseViews * randomBetween(5, 25) / 10000);

  return {
    views: baseViews,
    likes: Math.floor(baseViews * likeRate),
    comments: Math.floor(baseViews * commentRate),
    watchTime,
    averageViewDuration: avgDuration,
    subscribersGained,
    revenue: Math.round(totalRevenue),
    daysAgo,
  };
}

function generateDailyData(totalAnalytics: {
  views: number; likes: number; comments: number;
  watchTime: number; revenue: number; subscribersGained: number;
}, daysAgo: number, totalDays: number) {
  const days: Array<{
    date: string; views: number; likes: number; comments: number;
    watchTime: number; revenue: number; subscribersGained: number;
  }> = [];

  let remainingViews = totalAnalytics.views;
  let remainingLikes = totalAnalytics.likes;
  let remainingComments = totalAnalytics.comments;
  let remainingWatchTime = totalAnalytics.watchTime;
  let remainingRevenue = totalAnalytics.revenue;
  let remainingSubs = totalAnalytics.subscribersGained;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (daysAgo - i));
    const dateStr = date.toISOString().split("T")[0];

    const isLast = i === totalDays - 1;
    if (isLast) {
      days.push({
        date: dateStr,
        views: Math.max(0, remainingViews),
        likes: Math.max(0, remainingLikes),
        comments: Math.max(0, remainingComments),
        watchTime: Math.max(0, remainingWatchTime),
        revenue: Math.max(0, remainingRevenue),
        subscribersGained: Math.max(0, remainingSubs),
      });
    } else {
      // Weight towards early days (upload bump), then decay
      const dayFraction = i / totalDays;
      const weight = dayFraction < 0.1
        ? randomBetween(40, 80) / 1000 // viral burst first 10%
        : randomBetween(5, 25) / 1000;

      const dayViews = Math.floor(totalAnalytics.views * weight);
      const dayLikes = Math.floor(totalAnalytics.likes * weight);
      const dayComments = Math.floor(totalAnalytics.comments * weight);
      const dayWatchTime = Math.floor(totalAnalytics.watchTime * weight);
      const dayRevenue = totalAnalytics.revenue * weight;
      const daySubs = Math.floor(totalAnalytics.subscribersGained * weight);

      remainingViews -= dayViews;
      remainingLikes -= dayLikes;
      remainingComments -= dayComments;
      remainingWatchTime -= dayWatchTime;
      remainingRevenue -= dayRevenue;
      remainingSubs -= daySubs;

      days.push({
        date: dateStr,
        views: Math.max(0, dayViews),
        likes: Math.max(0, dayLikes),
        comments: Math.max(0, dayComments),
        watchTime: Math.max(0, dayWatchTime),
        revenue: Math.max(0, Math.round(dayRevenue)),
        subscribersGained: Math.max(0, daySubs),
      });
    }
  }

  return days;
}

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const existingUsers = await db.select().from(users).limit(1);
  let adminUserId: number;

  if (existingUsers.length === 0) {
    const passwordHash = await hashPassword("Admin@123");
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      email: "admin@creatorstudio.demo",
      passwordHash,
      displayName: "Studio Admin",
      channelName: "Creator Studio Demo",
      channelDescription: "Your all-in-one creator analytics dashboard for managing videos, tracking fictional analytics, and growing your fictional channel.",
      currency: "INR",
      role: "admin",
    }).returning();
    adminUserId = adminUser.id;
    console.log("✅ Admin user created (admin / Admin@123)");
  } else {
    adminUserId = existingUsers[0].id;
    console.log("✅ Admin user already exists");
  }

  // Check if videos already exist
  const existingVideos = await db.select().from(videos).limit(1);
  if (existingVideos.length > 0) {
    console.log("✅ Data already seeded, skipping...");
    return;
  }

  // Thumbnail placeholder URLs (using picsum-style placeholders with consistent seeds)
  const thumbnailUrls = VIDEO_DATA.map((_, i) =>
    `/api/placeholder-thumb/${i + 1}`
  );

  // Insert videos
  console.log("📹 Inserting videos...");
  for (let i = 0; i < VIDEO_DATA.length; i++) {
    const vd = VIDEO_DATA[i];
    const uploadDate = new Date();
    uploadDate.setDate(uploadDate.getDate() - vd.daysAgo);

    const [video] = await db.insert(videos).values({
      title: vd.title,
      description: vd.description,
      thumbnailUrl: thumbnailUrls[i],
      videoUrl: `https://example.com/videos/${i + 1}`,
      category: vd.category,
      tags: vd.tags,
      visibility: vd.visibility,
      status: vd.status,
      uploadDate,
    }).returning();

    // Generate analytics
    const analytics = generateAnalyticsForVideo(i, vd.daysAgo);

    await db.insert(videoAnalytics).values({
      videoId: video.id,
      views: analytics.views,
      likes: analytics.likes,
      comments: analytics.comments,
      watchTime: analytics.watchTime,
      averageViewDuration: analytics.averageViewDuration,
      subscribersGained: analytics.subscribersGained,
      revenue: analytics.revenue,
    });

    // Generate daily analytics
    const totalDays = Math.max(1, vd.daysAgo);
    const dailyData = generateDailyData(
      {
        views: analytics.views,
        likes: analytics.likes,
        comments: analytics.comments,
        watchTime: analytics.watchTime,
        revenue: analytics.revenue,
        subscribersGained: analytics.subscribersGained,
      },
      Math.max(1, vd.daysAgo),
      totalDays
    );

    if (dailyData.length > 0) {
      await db.insert(dailyAnalytics).values(
        dailyData.map((d) => ({
          videoId: video.id,
          date: d.date,
          views: d.views,
          likes: d.likes,
          comments: d.comments,
          watchTime: d.watchTime,
          revenue: d.revenue,
          subscribersGained: d.subscribersGained,
        }))
      );
    }

    // Generate revenue records
    const revenueData = dailyData.filter((d) => d.revenue > 0).map((d) => ({
      videoId: video.id,
      date: d.date,
      amount: d.revenue,
      source: "ads" as const,
    }));

    if (revenueData.length > 0) {
      await db.insert(revenue).values(revenueData);
    }

    // Generate comments
    const numComments = Math.min(analytics.comments, randomBetween(8, 25));
    const commentData = [];
    for (let c = 0; c < numComments; c++) {
      const commentDate = new Date(uploadDate);
      commentDate.setDate(commentDate.getDate() + randomBetween(0, Math.min(vd.daysAgo, 60)));
      commentData.push({
        videoId: video.id,
        author: AUTHOR_NAMES[randomBetween(0, AUTHOR_NAMES.length - 1)],
        text: DEMO_COMMENTS[randomBetween(0, DEMO_COMMENTS.length - 1)],
        likes: randomBetween(0, 2500),
        status: Math.random() > 0.1 ? "published" : "hidden",
        isDemo: true,
        createdAt: commentDate,
      });
    }
    if (commentData.length > 0) {
      await db.insert(comments).values(commentData);
    }
  }

  // Settings
  await db.insert(settings).values([
    { key: "total_subscribers", value: "248000" },
    { key: "channel_started", value: "2021-03-15" },
    { key: "seed_version", value: "1.0" },
  ]).onConflictDoNothing();

  console.log("✅ Database seeded successfully!");
}
