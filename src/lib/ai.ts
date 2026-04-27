import { GoogleGenAI } from '@google/genai'

let aiClient: GoogleGenAI | null = null

function getClient(apiKey: string): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey })
  }
  return aiClient
}

/** Reset the client when API key changes */
export function resetAIClient(): void {
  aiClient = null
}

/** Generate a tailored cover letter */
export async function generateCoverLetter(params: {
  apiKey: string
  company: string
  role: string
  description: string
  userName: string
  userSkills: string[]
  userSummary: string
}): Promise<string> {
  const client = getClient(params.apiKey)

  const prompt = `You are an expert career coach and professional writer. Write a compelling, personalized cover letter for the following job application.

**Job Details:**
- Company: ${params.company}
- Role: ${params.role}
- Description: ${params.description || 'Not provided'}

**Candidate Profile:**
- Name: ${params.userName || 'Job Applicant'}
- Skills: ${params.userSkills.length > 0 ? params.userSkills.join(', ') : 'Not specified'}
- Summary: ${params.userSummary || 'Not provided'}

**Instructions:**
1. Write a professional, warm, and confident cover letter (3-4 paragraphs)
2. Highlight how the candidate's skills align with the role
3. Show genuine enthusiasm for the company
4. Include a strong opening that grabs attention
5. End with a clear call to action
6. Do NOT include placeholder brackets like [Your Name] — use the actual name provided
7. Format as plain text, ready to send`

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  return response.text || 'Unable to generate cover letter. Please try again.'
}

/** Generate an interview preparation guide */
export async function generateInterviewGuide(params: {
  apiKey: string
  company: string
  role: string
  description: string
  status: string
}): Promise<string> {
  const client = getClient(params.apiKey)

  const prompt = `You are a senior interview coach who has helped thousands of candidates land roles at top companies. Create a comprehensive interview preparation guide.

**Position Details:**
- Company: ${params.company}
- Role: ${params.role}
- Description: ${params.description || 'Not provided'}
- Current Status: ${params.status}

**Create a guide that includes:**

## 🎯 Role Analysis
Brief analysis of what ${params.company} likely values for this role.

## 📋 Key Topics to Prepare
List 5-7 specific technical or domain topics likely to come up.

## 💬 Common Interview Questions
Provide 8-10 likely interview questions with brief suggested talking points for each.

## 🧠 Behavioral Questions (STAR Method)
3-4 behavioral questions with STAR framework guidance.

## 🔍 Questions to Ask the Interviewer
5 intelligent questions that show deep interest and research.

## ⚡ Quick Tips
3-4 company-specific tips (culture, values, recent news to reference).

Format with markdown headers and bullet points for readability.`

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  return response.text || 'Unable to generate interview guide. Please try again.'
}
