/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Video` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[publicId]` on the table `Video` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `originalSize` on the `Video` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `compressedSize` on the `Video` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Video" DROP COLUMN "updatedAt",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "originalSize",
ADD COLUMN     "originalSize" INTEGER NOT NULL,
DROP COLUMN "compressedSize",
ADD COLUMN     "compressedSize" INTEGER NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Video_publicId_key" ON "public"."Video"("publicId");
