/*
  Warnings:

  - The primary key for the `applicants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `applicants` table. All the data in the column will be lost.
  - Added the required column `cv_id` to the `applicants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "applicants" DROP CONSTRAINT "applicants_user_id_fkey";

-- AlterTable
ALTER TABLE "applicants" DROP CONSTRAINT "applicants_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "cv_id" INTEGER NOT NULL,
ADD CONSTRAINT "applicants_pkey" PRIMARY KEY ("cv_id", "job_id");

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "cv"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
