import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
      },
    });
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Username or email address already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.messages });
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    // pengecekan jika user tidak ada / tidak ditemukan
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare hash password yang ada di database dengan inputan password yang diberikan user
    const isMatch = await bcrypt.compare(password, user.password);
    // jika password tidak sama maka akan mengembalikan status 400
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // membuat token JWT dari id user dengan kunci rahasia JWT yang diberikan di file .env
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    // jika pengecekan dari kode diatas tidak ada yang true maka kode dibawah ini akan di eksekusi
    res.json({ message: "Logged in successfully", token });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  res.json({ message: "This is your profile data!", user: (req as any).user });
};
