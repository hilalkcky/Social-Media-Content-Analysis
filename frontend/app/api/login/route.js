import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sql from "mssql";
import { poolPromise } from "@/lib/db";

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query(`
        SELECT kullanıcıid, kullanıcıadı, sifre, isadmin
        FROM [dbo].[Kullanıcı]
        WHERE kullanıcıadı = @username
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const user = result.recordset[0];

    const isValid = await bcrypt.compare(password, user.sifre);

    if (!isValid) {
      return NextResponse.json(
        { error: "Hatalı şifre" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET tanımlı değil");
    }

    const token = jwt.sign(
      {
        id: user.kullanıcıid,
        username: user.kullanıcıadı,
        isadmin: user.isadmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json({
      message: "Giriş başarılı",
      user: {
        id: user.kullanıcıid,
        username: user.kullanıcıadı,
        isadmin: user.isadmin,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
      sameSite: "strict",
      secure: false,
    });

    return response;

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server hatası" },
      { status: 500 }
    );
  }
}