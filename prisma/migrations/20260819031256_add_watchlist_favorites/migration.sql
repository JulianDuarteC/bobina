-- CreateTable
CREATE TABLE "watchlist_items" (
    "user_id" UUID NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("user_id","tmdb_id")
);

-- CreateTable
CREATE TABLE "favorite_movies" (
    "user_id" UUID NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "favorite_movies_pkey" PRIMARY KEY ("user_id","tmdb_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_movies_user_id_position_key" ON "favorite_movies"("user_id", "position");

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_tmdb_id_fkey" FOREIGN KEY ("tmdb_id") REFERENCES "movies_cache"("tmdb_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_movies" ADD CONSTRAINT "favorite_movies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_movies" ADD CONSTRAINT "favorite_movies_tmdb_id_fkey" FOREIGN KEY ("tmdb_id") REFERENCES "movies_cache"("tmdb_id") ON DELETE RESTRICT ON UPDATE CASCADE;
