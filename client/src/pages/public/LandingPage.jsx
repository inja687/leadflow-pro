import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import LandingNavbar from "../../components/landing/LandingNavbar";
import HeroSection from "../../components/landing/HeroSection";
import StatsSection from "../../components/landing/StatsSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import WorkflowSection from "../../components/landing/WorkflowSection";
import ProductPreviewSection from "../../components/landing/ProductPreviewSection";
import TrustedBySection from "../../components/landing/TrustedBySection";
import TestimonialsSection from "../../components/landing/TestimonialsSection";
import FAQSection from "../../components/landing/FAQSection";
import ContactSection from "../../components/landing/ContactSection";
import LandingFooter from "../../components/landing/LandingFooter";

const publicAxios = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
};

export default function LandingPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setServerError(null);
      await publicAxios.post("/public/leads", form);
      navigate("/thank-you");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <LandingNavbar />

      <main id="main-content">
        <HeroSection />
        <StatsSection />
        <TrustedBySection />
        <FeaturesSection />
        <WorkflowSection />
        <ProductPreviewSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection
          form={form}
          errors={errors}
          loading={loading}
          serverError={serverError}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </main>

      <LandingFooter />
    </div>
  );
}
