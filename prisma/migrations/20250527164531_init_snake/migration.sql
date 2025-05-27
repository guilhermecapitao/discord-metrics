-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MESSAGE_CREATE', 'MESSAGE_DELETE', 'REACTION_ADD', 'REACTION_REMOVE', 'MEMBER_JOIN', 'MEMBER_LEAVE', 'VOICE_JOIN', 'VOICE_LEAVE');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'PRO', 'LIFETIME');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateTable
CREATE TABLE "guild" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGINT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_member" (
    "id" SERIAL NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "guild_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_event" (
    "id" BIGSERIAL NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "type" "EventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_metric" (
    "id" SERIAL NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "messages" INTEGER NOT NULL,
    "joins" INTEGER NOT NULL,
    "leaves" INTEGER NOT NULL,
    "active_users" INTEGER NOT NULL,

    CONSTRAINT "daily_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guild_member_guild_id_user_id_key" ON "guild_member"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "raw_event_guild_id_idx" ON "raw_event"("guild_id");

-- CreateIndex
CREATE INDEX "raw_event_created_at_idx" ON "raw_event"("created_at");

-- CreateIndex
CREATE INDEX "daily_metric_date_idx" ON "daily_metric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_metric_guild_id_date_key" ON "daily_metric"("guild_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_guild_id_key" ON "subscription"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripe_subscription_id_key" ON "subscription"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "guild_member" ADD CONSTRAINT "guild_member_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_member" ADD CONSTRAINT "guild_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_event" ADD CONSTRAINT "raw_event_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_event" ADD CONSTRAINT "raw_event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_metric" ADD CONSTRAINT "daily_metric_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
