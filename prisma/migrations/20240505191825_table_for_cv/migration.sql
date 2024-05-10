-- CreateTable
CREATE TABLE "cv" (
    "id" SERIAL NOT NULL,
    "cv_data" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "cv_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cv" ADD CONSTRAINT "cv_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
