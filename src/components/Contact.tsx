import React, { useState } from "react";
import { Loader2, Mail, Twitter, MessageCircle } from 'lucide-react';
import { showSuccessToast, showErrorToast } from "../lib/toast";

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "Feedback", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = "Valid email is required.";
    if (!form.message.trim()) newErrors.message = "Message is required.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "Feedback", message: "" });
    }, 1200);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-gradient-to-br from-black/80 to-gray-900/80 rounded-xl shadow-lg border border-gray-700/40">
      <h2 className="text-2xl font-bold text-white mb-2">Contact Us</h2>
      <p className="text-gray-400 mb-4 text-sm">Have feedback or questions? Reach out below!</p>
      <div className="mb-4 text-gray-300 text-sm flex flex-col gap-1">
        <span className="font-semibold flex items-center gap-1"><Mail className="w-4 h-4" /> <a href="mailto:support@animefinder.com" className="text-emerald-400 hover:underline">support@animefinder.com</a></span>
        <span className="flex items-center gap-1"><Twitter className="w-4 h-4 text-sky-400" /> <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">@yourhandle</a></span>
        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4 text-indigo-400" /> <a href="https://discord.gg/yourdiscord" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Join our Discord</a></span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded bg-gray-800 text-white border ${errors.name ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:border-emerald-400`}
          required
        />
        {errors.name && <div className="text-red-400 text-xs ml-1">{errors.name}</div>}
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded bg-gray-800 text-white border ${errors.email ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:border-emerald-400`}
          required
        />
        {errors.email && <div className="text-red-400 text-xs ml-1">{errors.email}</div>}
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-400"
        >
          <option value="Feedback">Feedback</option>
          <option value="Bug">Report a Bug</option>
          <option value="Other">Other</option>
        </select>
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded bg-gray-800 text-white border ${errors.message ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:border-emerald-400`}
          rows={3}
          required
        />
        {errors.message && <div className="text-red-400 text-xs ml-1">{errors.message}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-gradient-to-r from-red-600 to-emerald-500 text-white font-semibold hover:from-red-700 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />} Send Message
        </button>
        {submitted && (
          <div className="text-emerald-400 text-center mt-2 text-base font-semibold flex flex-col items-center gap-2">
            <span>Thank you for reaching out!</span>
            <span className="text-xs text-gray-400">We'll get back to you soon.</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Contact; 