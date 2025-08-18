CREATE TABLE IF NOT EXISTS "AiAgent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid NOT NULL,
	"key" varchar(50) NOT NULL,
	"displayName" varchar(100) NOT NULL,
	"role" varchar(50) DEFAULT 'assistant' NOT NULL,
	"model" varchar(50) DEFAULT 'chat-model' NOT NULL,
	"systemPrompt" text,
	"color" varchar(7) DEFAULT '#3B82F6',
	"isEnabled" boolean DEFAULT true NOT NULL,
	"tools" json DEFAULT '[]'::json,
	"maxTokens" varchar(10) DEFAULT '2000',
	"temperature" varchar(5) DEFAULT '0.7',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AiAgent_ownerId_key_unique" UNIQUE("ownerId","key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AiGroup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid NOT NULL,
	"key" varchar(50) NOT NULL,
	"displayName" varchar(100) NOT NULL,
	"description" text,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AiGroup_ownerId_key_unique" UNIQUE("ownerId","key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AiGroupAgent" (
	"groupId" uuid NOT NULL,
	"agentId" uuid NOT NULL,
	"localEnabled" boolean DEFAULT true NOT NULL,
	"addedAt" timestamp DEFAULT now() NOT NULL,
	"addedBy" uuid NOT NULL,
	CONSTRAINT "AiGroupAgent_groupId_agentId_pk" PRIMARY KEY("groupId","agentId")
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "groupId" uuid;--> statement-breakpoint
ALTER TABLE "Message_v2" ADD COLUMN "groupId" uuid;--> statement-breakpoint
ALTER TABLE "Message_v2" ADD COLUMN "authorType" varchar DEFAULT 'assistant';--> statement-breakpoint
ALTER TABLE "Message_v2" ADD COLUMN "agentMetadata" json;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AiGroup" ADD CONSTRAINT "AiGroup_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AiGroupAgent" ADD CONSTRAINT "AiGroupAgent_groupId_AiGroup_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."AiGroup"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AiGroupAgent" ADD CONSTRAINT "AiGroupAgent_agentId_AiAgent_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."AiAgent"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AiGroupAgent" ADD CONSTRAINT "AiGroupAgent_addedBy_User_id_fk" FOREIGN KEY ("addedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_groupId_AiGroup_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."AiGroup"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message_v2" ADD CONSTRAINT "Message_v2_groupId_AiGroup_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."AiGroup"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
