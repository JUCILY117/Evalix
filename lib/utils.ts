import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

export async function sendFeedbackEmail({
  email,
  subject,
  feedback,
}: {
  email: string;
  subject: string;
  feedback: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/send-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, subject, feedback }),
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error?.error || "Failed to send email" };
    }

    return { success: true, message: "Feedback emailed successfully!" };
  } catch (err) {
    return { success: false, message: "Something went wrong while sending email." };
  }
}
export const generateFeedbackHTML = ({
  totalScore,
  categoryScores,
  strengths,
  areasForImprovement,
  finalAssessment,
  interviewRole,
  createdAt,
}: any) => {
  return `
  <html>
    <head>
      <style>
        /* Import font */
        @import url('https://fonts.googleapis.com/css2?family=Segoe+UI&display=swap');

        /* AMOLED dark background with subtle animated gradient pattern */
        body {
          margin: 0; 
          background: #0a0a12;
          font-family: 'Segoe UI', sans-serif;
          color: #d1d5db;
          overflow-x: hidden;
        }

        /* Animated subtle diagonal gradient background pattern */
        .background-pattern {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(
            135deg,
            #090912 25%, #12121c 25%,
            #12121c 50%, #090912 50%,
            #090912 75%, #12121c 75%, #12121c 100%
          );
          background-size: 40px 40px;
          animation: moveBackground 60s linear infinite;
          z-index: -1;
          opacity: 0.1;
        }

        @keyframes moveBackground {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }

        .container {
          max-width: 640px;
          margin: 40px auto;
          background-color: #12121c;
          border-radius: 20px;
          padding: 40px 48px;
          box-shadow: 0 0 40px rgba(201, 196, 253, 0.3);
          animation: fadeInUp 0.8s ease forwards;
          color: #e0e7ff;
        }

        /* Fade in up animation */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 32px;
        }

        .logo {
          height: 44px;
          margin-right: 18px;
          filter: drop-shadow(0 0 5px #c9c4fd);
          transition: filter 0.3s ease;
        }
        .logo:hover {
          filter: drop-shadow(0 0 10px #c9c4fd);
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #c9c4fd;
          user-select: none;
        }

        /* Interview title & date */
        h2 {
          font-size: 22px;
          margin-bottom: 8px;
          color: #c9c4fd;
          letter-spacing: 0.03em;
        }

        p.date {
          font-size: 14px;
          color: #7c83a0;
          margin-bottom: 28px;
        }

        /* Total score block */
        .total-score {
          background: linear-gradient(135deg, #a69bfc 0%, #c9c4fd 100%);
          padding: 18px 24px;
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(201, 196, 253, 0.5);
          text-align: center;
          font-weight: 600;
          font-size: 20px;
          color: #0a0a12;
          margin-bottom: 32px;
          user-select: none;
        }

        /* Sections */
        h3 {
          font-size: 20px;
          margin-bottom: 16px;
          color: #c9c4fd;
          border-left: 4px solid #7e7afb;
          padding-left: 12px;
          user-select: none;
        }

        ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 36px;
        }

        li {
          background: #1e2233;
          margin-bottom: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          box-shadow: 0 0 15px rgba(201, 196, 253, 0.1);
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }

        li:hover {
          background: #2a2e4a;
          box-shadow: 0 0 25px #c9c4fd;
        }

        li strong {
          color: #c9c4fd;
        }

        li em {
          color: #8e94b3;
          font-style: italic;
          font-weight: 500;
        }

        /* Emoji styles for strengths & improvements */
        .strengths li::before {
          content: "✨";
          margin-right: 8px;
        }

        .improvements li::before {
          content: "⚠️";
          margin-right: 8px;
        }

        /* Final assessment */
        .final-assessment {
          font-size: 16px;
          line-height: 1.5;
          color: #d1d5db;
          margin-bottom: 48px;
          white-space: pre-line;
          user-select: text;
        }

        hr {
          border: none;
          border-top: 1px solid #2e334b;
          margin-bottom: 32px;
          user-select: none;
        }

        /* Footer */
        .footer {
          font-size: 14px;
          color: #7c83a0;
          user-select: none;
        }
        .footer strong {
          color: #c9c4fd;
        }
      </style>
    </head>
    <body>
      <div class="background-pattern"></div>

      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="https://evalix.vercel.app/logo.png" alt="Evalix Logo" class="logo" />
          <div class="title">Evalix</div>
        </div>

        <!-- Interview Title & Date -->
        <h2>Interview Feedback – ${interviewRole}</h2>
        <p class="date"><strong>Date:</strong> ${new Date(createdAt).toLocaleString()}</p>

        <!-- Total Score -->
        <div class="total-score">
          <strong>Total Score:</strong> ${totalScore}/100
        </div>

        <!-- Category Breakdown -->
        <h3>Category Breakdown</h3>
        <ul>
          ${categoryScores
      .map(
        (c: any) => `
              <li>
                <strong>${c.name}:</strong> <span>${c.score}/100</span><br />
                <em>${c.comment}</em>
              </li>`
      )
      .join("")}
        </ul>

        <!-- Strengths -->
        ${strengths?.length
      ? `
          <h3>Strengths</h3>
          <ul class="strengths">
            ${strengths.map((s: string) => `<li>${s}</li>`).join("")}
          </ul>`
      : ""
    }

        <!-- Areas for Improvement -->
        ${areasForImprovement?.length
      ? `
          <h3>Areas for Improvement</h3>
          <ul class="improvements">
            ${areasForImprovement.map((a: string) => `<li>${a}</li>`).join("")}
          </ul>`
      : ""
    }

        <!-- Final Assessment -->
        <h3>Final Assessment</h3>
        <p class="final-assessment">${finalAssessment}</p>

        <hr />

        <!-- Footer -->
        <p class="footer">Thanks,<br /><strong>The Evalix Team</strong></p>
      </div>
    </body>
  </html>
  `;
};
