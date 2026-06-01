import { useState, lazy, Suspense } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAnalyser } from '../hooks/useAnalyser';
import * as pdfjsLib from 'pdfjs-dist';
import styles from './AnalyserPage.module.scss';


// Set worker — add this outside the component
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// React.lazy — code split the heavy results panel
// It only loads when the user actually gets results
const AnalysisResults = lazy(() =>
  import('../components/ui/AnalysisResults').then(m => ({ default: m.AnalysisResults }))
);

export function AnalyserPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const { analyse, phase, streamText, result, error, reset } = useAnalyser();

  // react-dropzone — handles file upload + drag over
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;

      if (file.type === 'application/pdf') {
        // Extract text from PDF properly
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item: any) => item.str)
              .join(' ');
            fullText += pageText + '\n';
          }

          setResumeText(fullText.trim());
        } catch (err) {
          console.error('PDF parse error:', err);
          setResumeText('Failed to read PDF — please paste your resume text instead.');
        }
      } else {
        // Plain text file
        const text = await file.text();
        setResumeText(text);
      }
    },
  });

  const handleAnalyse = () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    analyse({ resumeText, jobDescription });
  };

  // ── Streaming view ──
if (phase === 'streaming') {
  return (
    <div className={styles.wrap}>
      <div className={styles.streamingCard}>
        <div className={styles.streamHeader}>
          <div className={styles.pulsingDot} />
          <span>AI is analysing your resume...</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
        {/* Show friendly steps instead of raw JSON */}
        <div className={styles.streamOutput}>
          {streamText.length > 0 && (
            <div style={{ color: '#64748b', fontSize: '12px', lineHeight: 2 }}>
              {streamText.includes('matchScore') && <div>✓ Calculating match score...</div>}
              {streamText.includes('keywordsFound') && <div>✓ Scanning keywords...</div>}
              {streamText.includes('keywordsMissing') && <div>✓ Finding gaps...</div>}
              {streamText.includes('rewrittenBullets') && <div>✓ Rewriting bullet points...</div>}
              {streamText.includes('actionPlan') && <div>✓ Building action plan...</div>}
              <div style={{ color: '#a78bfa' }}>
                Processing
                <span className={styles.cursor} />
              </div>
            </div>
          )}
          {streamText.length === 0 && (
            <div style={{ color: '#475569', fontSize: '12px' }}>
              Reading your resume and job description
              <span className={styles.cursor} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

  // ── Results view — lazy loaded ──
  if (phase === 'done' && result) {
    return (
      // Suspense shows fallback while AnalysisResults chunk loads
      <Suspense fallback={<div className={styles.loading}>Loading results...</div>}>
        <AnalysisResults result={result} onReset={reset} />
      </Suspense>
    );
  }

  // ── Error view ──
  if (phase === 'error') {
    return (
      <div className={styles.wrap}>
        <div className={styles.errorCard}>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryBtn} onClick={reset}>Try again</button>
        </div>
      </div>
    );
  }

  // ── Input view ──
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Resume Analyser</h1>
        <p className={styles.sub}>
          Upload your resume + paste a JD — Claude scores your match,
          finds missing keywords, and rewrites your bullets
        </p>
      </div>

      <div className={styles.grid}>
        {/* Resume upload */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <i className="ti ti-file-cv" aria-hidden="true" /> Your Resume
          </div>

          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''} ${acceptedFiles.length ? styles.hasFile : ''}`}
          >
            <input {...getInputProps()} />
            {acceptedFiles.length ? (
              <div className={styles.fileReady}>
                <span className={styles.fileIcon}>📄</span>
                <span className={styles.fileName}>{acceptedFiles[0].name}</span>
                <span className={styles.fileHint}>File loaded — or paste text below</span>
              </div>
            ) : (
              <div className={styles.dropContent}>
                <span className={styles.dropIcon}>{isDragActive ? '📂' : '📄'}</span>
                <span className={styles.dropText}>
                  {isDragActive ? 'Drop it!' : 'Drop PDF / TXT here'}
                </span>
                <span className={styles.dropHint}>or paste text below</span>
              </div>
            )}
          </div>

          <textarea
            className={styles.textarea}
            rows={8}
            placeholder="Or paste your resume text here..."
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
          />
        </div>

        {/* JD input */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <i className="ti ti-briefcase" aria-hidden="true" /> Job Description
          </div>
          <textarea
            className={styles.textarea}
            rows={16}
            placeholder={`Paste the full job description here...\n\ne.g.\nWe are looking for a React developer with 5+ years experience in TypeScript, Redux, REST APIs...`}
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      <button
        className={styles.analyseBtn}
        onClick={handleAnalyse}
        disabled={!resumeText.trim() || !jobDescription.trim()}
      >
        <i className="ti ti-sparkles" aria-hidden="true" />
        Analyse with Claude AI
      </button>
    </div>
  );
}