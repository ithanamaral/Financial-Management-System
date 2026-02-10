/*
  Warnings:

  - Added the required column `status` to the `Shopping` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store` to the `Shopping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shopping" ADD COLUMN     "category" TEXT,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "store" TEXT NOT NULL;
