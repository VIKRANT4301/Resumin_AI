import sys
import os
sys.path.append('c:/Users/Admin/Practice/Pro_Res/Backend')

from services.rag_matcher import RAGMatcher

# Test data
resume_data = {
    'skills': ['Python', 'React', 'Node.js', 'JavaScript'],
    '_sections': {
        'skills_text': 'Python React Node.js JavaScript',
        'experience_text': 'Software Developer with 3 years experience',
        'education_text': 'Bachelor of Computer Science'
    }
}

jd_data = {
    'role': 'Full Stack Developer',
    'must_have': [{'skill': 'Python'}, {'skill': 'React'}],
    'preferred': [{'skill': 'Node.js'}],
    'bonus': [{'skill': 'JavaScript'}],
    '_sections': {
        'must_have_text': 'Python React',
        'preferred_text': 'Node.js',
        'bonus_text': 'JavaScript'
    }
}

try:
    matcher = RAGMatcher(api_key=os.getenv('GEMINI_API_KEY'))
    result = matcher.match_resume_to_jd(resume_data, jd_data)
    print('SUCCESS: RAG matching completed without skills error')
    print('Match score:', result.get('overall_score', 'N/A'))
except Exception as e:
    print('ERROR:', str(e))
    import traceback
    traceback.print_exc()