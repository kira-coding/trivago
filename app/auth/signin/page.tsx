export const runtime = 'nodejs';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth"; // from your auth.js setup

// --- SERVER ACTIONS ---
async function registerUser(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const userCount = await prisma.user.count();
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashed,
            name,
            role: userCount === 0 ? "ADMIN" : "USER",
        },
    });

    // Immediately sign in new user
    await signIn("credentials", { email, password, redirect: false });

    redirect("/"); // send them home
}

async function loginUser(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn("credentials", { email, password, redirect: true, redirectTo: "/" });
}

// --- PAGE ---
export default async function SignInPage() {
    const userCount = await prisma.user.count();

    return (
        <div className="flex justify-center items-center min-h-screen">
            <form
                action={userCount === 0 ? registerUser : loginUser}
                className="space-y-4 p-6 border rounded-lg w-[350px] bg-white"
            >
                <h2 className="text-xl font-bold text-center">
                    {userCount === 0 ? "Register First User" : "Sign In"}
                </h2>

                {userCount === 0 && (
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        className="w-full border p-2 rounded"
                        required
                    />
                )}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full border p-2 rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    {userCount === 0 ? "Register" : "Sign In"}
                </button>
            </form>
        </div>
    );
}
