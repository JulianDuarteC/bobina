-- CreateTable
CREATE TABLE "watched_items" (
    "user_id" UUID NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watched_items_pkey" PRIMARY KEY ("user_id","tmdb_id")
);

-- AddForeignKey
ALTER TABLE "watched_items" ADD CONSTRAINT "watched_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watched_items" ADD CONSTRAINT "watched_items_tmdb_id_fkey" FOREIGN KEY ("tmdb_id") REFERENCES "movies_cache"("tmdb_id") ON DELETE RESTRICT ON UPDATE CASCADE;
