# 🚀 Quick Start Guide - Pro_Res RAG Matching

## Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)
- Gemini API key
- 5 minutes to setup

---

## 1️⃣ Backend Setup

```bash
# Navigate to backend
cd Backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
EOF

# Verify installation
python -c "from services.vector_db import VectorDBManager; print('✓ Vector DB ready')"
python -c "from services.skill_graph import SkillGraph; print('✓ Skill Graph ready')"
python -c "from services.rag_matcher import RAGMatcher; print('✓ RAG Matcher ready')"

# Start backend server (manual)
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

From the repo root on Windows, you can also run:

```powershell
./run_backend.ps1
```

You should see:
```
Uvicorn running on http://127.0.0.1:8000
Application startup complete
```

---

## 2️⃣ Frontend Setup

```bash
# In new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser

---

## 3️⃣ Test the System

### Test 1: Single Resume Matching (Candidate Mode)

1. **Upload a resume** (PDF or image)
2. **Paste/Enter a job description** (or use a URL)
3. **Toggle to RAG mode** (RAG button in navbar should be enabled by default)
4. **Click "Analyze Resume"**

Expected output:
- ✅ Match score 0-100 with confidence %
- ✅ Matched skills with GREEN circles
- ✅ Missing skills with RED circles
- ✅ Partial matches with YELLOW circles
- ✅ Tier breakdown (must-have, preferred, bonus)
- ✅ Strengths and gaps identified

### Test 2: Recruiter Search (Recruiter Mode)

1. **Switch to RECRUITER mode** (toggle in navbar)
2. **Select "Shared Vault" source**
3. **Paste a job description**
4. **Click "Rank Candidates"**

Expected output:
- ✅ Candidates ranked by match score
- ✅ Confidence displayed for each
- ✅ Top-matched skills shown
- ✅ Skill comparison table

### Test 3: Verify Vector DB

```bash
# In Backend directory
python << 'EOF'
from services.vector_db import VectorDBManager

v = VectorDBManager()
stats = v.get_stats()
print("Vector DB Statistics:")
for collection, count in stats.items():
    print(f"  {collection}: {count} entries")
EOF
```

Expected:
```
Vector DB Statistics:
  resumes: 1+ entries
  job_descriptions: 1+ entries
  feedback: 0-1 entries
  skills: 100+ entries
```

---

## 4️⃣ Test Feedback Loop

1. **Complete a candidate match**
2. **On recruiter results, select a candidate**
3. **Click the green feedback icon** (if available)
4. **Submit outcome** (hired, shortlisted, etc.)
5. **Check `/model-stats` endpoint** for accuracy

```bash
curl http://127.0.0.1:8000/api/matcher/model-stats
```

Expected response:
```json
{
  "status": "success",
  "statistics": {
    "accuracy": {
      "overall_accuracy": 85.5,
      "total_feedback": 3,
      "average_confidence": 0.82
    }
  }
}
```

---

## 5️⃣ Troubleshooting

### Backend won't start
```bash
# Check port 8000 is free
lsof -i :8000

# If occupied, use different port
python -m uvicorn app:app --host 127.0.0.1 --port 8001

# Verify Gemini API key
echo $GEMINI_API_KEY
```

If Windows blocks `uvicorn.exe`, use:

```powershell
./run_backend.ps1
```

### Frontend won't load
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Vector DB errors
```bash
# Rebuild vector DB
rm -rf Backend/chroma_db
# Restart server - will auto-initialize

# Verify Chroma installation
python -c "import chromadb; print(chromadb.__version__)"
```

### API connection refused
```bash
# Check backend is running
curl http://127.0.0.1:8000/health

# Frontend expects backend at this URL
# Check App.jsx: const API_BASE = "http://127.0.0.1:8000/api/matcher"
```

---

## 📊 Sample Test Data

