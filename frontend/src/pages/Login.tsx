import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("username", email);
            formData.append("password", password);

            const response = await api.post("/auth/login", formData);

            localStorage.setItem("token", response.data.access_token);

            navigate("/dashboard");
        } catch (error: any) {
            alert(error.response?.data?.detail || "Login Failed");
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white text-center">
                    Leetcode Tracker
                </h1>

                <p className="text-slate-400 text-center mt-2">
                    Login to continue your progress
                </p>

                <form onSubmit={handleLogin} className="mt-8 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">
                            Email
                        </label>

                        <input
                            className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-blue-500"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300">
                            Password
                        </label>

                        <input
                            className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-blue-500"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                        type="submit"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400">
                    Don't have an account?{" "}
                    <Link className="text-blue-400 hover:underline" to="/register">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;