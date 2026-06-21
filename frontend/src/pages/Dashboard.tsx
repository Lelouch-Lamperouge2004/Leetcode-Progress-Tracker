import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { Problem } from "../types/problem";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts";

type DashboardStats = {
    total_problems: number;
    easy: number;
    medium: number;
    hard: number;
    solved: number;
    unsolved: number;
    topics: Record<string, number>;
};

function Dashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [editingProblemId, setEditingProblemId] = useState<number | null>(null);

    const [leetcodeId, setLeetcodeId] = useState("");
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [topic, setTopic] = useState("");
    const [status, setStatus] = useState("Solved");
    const [notes, setNotes] = useState("");
    const [solutionLink, setSolutionLink] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const pieData = stats
        ? [
            { name: "Easy", value: stats.easy },
            { name: "Medium", value: stats.medium },
            { name: "Hard", value: stats.hard },
        ]
        : [];

    const topicData = stats
        ? Object.entries(stats.topics).map(([topicName, count]) => ({
            topic: topicName,
            count,
        }))
        : [];

    async function fetchDashboardData() {
        const statsResponse = await api.get("/problems/dashboard");
        const problemsResponse = await api.get("/problems/?skip=0&limit=10");

        setStats(statsResponse.data);
        setProblems(problemsResponse.data);
    }

    function getDifficultyBadge(difficulty: string) {
        switch (difficulty) {
            case "Easy":
                return "bg-green-500/20 text-green-400 border border-green-500/30";

            case "Medium":
                return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

            case "Hard":
                return "bg-red-500/20 text-red-400 border border-red-500/30";

            default:
                return "bg-slate-700 text-slate-300";
        }
    }

    function getStatusBadge(status: string) {
        if (status === "Solved") {
            return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
        }

        return "bg-slate-700 text-slate-300 border border-slate-600";
    }

    function logout() {
        localStorage.removeItem("token");
        navigate("/login");
    }

    function clearForm() {
        setEditingProblemId(null);
        setLeetcodeId("");
        setTitle("");
        setDifficulty("Easy");
        setTopic("");
        setStatus("Solved");
        setNotes("");
        setSolutionLink("");
    }

    function startEdit(problem: Problem) {
        setEditingProblemId(problem.id);
        setLeetcodeId(String(problem.leetcode_id));
        setTitle(problem.title);
        setDifficulty(problem.difficulty);
        setTopic(problem.topic);
        setStatus(problem.status);
        setNotes(problem.notes || "");
        setSolutionLink(problem.solution_link || "");
    }

    async function handleSubmitProblem(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            leetcode_id: Number(leetcodeId),
            title,
            difficulty,
            topic,
            status,
            notes,
            solution_link: solutionLink,
        };

        if (editingProblemId) {
            await api.put(`/problems/${editingProblemId}`, payload);
        } else {
            await api.post("/problems/", payload);
        }

        clearForm();
        fetchDashboardData();
    }

    async function handleSearch() {
        if (!searchKeyword.trim()) {
            fetchDashboardData();
            return;
        }

        const response = await api.get(
            `/problems/search?keyword=${searchKeyword}`
        );

        setProblems(response.data);
    }
    async function handleDeleteProblem(problemId: number) {
        await api.delete(`/problems/${problemId}`);
        fetchDashboardData();
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Leetcode Tracker
                        </h1>
                        <p className="mt-2 text-slate-400">
                            Track your DSA progress, topics, and solving consistency.
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                    >
                        Logout
                    </button>
                </div>

                {stats && (
                    <>
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-sm text-slate-400">Total</p>
                                <p className="mt-2 text-3xl font-bold">{stats.total_problems}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-sm text-slate-400">Easy</p>
                                <p className="mt-2 text-3xl font-bold text-green-400">
                                    {stats.easy}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-sm text-slate-400">Medium</p>
                                <p className="mt-2 text-3xl font-bold text-yellow-400">
                                    {stats.medium}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-sm text-slate-400">Hard</p>
                                <p className="mt-2 text-3xl font-bold text-red-400">
                                    {stats.hard}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-sm text-slate-400">Solved</p>
                                <p className="mt-2 text-3xl font-bold text-blue-400">
                                    {stats.solved}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-sm text-slate-400">Unsolved</p>
                                <p className="mt-2 text-3xl font-bold text-slate-300">
                                    {stats.unsolved}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                                <h2 className="mb-4 text-xl font-semibold">
                                    Difficulty Distribution
                                </h2>

                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={110}
                                                dataKey="value"
                                                label
                                            >
                                                <Cell fill="#22c55e" />
                                                <Cell fill="#eab308" />
                                                <Cell fill="#ef4444" />
                                            </Pie>

                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                                <h2 className="mb-4 text-xl font-semibold">
                                    Topic Distribution
                                </h2>

                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topicData}>
                                            <XAxis dataKey="topic" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="mb-5 text-xl font-semibold">
                        {editingProblemId ? "Edit Problem" : "Add Problem"}
                    </h2>

                    <form onSubmit={handleSubmitProblem} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <input
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            placeholder="Leetcode ID"
                            value={leetcodeId}
                            onChange={(e) => setLeetcodeId(e.target.value)}
                        />

                        <input
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <select
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>

                        <input
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            placeholder="Topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />

                        <select
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option>Solved</option>
                            <option>Unsolved</option>
                        </select>

                        <input
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            placeholder="Notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        <input
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            placeholder="Solution Link"
                            value={solutionLink}
                            onChange={(e) => setSolutionLink(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button
                                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                                type="submit"
                            >
                                {editingProblemId ? "Update" : "Add"}
                            </button>

                            {editingProblemId && (
                                <button
                                    className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800"
                                    type="button"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Recent Problems
                        </h2>

                        <div className="flex gap-2">
                            <input
                                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white"
                                placeholder="Search..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />

                            <button
                                onClick={handleSearch}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                            >
                                Search
                            </button>

                            <button
                                onClick={fetchDashboardData}
                                className="rounded-lg bg-slate-700 px-4 py-2 text-white"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-800 text-sm text-slate-400">
                                    <th className="py-3">ID</th>
                                    <th className="py-3">Leetcode ID</th>
                                    <th className="py-3">Title</th>
                                    <th className="py-3">Difficulty</th>
                                    <th className="py-3">Topic</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Solution</th>
                                    <th className="py-3">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {problems.map((problem) => (
                                    <tr
                                        key={problem.id}
                                        className="border-b border-slate-800 text-sm"
                                    >
                                        <td className="py-4 text-slate-400">{problem.id}</td>

                                        <td className="py-4">{problem.leetcode_id}</td>

                                        <td className="py-4 font-medium">{problem.title}</td>

                                        <td className="py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyBadge(
                                                    problem.difficulty
                                                )}`}
                                            >
                                                {problem.difficulty}
                                            </span>
                                        </td>

                                        <td className="py-4">{problem.topic}</td>

                                        <td className="py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                                                    problem.status
                                                )}`}
                                            >
                                                {problem.status}
                                            </span>
                                        </td>

                                        <td className="py-4">
                                            {problem.solution_link ? (
                                                <a
                                                    href={problem.solution_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                                                >
                                                    View Solution
                                                </a>
                                            ) : (
                                                <span className="text-slate-500">No Link</span>
                                            )}
                                        </td>

                                        <td className="flex gap-2 py-4">
                                            <button
                                                onClick={() => startEdit(problem)}
                                                className="rounded-md bg-yellow-500 px-3 py-1 text-xs font-semibold text-black hover:bg-yellow-400"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDeleteProblem(problem.id)}
                                                className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {problems.length === 0 && (
                                    <tr>
                                        <td
                                            className="py-6 text-center text-slate-400"
                                            colSpan={8}
                                        >
                                            No problems found. Add your first problem above.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;