### Example Resume
```
John Doe
john.doe@example.com
+1-555-0123

PROFESSIONAL SUMMARY
Full-stack developer with 5+ years experience in web and mobile development.

SKILLS
- Languages: Python, JavaScript, TypeScript, Go
- Frontend: React, Vue.js, Next.js, Tailwind CSS
- Backend: FastAPI, Django, Express.js, PostgreSQL
- DevOps: Docker, Kubernetes, GitHub Actions, AWS
- Tools: Git, VSCode, Jira

EXPERIENCE
Senior Frontend Engineer at Tech Startup (2021-Present)
- Led React migration saving 40% bundle size
- Mentored 3 junior developers
- Implemented TypeScript across codebase

Backend Engineer at SaaS Company (2018-2021)
- Built REST APIs using FastAPI handling 10K+ req/min
- Designed PostgreSQL schemas for scalability
- Deployed services on AWS using Docker & K8s

EDUCATION
B.S. Computer Science, State University (2018)

CERTIFICATIONS
- AWS Certified Solutions Architect
- Docker Certified Associate
```

### Example Job Description
```
Position: Senior Full-Stack Engineer
Company: Innovation Labs

About the Role:
We're building the next generation of cloud infrastructure tools.
You'll work on both frontend and backend systems serving millions of users.

Requirements (MUST HAVE):
- 4+ years professional development experience
- Strong React or Vue.js skills
- Backend API design with Python or Node.js
- PostgreSQL database design and optimization
- Docker and containerization experience

Preferred Qualifications:
- Kubernetes deployment experience
- AWS cloud platform knowledge
- TypeScript expertise
- GraphQL implementation
- Open source contributions

Nice to Have:
- Machine learning basics
- Mobile app development (React Native)
- System design experience
- Team leadership experience

Benefits:
- Competitive salary $150-180K
- Full health insurance
- Remote work flexibility
- Professional development budget
- Stock options
```

---

## 🎯 Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can upload resume and submit for matching
- [ ] Received match score with confidence
- [ ] Saw green/yellow/red skill colors
- [ ] Recruiter search returned ranked candidates
- [ ] Vector DB storing embeddings (chroma_db folder exists)
- [ ] API endpoints responding without errors
- [ ] Feedback submission working (if implemented)

---

## 📈 Next Steps

1. **Collect Real Feedback**
   - Start using the system with actual candidates
   - Submit recruiter decisions
   - Let model learn from outcomes

2. **Monitor Accuracy**
   - Check `/model-stats` regularly
   - Track improvement over time
   - Adjust weights if needed

3. **Scale Up**
   - Add more test candidates to vector DB
   - Test with 100+ resume corpus
   - Monitor performance metrics

4. **Customize**
   - Adjust tier weights (must-have, preferred, bonus)
   - Add domain-specific skills to SkillGraph
   - Implement salary range matching
   - Add seniority level alignment

---

## 💡 Pro Tips

1. **Test with variety**
   - Try perfect matches (should score 95+)
   - Try mismatches (should score <20)
   - Try partial matches (should score 50-70)

2. **Check console logs**
   - Frontend: Open browser DevTools (F12)
   - Backend: Check terminal output
   - Look for error messages with helpful context

3. **Use RAG toggle**
   - Try both RAG (new) and Legacy (old) modes
   - Compare results to understand improvements
   - Legacy available for backward compatibility

4. **Inspect vector DB**
   - Chroma UI: python -m chromadb.server
   - Or use Python script to query collections

---

## 🆘 Support

If you encounter issues:

1. Check error messages carefully
2. Verify all dependencies installed
3. Confirm API keys set correctly
4. Review logs in console
5. Try with simpler test case first
6. Check networking (especially if containerized)

For more detailed info, see: `Backend/RAG_IMPLEMENTATION_GUIDE.md`

---

**You're ready to go! 🚀**

Start with Test 1 (single resume) to verify the complete flow works, then move to Test 2 (recruiter search).
