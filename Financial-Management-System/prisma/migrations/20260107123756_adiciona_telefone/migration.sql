/*
  Warnings:

  - You are about to drop the column `category` on the `Shopping` table. All the data in the column will be lost.
  - You are about to drop the column `Telefone` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shopping" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Telefone",
ADD COLUMN     "telefone" TEXT;
