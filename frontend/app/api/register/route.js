import { poolPromise } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { username, email, password } = await req.json(); 

  try {
    const pool = await poolPromise;

    const check = await pool.request()
      .input("username", username)
      .input("email", email)
      .query(`
        SELECT kullanıcıid 
        FROM [dbo].[Kullanıcı] 
        WHERE kullanıcıadı = @username OR email = @email
      `);

    if (check.recordset.length > 0) {
      return Response.json(
        { error: "Bu kullanıcı adı veya email zaten var" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
  .input("username", username)
  .input("email", email)
  .input("password", hashedPassword)
  .query(`
    INSERT INTO [dbo].[Kullanıcı]
    (kullanıcıadı, email, sifre, isadmin, GirisTarihi)
    VALUES (@username, @email, @password, 0, GETDATE())
  `);

    return Response.json({ success: true });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}