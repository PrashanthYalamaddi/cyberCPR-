import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  ShieldWarning,
  CheckCircle,
  Warning,
  Lightning,
  FileText,
  DownloadSimple,
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  Question,
  Sparkle,
  Info,
  LockKey,
  Globe,
  Database,
  Envelope,
  User,
  Cloud,
  Desktop,
  ChatCircleDots,
  PaperPlaneTilt,
  CaretRight,
  Clock,
  Calendar,
  Check,
  ShareNetwork,
  BellRinging,
  Buildings,
  Play
} from '@phosphor-icons/react';
import { InteractiveDemoVideo } from './InteractiveDemoVideo';

import {
  IncidentCategory,
  SystemType,
  UserImpact,
  AccessibilityStatus,
  SensitiveDataStatus,
  IncidentSeverity,
  IncidentStatus,
  IncidentFormData,
  ResponseStep,
  IncidentAssessmentResult,
  classifyIncidentHeuristically,
  calculateSeverity,
  generateResponsePlan,
  getAssistantAnswer
} from '../data/incidentWorkflows';

interface IncidentPlannerProps {
  onBackToEditorial?: () => void;
  onOpenConsole?: () => void;
}

const STORAGE_KEY = 'cybercpr_active_incident_plan';

const INCIDENT_CATEGORIES: IncidentCategory[] = [
  'Ransomware',
  'Phishing',
  'Malware',
  'Data Breach',
  'DDoS Attack',
  'Account Compromise',
  'Website Defacement',
  'Suspicious Activity',
  'Unknown / Not Sure',
  'Other'
];

const AVAILABLE_SYSTEMS: { type: SystemType; label: string; icon: React.ReactNode }[] = [
  { type: 'Website', label: 'Website / Web App', icon: <Globe size={16} /> },
  { type: 'Server', label: 'Production Server', icon: <Buildings size={16} /> },
  { type: 'Computer', label: 'Workstation / Laptop', icon: <Desktop size={16} /> },
  { type: 'Email', label: 'Email Infrastructure', icon: <Envelope size={16} /> },
  { type: 'Database', label: 'Database Cluster', icon: <Database size={16} /> },
  { type: 'Cloud service', label: 'Cloud Provider (AWS/Azure/GCP)', icon: <Cloud size={16} /> },
  { type: 'User accounts', label: 'Active Directory / IAM', icon: <User size={16} /> },
  { type: 'Other', label: 'Other Peripherals / Network', icon: <ShareNetwork size={16} /> }
];

const LIFECYCLE_STAGES = [
  { id: 'reported', label: 'Incident Reported', stepIndex: 0 },
  { id: 'assessment', label: 'Assessment', stepIndex: 0 },
  { id: 'containment', label: 'Containment', stepIndex: 1 },
  { id: 'investigation', label: 'Investigation', stepIndex: 2 },
  { id: 'eradication', label: 'Eradication', stepIndex: 3 },
  { id: 'recovery', label: 'Recovery', stepIndex: 4 },
  { id: 'resolved', label: 'Resolved', stepIndex: 5 }
];

const INITIAL_FORM_DATA: IncidentFormData = {
  incidentType: 'Ransomware',
  isNotSure: false,
  problemDescription: '',
  startDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  affectedSystems: ['Server', 'Database'],
  usersAffected: 'Few',
  isAccessible: 'Partially',
  sensitiveDataAffected: 'Unknown',
  symptoms: '',
  actionsTaken: '',
  evidenceNotes: '',
  uploadedEvidenceName: ''
};

export const IncidentPlanner: React.FC<IncidentPlannerProps> = ({
  onBackToEditorial,
  onOpenConsole
}) => {
  // Page Phase: 'form' | 'analyzing' | 'plan'
  const [phase, setPhase] = useState<'form' | 'analyzing' | 'plan'>('form');

  // Form State
  const [formData, setFormData] = useState<IncidentFormData>(INITIAL_FORM_DATA);

  // Validation Error State
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generated Plan & Assessment State
  const [assessment, setAssessment] = useState<IncidentAssessmentResult | null>(null);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Hello. I am your CyberCPR Response Assistant. Ask me any question regarding your response steps, containment protocols, or legal disclosure requirements.'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Expandable steps toggle
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-2': true,
    'step-3': true,
    'step-4': false,
    'step-5': false,
    'step-6': false
  });

  // Load persisted plan or form from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('cirp_active_incident_plan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.assessment && parsed.phase === 'plan') {
          setAssessment(parsed.assessment);
          setFormData(parsed.formData || parsed.assessment.formData);
          setPhase('plan');
        } else if (parsed.formData) {
          setFormData(parsed.formData);
        }
      }
    } catch (e) {
      console.warn('Could not load saved plan from localStorage', e);
    }
  }, []);

  // Save to localStorage when assessment or phase updates
  useEffect(() => {
    try {
      if (assessment && phase === 'plan') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            phase: 'plan',
            assessment,
            formData
          })
        );
      }
    } catch (e) {
      console.warn('Could not persist plan to localStorage', e);
    }
  }, [assessment, phase, formData]);

  // Handle Systems Toggle
  const toggleSystem = (sys: SystemType) => {
    setFormData((prev) => {
      const exists = prev.affectedSystems.includes(sys);
      const updated = exists
        ? prev.affectedSystems.filter((item) => item !== sys)
        : [...prev.affectedSystems, sys];
      return { ...prev, affectedSystems: updated };
    });
  };

  // Submit Handler with Validation and Loading Animation
  const handleAnalyze = () => {
    // Basic validation
    if (!formData.problemDescription.trim() && !formData.symptoms.trim()) {
      setValidationError('Please provide a brief problem description or list symptoms before proceeding.');
      const el = document.getElementById('problem-description-field');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setValidationError(null);

    // Enter analyzing screen
    setPhase('analyzing');

    // Simulate analytical synthesis (1.6s smooth duration)
    setTimeout(() => {
      let finalCategory = formData.incidentType;
      let classificationReasoning: string | undefined;

      if (formData.isNotSure || formData.incidentType === 'Unknown / Not Sure') {
        const heuristic = classifyIncidentHeuristically(formData);
        finalCategory = heuristic.category;
        classificationReasoning = heuristic.reasoning;
      }

      const severityResult = calculateSeverity(formData, finalCategory);
      const generatedSteps = generateResponsePlan(finalCategory, formData);

      const newAssessment: IncidentAssessmentResult = {
        classifiedType: finalCategory,
        originalType: formData.incidentType,
        classificationReasoning,
        severity: severityResult.severity,
        severityReasoning: severityResult.reasoning,
        status: 'ACTIVE',
        affectedSystemsList: formData.affectedSystems.length > 0 ? formData.affectedSystems.join(', ') : 'None specified',
        informationExposureRisk:
          formData.sensitiveDataAffected === 'Yes'
            ? 'HIGH EXPOSURE RISK: Sensitive corporate or customer records potentially exposed.'
            : formData.sensitiveDataAffected === 'Unknown'
            ? 'MODERATE RISK: Data exfiltration assessment required during investigation.'
            : 'MINIMAL RISK: No direct sensitive information breach reported.',
        isEmergency: severityResult.isEmergency,
        emergencyReason: severityResult.emergencyReason,
        timelineStage: 0,
        steps: generatedSteps,
        timestamp: new Date().toLocaleString(),
        formData: { ...formData }
      };

      setAssessment(newAssessment);
      setPhase('plan');

      // Scroll to top of planner smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1600);
  };

  // Toggle Action Completion
  const toggleActionCompletion = (stepId: string, actionId: string) => {
    if (!assessment) return;

    const updatedSteps = assessment.steps.map((st) => {
      if (st.id !== stepId) return st;
      const updatedActions = st.actions.map((act) => {
        if (act.id !== actionId) return act;
        return { ...act, completed: !act.completed };
      });
      return { ...st, actions: updatedActions };
    });

    // Compute active lifecycle stage based on completed steps
    // 0: Reported/Assessment, 1: Containment, 2: Investigation, 3: Eradication, 4: Recovery, 5: Resolved
    let activeStageIndex = 0;
    const allCompleted = updatedSteps.every((s) => s.actions.every((a) => a.completed));

    if (allCompleted) {
      activeStageIndex = 6; // Resolved
    } else {
      // Find first step that has uncompleted actions
      const firstIncompleteStepIdx = updatedSteps.findIndex((s) => s.actions.some((a) => !a.completed));
      if (firstIncompleteStepIdx !== -1) {
        // Step 0 is stabilize (index 0 -> lifecycle 0/1)
        // Step 1 is contain (index 1 -> lifecycle 2)
        // Step 2 is investigate (index 2 -> lifecycle 3)
        // Step 3 is remove (index 3 -> lifecycle 4)
        // Step 4 is recover (index 4 -> lifecycle 5)
        activeStageIndex = Math.min(firstIncompleteStepIdx + 1, 5);
      }
    }

    setAssessment({
      ...assessment,
      steps: updatedSteps,
      timelineStage: activeStageIndex,
      status: allCompleted ? 'RESOLVED' : activeStageIndex > 1 ? 'CONTAINMENT' : 'ACTIVE'
    });
  };

  // Mark all completed and mark resolved
  const handleMarkResolved = () => {
    if (!assessment) return;
    const completedSteps = assessment.steps.map((st) => ({
      ...st,
      actions: st.actions.map((act) => ({ ...act, completed: true }))
    }));

    setAssessment({
      ...assessment,
      steps: completedSteps,
      status: 'RESOLVED',
      timelineStage: 6
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B98972', '#101C35', '#D7B5A3', '#3F0D1B']
      });
    } catch {
      // Confetti fallback
    }
  };

  // Reset Plan and Start New Incident
  const handleReset = () => {
    const confirmReset = window.confirm('Are you sure you want to reset and start a new incident report? This will clear current progress.');
    if (!confirmReset) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localstorage clean
    }

    setAssessment(null);
    setFormData(INITIAL_FORM_DATA);
    setPhase('form');
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Export Plan as Markdown Playbook File
  const handleExportPlaybook = () => {
    if (!assessment) return;

    const totalActions = assessment.steps.reduce((acc, s) => acc + s.actions.length, 0);
    const completedActions = assessment.steps.reduce((acc, s) => acc + s.actions.filter((a) => a.completed).length, 0);
    const pct = Math.round((completedActions / totalActions) * 100) || 0;

    let md = `# CYBERCPR INCIDENT RESPONSE PLAYBOOK\n`;
    md += `Generated by CyberCPR (Cyber Incident Response Planner)\n`;
    md += `Date: ${assessment.timestamp}\n\n`;

    md += `## INCIDENT ASSESSMENT\n`;
    md += `- Classified Incident Type: ${assessment.classifiedType}\n`;
    if (assessment.classificationReasoning) {
      md += `- Classification Note: ${assessment.classificationReasoning}\n`;
    }
    md += `- Severity Level: ${assessment.severity}\n`;
    md += `- Severity Reasoning: ${assessment.severityReasoning}\n`;
    md += `- Status: ${assessment.status}\n`;
    md += `- Affected Infrastructure: ${assessment.affectedSystemsList}\n`;
    md += `- Users Impacted: ${assessment.formData.usersAffected}\n`;
    md += `- System Availability: ${assessment.formData.isAccessible}\n`;
    md += `- Information Exposure: ${assessment.informationExposureRisk}\n`;
    md += `- Response Progress: ${completedActions} of ${totalActions} actions completed (${pct}%)\n\n`;

    if (assessment.isEmergency && assessment.emergencyReason) {
      md += `### EMERGENCY DIRECTIVE\n`;
      md += `CRITICAL: ${assessment.emergencyReason}\n`;
      md += `Statutory Notification Advice: Notify organizational CISO and prepare regulatory disclosure if required under CERT-In Directions 2022 / DPDP Act 2023.\n\n`;
    }

    md += `## REPORTED INCIDENT CONTEXT\n`;
    md += `Problem Description:\n${assessment.formData.problemDescription || 'Not specified'}\n\n`;
    md += `Observed Symptoms:\n${assessment.formData.symptoms || 'None reported'}\n\n`;
    md += `Initial Containment Actions Taken:\n${assessment.formData.actionsTaken || 'None reported'}\n\n`;

    md += `## STEP-BY-STEP RESPONSE EXECUTION\n\n`;
    assessment.steps.forEach((step) => {
      md += `### ${step.stepNumber}: ${step.title} [Priority: ${step.priority}]\n`;
      md += `Summary: ${step.summary}\n\n`;
      step.actions.forEach((act) => {
        const mark = act.completed ? '[x]' : '[ ]';
        md += `- ${mark} **${act.label}**\n  *Details: ${act.detail}*\n`;
      });
      md += `\n`;
    });

    md += `## DISCLAIMER\n`;
    md += `This assessment is an initial response recommendation based on user-supplied information. It does not replace live digital forensics or professional incident response services.\n`;

    // Trigger download
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberCPR_Incident_Playbook_${assessment.classifiedType.replace(/\s+/g, '_')}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chat message submit
  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const botReply = getAssistantAnswer(userText, assessment?.classifiedType || formData.incidentType);

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText },
      { sender: 'assistant', text: botReply }
    ]);
    setChatInput('');
  };

  // Quick Prompt click
  const handleQuickPrompt = (prompt: string) => {
    const botReply = getAssistantAnswer(prompt, assessment?.classifiedType || formData.incidentType);
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: prompt },
      { sender: 'assistant', text: botReply }
    ]);
  };

  // Progress metrics
  const totalActions = useMemo(() => {
    if (!assessment) return 0;
    return assessment.steps.reduce((acc, s) => acc + s.actions.length, 0);
  }, [assessment]);

  const completedActions = useMemo(() => {
    if (!assessment) return 0;
    return assessment.steps.reduce((acc, s) => acc + s.actions.filter((a) => a.completed).length, 0);
  }, [assessment]);

  const progressPercentage = useMemo(() => {
    if (totalActions === 0) return 0;
    return Math.round((completedActions / totalActions) * 100);
  }, [completedActions, totalActions]);

  // Pre-fill demo scenario to help user test quickly
  const handleFillDemoScenario = (archetype: 'ransomware' | 'ddos' | 'databreach') => {
    if (archetype === 'ransomware') {
      setFormData({
        incidentType: 'Ransomware',
        isNotSure: false,
        problemDescription: 'Finance department workstations and central NAS share display locked files ending in .lockbit. A text file titled RESTORE_FILES.txt is demanding cryptocurrency within 48 hours.',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '08:45',
        affectedSystems: ['Server', 'Computer', 'Database'],
        usersAffected: 'Many',
        isAccessible: 'Partially',
        sensitiveDataAffected: 'Yes',
        symptoms: 'Wallpapers replaced with ransom message, high disk activity, CPU at 95%, shared folders inaccessible.',
        actionsTaken: 'Disconnected two workstations from Wi-Fi; left domain controller running.',
        evidenceNotes: 'Saved screenshot of ransom note; recorded hash of lockbit.exe binary.',
        uploadedEvidenceName: 'ransom_note_sample.txt'
      });
    } else if (archetype === 'ddos') {
      setFormData({
        incidentType: 'DDoS Attack',
        isNotSure: false,
        problemDescription: 'Public customer e-commerce portal is inaccessible. Server load average exceeded 120 and Cloudflare analytics reports 4.5 million incoming SYN/GET requests per minute.',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '10:15',
        affectedSystems: ['Website', 'Server'],
        usersAffected: 'Everyone',
        isAccessible: 'No',
        sensitiveDataAffected: 'No',
        symptoms: 'HTTP 502 Bad Gateway across all regions, firewall connection tables fully saturated.',
        actionsTaken: 'Restarted Nginx reverse proxy twice; contacted upstream ISP NOC.',
        evidenceNotes: 'Captured tcpdump sample on eth0 showing packet floods from diverse international IP ranges.',
        uploadedEvidenceName: 'traffic_spike_dump.pcap'
      });
    } else {
      setFormData({
        incidentType: 'Data Breach',
        isNotSure: false,
        problemDescription: 'A third-party security researcher reported a pastebin link containing 15,000 customer email addresses and hashed passwords originating from our legacy SQL database.',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '14:30',
        affectedSystems: ['Database', 'User accounts', 'Cloud service'],
        usersAffected: 'Many',
        isAccessible: 'Yes',
        sensitiveDataAffected: 'Yes',
        symptoms: 'Large outbound transfer spike observed on database replica server last weekend between 02:00 and 04:00 UTC.',
        actionsTaken: 'Rotated master database password; revoked read-only analytics replica token.',
        evidenceNotes: 'Exported VPC flow logs covering the anomalous 2-hour window.',
        uploadedEvidenceName: 'vpc_flow_anomaly.csv'
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF6EE] text-[#101C35] selection:bg-[#B98972]/30 selection:text-[#101C35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DED7] pb-4">
          <div className="flex items-center gap-3">
            {onBackToEditorial && (
              <button
                onClick={onBackToEditorial}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5DED7] bg-[#F8F6F2] hover:bg-[#EDE4D6] text-xs font-mono font-semibold text-[#101C35] transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Return to Overview</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B98972] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#101C35]">
                CyberCPR : Incident Planner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === 'form' && (
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5DED7] bg-[#F8F6F2] hover:bg-[#EDE4D6] text-xs font-mono font-bold text-[#101C35] transition-colors cursor-pointer"
                title="Watch interactive product demo"
              >
                <Play size={13} weight="fill" className="text-[#B98972]" />
                <span>Interactive Demo</span>
              </button>
            )}

            {phase === 'plan' && (
              <>
                <button
                  onClick={handleExportPlaybook}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#B98972] bg-[#FAF6EE] hover:bg-[#F0EDE7] text-xs font-mono font-bold text-[#101C35] shadow-xs transition-colors cursor-pointer"
                  title="Export complete plan as Markdown file"
                >
                  <DownloadSimple size={15} className="text-[#B98972]" />
                  <span>Export Playbook</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5DED7] bg-[#F8F6F2] hover:bg-[#EDE4D6] text-xs font-mono font-semibold text-[#5A544F] transition-colors cursor-pointer"
                  title="Start a new incident analysis"
                >
                  <ArrowClockwise size={14} />
                  <span>New Incident</span>
                </button>
              </>
            )}

            {onOpenConsole && (
              <button
                onClick={onOpenConsole}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101C35] hover:bg-[#172744] text-[#FAF6EE] text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Lightning size={14} className="text-[#D7B5A3]" />
                <span>DAA Algorithmic Engine</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DEDICATED SECTION: SEE HOW IT WORKS - INTERACTIVE DEMO                    */}
        {/* ========================================================================= */}
        {phase === 'form' && (
          <InteractiveDemoVideo
            onStartPlanner={() => {
              const el = document.getElementById('incident-intake-form');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* PHASE 1: INTAKE FORM                                                      */}
        {/* ========================================================================= */}
        {phase === 'form' && (
          <div id="incident-intake-form" className="space-y-8 animate-fadeIn pt-4">
            {/* Header Title Section */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE4D6] border border-[#E5DED7] text-[11px] font-mono font-bold uppercase tracking-wider text-[#101C35]">
                <ShieldCheck size={14} className="text-[#B98972]" weight="fill" />
                <span>Guided Incident Intake and Response Formulation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold tracking-tight text-[#101C35] leading-tight">
                What happened?
              </h1>
              <p className="text-base sm:text-lg text-[#5A544F] max-w-3xl leading-relaxed">
                Tell us what you are experiencing. Provide as much information as you can, and our response engine will organize the appropriate containment, investigation, and recovery steps.
              </p>

              {/* Demo Fill Shortcuts */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
                <span className="text-[#77736F]">Fill sample scenario:</span>
                <button
                  type="button"
                  onClick={() => handleFillDemoScenario('ransomware')}
                  className="px-2.5 py-1 rounded-lg bg-[#F0EDE7] hover:bg-[#EDE4D6] border border-[#E5DED7] text-[#101C35] font-semibold cursor-pointer transition-colors"
                >
                  Sample Ransomware
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemoScenario('ddos')}
                  className="px-2.5 py-1 rounded-lg bg-[#F0EDE7] hover:bg-[#EDE4D6] border border-[#E5DED7] text-[#101C35] font-semibold cursor-pointer transition-colors"
                >
                  Sample DDoS Flood
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemoScenario('databreach')}
                  className="px-2.5 py-1 rounded-lg bg-[#F0EDE7] hover:bg-[#EDE4D6] border border-[#E5DED7] text-[#101C35] font-semibold cursor-pointer transition-colors"
                >
                  Sample Data Breach
                </button>
              </div>
            </div>

            {/* Validation Notice */}
            {validationError && (
              <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#E53E3E]/40 text-[#9B2C2C] flex items-center gap-3 text-sm animate-shake">
                <Warning size={20} className="shrink-0 text-[#E53E3E]" weight="fill" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Main Intake Form Container */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              className="space-y-8"
            >
              {/* SECTION: INCIDENT TYPE SELECTION */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F6F2] border border-[#E5DED7] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DED7] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#101C35] font-editorial flex items-center gap-2">
                      <span>1. Select Incident Type</span>
                    </h2>
                    <p className="text-xs text-[#5A544F] mt-0.5">
                      Choose the closest archetype, or toggle &quot;I am not sure&quot; to allow heuristic classification.
                    </p>
                  </div>

                  {/* "I'm not sure" Toggle Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isNotSure: !prev.isNotSure,
                        incidentType: !prev.isNotSure ? 'Unknown / Not Sure' : 'Ransomware'
                      }))
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                      formData.isNotSure
                        ? 'bg-[#B98972] text-[#FAF6EE] border-[#B98972] shadow-xs'
                        : 'bg-[#EDE4D6] hover:bg-[#E5DED7] text-[#101C35] border-[#CDBFA7]'
                    }`}
                  >
                    <Question size={16} weight="bold" />
                    <span>I am not sure what type this is</span>
                  </button>
                </div>

                {formData.isNotSure ? (
                  <div className="p-4 rounded-2xl bg-[#EDE4D6]/70 border border-[#B98972]/50 text-xs text-[#101C35] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[#101C35]">
                      <Sparkle size={16} className="text-[#B98972]" weight="fill" />
                      <span>Heuristic Classification Active</span>
                    </div>
                    <p className="text-[#5A544F] leading-relaxed">
                      No problem. Describe the observed behavior, symptoms, and impacted systems below. The CyberCPR reasoning engine will analyze the indicators to determine the primary incident archetype and calibrate the containment steps accordingly.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {INCIDENT_CATEGORIES.map((cat) => {
                      const isSelected = formData.incidentType === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, incidentType: cat, isNotSure: false }))}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                            isSelected
                              ? 'bg-[#101C35] text-[#FAF6EE] border-[#101C35] shadow-md ring-2 ring-[#B98972]'
                              : 'bg-[#FAF6EE] hover:bg-[#EDE4D6] text-[#101C35] border-[#E5DED7]'
                          }`}
                        >
                          <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? 'text-[#D7B5A3]' : 'text-[#77736F]'}`}>
                            Archetype
                          </span>
                          <span className="text-xs sm:text-sm font-bold leading-snug">
                            {cat}
                          </span>
                          <span className="flex items-center justify-end">
                            {isSelected && <Check size={14} className="text-[#D7B5A3]" weight="bold" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION: INCIDENT DETAILS */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F6F2] border border-[#E5DED7] shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#101C35] font-editorial">
                    2. Describe the Incident
                  </h2>
                  <p className="text-xs text-[#5A544F] mt-0.5">
                    Structured operational details to scope impact, blast radius, and urgency.
                  </p>
                </div>

                {/* Large Textarea: Describe the problem */}
                <div id="problem-description-field" className="space-y-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35]">
                    Describe the problem <span className="text-[#B98972]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.problemDescription}
                    onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                    placeholder="Example: Our company website suddenly became unavailable. We are receiving a large number of requests and normal users cannot access the website."
                    className="w-full p-4 rounded-2xl bg-[#FAF6EE] border border-[#CDBFA7] text-[#101C35] placeholder:text-[#9A948D] text-sm focus:outline-none focus:ring-2 focus:ring-[#B98972] transition-all resize-y"
                  />
                </div>

                {/* Structured Grid: Timeline & Scope */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {/* When did it start? */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35] flex items-center gap-1.5">
                      <Clock size={14} className="text-[#B98972]" />
                      <span>When did it start?</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        aria-label="Incident start date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-[#FAF6EE] border border-[#CDBFA7] text-[#101C35] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#B98972]"
                      />
                      <input
                        type="time"
                        aria-label="Incident approximate start time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-[#FAF6EE] border border-[#CDBFA7] text-[#101C35] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#B98972]"
                      />
                    </div>
                  </div>

                  {/* How many users are affected? */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35] flex items-center gap-1.5">
                      <User size={14} className="text-[#B98972]" />
                      <span>How many users affected?</span>
                    </label>
                    <select
                      aria-label="How many users are affected"
                      value={formData.usersAffected}
                      onChange={(e) => setFormData({ ...formData, usersAffected: e.target.value as UserImpact })}
                      className="w-full p-2.5 rounded-xl bg-[#FAF6EE] border border-[#CDBFA7] text-[#101C35] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#B98972] cursor-pointer"
                    >
                      <option value="One">One isolated user</option>
                      <option value="Few">Few users (2 - 10)</option>
                      <option value="Many">Many users (10 - 500)</option>
                      <option value="Everyone">Everyone / Entire organization</option>
                      <option value="Unknown">Unknown impact</option>
                    </select>
                  </div>

                  {/* Is the system currently accessible? */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35] flex items-center gap-1.5">
                      <Globe size={14} className="text-[#B98972]" />
                      <span>System currently accessible?</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['Yes', 'Partially', 'No', 'Unknown'] as AccessibilityStatus[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, isAccessible: opt })}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                            formData.isAccessible === opt
                              ? 'bg-[#101C35] text-[#FAF6EE] border-[#101C35]'
                              : 'bg-[#FAF6EE] text-[#5A544F] border-[#CDBFA7] hover:border-[#101C35]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sensitive information affected */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35] flex items-center gap-1.5">
                    <LockKey size={14} className="text-[#B98972]" />
                    <span>Is sensitive information potentially affected?</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(['Yes', 'No', 'Unknown'] as SensitiveDataStatus[]).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData({ ...formData, sensitiveDataAffected: val })}
                        className={`px-5 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                          formData.sensitiveDataAffected === val
                            ? val === 'Yes'
                              ? 'bg-[#8A1E35] text-[#FAF6EE] border-[#8A1E35]'
                              : 'bg-[#101C35] text-[#FAF6EE] border-[#101C35]'
                            : 'bg-[#FAF6EE] text-[#5A544F] border-[#CDBFA7] hover:border-[#101C35]'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.sensitiveDataAffected === val ? 'bg-[#FAF6EE]' : 'bg-[#CDBFA7]'}`} />
                        <span>{val === 'Yes' ? 'Yes (Personal/Financial/Auth Data)' : val === 'No' ? 'No sensitive data involved' : 'Unknown / Under review'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* What systems are affected? (Multi-select) */}
                <div className="space-y-2.5 pt-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35]">
                    What systems are affected? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {AVAILABLE_SYSTEMS.map((item) => {
                      const isSelected = formData.affectedSystems.includes(item.type);
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => toggleSystem(item.type)}
                          className={`p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-[#101C35] text-[#FAF6EE] border-[#101C35] shadow-xs'
                              : 'bg-[#FAF6EE] hover:bg-[#EDE4D6] text-[#101C35] border-[#CDBFA7]'
                          }`}
                        >
                          <span className={isSelected ? 'text-[#D7B5A3]' : 'text-[#77736F]'}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* What symptoms are you seeing? */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35]">
                    What symptoms are you seeing?
                  </label>
                  <textarea
                    rows={3}
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="Provide specific technical symptoms (e.g., error codes, high CPU spikes, altered desktop backgrounds, ransom note texts, or odd network traffic)."
                    className="w-full p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#CDBFA7] text-[#101C35] placeholder:text-[#9A948D] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#B98972] transition-all resize-y"
                  />
                </div>

                {/* What actions have already been taken? */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35]">
                    What actions have already been taken?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.actionsTaken}
                    onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
                    placeholder="List any initial measures already carried out (e.g., unplugged Ethernet cable, rebooted server, revoked API tokens, alerted team lead)."
                    className="w-full p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#CDBFA7] text-[#101C35] placeholder:text-[#9A948D] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#B98972] transition-all resize-y"
                  />
                </div>
              </div>

              {/* SECTION: OPTIONAL EVIDENCE & CREDENTIAL SAFETY WARNING */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F6F2] border border-[#E5DED7] shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#101C35] font-editorial">
                    3. Additional Information &amp; Evidence (Optional)
                  </h2>
                  <p className="text-xs text-[#5A544F] mt-0.5">
                    Include log snippets, error text, or screenshot descriptions to assist response generation.
                  </p>
                </div>

                {/* MANDATORY VISIBLE CREDENTIAL WARNING */}
                <div className="p-4 rounded-2xl bg-[#FAF6EE] border-2 border-[#B98972] text-[#101C35] flex items-start gap-3 shadow-xs">
                  <LockKey size={22} className="text-[#B98972] shrink-0 mt-0.5" weight="fill" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-[#8A1E35] uppercase font-mono tracking-wider">
                      Important Security &amp; Privacy Notice:
                    </span>
                    <p className="text-[#5A544F] leading-relaxed">
                      <strong>Never enter passwords, API keys, authentication tokens, or other secret credentials.</strong> All analysis is conducted locally in accordance with your security perimeter.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#101C35]">
                    Error messages, alerts, or relevant log excerpts
                  </label>
                  <textarea
                    rows={3}
                    value={formData.evidenceNotes}
                    onChange={(e) => setFormData({ ...formData, evidenceNotes: e.target.value })}
                    placeholder="Paste non-sensitive log traces, HTTP status codes, firewall alerts, or file names..."
                    className="w-full p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#CDBFA7] text-[#101C35] placeholder:text-[#9A948D] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#B98972] transition-all"
                  />
                </div>

                {/* Evidence Attachment Simulated Box */}
                <div className="p-4 rounded-2xl border border-dashed border-[#CDBFA7] bg-[#FAF6EE] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE4D6] flex items-center justify-center text-[#101C35]">
                      <FileText size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-[#101C35] block">
                        {formData.uploadedEvidenceName ? formData.uploadedEvidenceName : 'Attach Log or Screenshot reference'}
                      </span>
                      <span className="text-[11px] text-[#77736F]">
                        Reference name for audit tracking (Plain text / Local simulation)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label="Attachment reference name"
                      value={formData.uploadedEvidenceName || ''}
                      onChange={(e) => setFormData({ ...formData, uploadedEvidenceName: e.target.value })}
                      placeholder="e.g. firewall_alert.log"
                      className="p-2 rounded-xl bg-[#F8F6F2] border border-[#CDBFA7] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#B98972]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: SUBMIT BUTTON & HONEST ANALYSIS DISCLAIMER */}
              <div className="p-8 rounded-3xl bg-[#101C35] text-[#FAF6EE] border border-[#172744] shadow-xl text-center space-y-4">
                <div className="max-w-xl mx-auto space-y-2">
                  <h3 className="text-xl font-editorial font-bold text-[#FAF6EE]">
                    Ready to Generate Containment &amp; Response Plan
                  </h3>
                  <p className="text-xs text-[#D7B5A3]/80 leading-relaxed font-mono">
                    Analysis is derived strictly from your supplied operational inputs, correlated against NIST SP 800-61 and CERT-In procedural workflows.
                  </p>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#B98972] hover:bg-[#A87963] text-[#FAF6EE] font-editorial font-bold text-base tracking-wide transition-all transform active:scale-98 shadow-lg flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>Analyze Incident</span>
                    <ArrowRight size={18} weight="bold" />
                  </button>
                </div>

                <p className="text-[11px] text-[#D7B5A3]/60 italic font-mono pt-1">
                  CyberCPR does not perform active network penetration or fake intrusion detection. Response steps are dynamically synthesized from structured organizational rules.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: SMOOTH ANALYZING ANIMATION                                      */}
        {/* ========================================================================= */}
        {phase === 'analyzing' && (
          <div className="py-24 text-center space-y-8 animate-fadeIn">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#E5DED7] border-t-[#B98972] animate-spin" />
              <ShieldCheck size={36} className="text-[#101C35] animate-pulse" weight="fill" />
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <h2 className="text-2xl font-editorial font-bold text-[#101C35]">
                Analyzing incident information...
              </h2>
              <p className="text-xs font-mono text-[#5A544F] leading-relaxed">
                Evaluating blast radius, containment dependencies, and regulatory triage criteria based on reported symptoms.
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B98972] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#101C35] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D7B5A3] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 3: RESULT PAGE - ASSESSMENT & STEP-BY-STEP RESPONSE PLAN            */}
        {/* ========================================================================= */}
        {phase === 'plan' && assessment && (
          <div className="space-y-8 animate-fadeIn">
            {/* EMERGENCY WARNING BANNER IF SENSITIVE DATA OR CRITICAL IMPACT */}
            {assessment.isEmergency && (
              <div className="p-6 rounded-3xl bg-[#FAF2F2] border-2 border-[#8A1E35] shadow-md space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8A1E35] text-[#FAF6EE] flex items-center justify-center shrink-0">
                    <BellRinging size={22} weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#8A1E35] uppercase font-mono tracking-wide">
                      This incident may require immediate professional assistance
                    </h3>
                    <p className="text-xs text-[#521A27]">
                      {assessment.emergencyReason || 'Critical operational assets or confidential information are potentially compromised.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E5DED7] text-[#101C35]">
                    <span className="font-bold text-[#8A1E35] block mb-1">1. Contact CISO / IT Lead</span>
                    Notify your internal incident management chain of command immediately.
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E5DED7] text-[#101C35]">
                    <span className="font-bold text-[#8A1E35] block mb-1">2. Engage Incident Response</span>
                    Activate contracted external retainer or CERT-In emergency reporting.
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E5DED7] text-[#101C35]">
                    <span className="font-bold text-[#8A1E35] block mb-1">3. Preserve Evidence</span>
                    Avoid rebooting infected systems; unplug network cables to sever propagation.
                  </div>
                </div>
              </div>
            )}

            {/* TOP CARD: INCIDENT ASSESSMENT */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F6F2] border border-[#E5DED7] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DED7] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B98972] font-bold">
                    Incident Assessment Report
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#101C35]">
                    {assessment.classifiedType} Incident
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono">
                  {/* Severity Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      assessment.severity === 'CRITICAL'
                        ? 'bg-[#8A1E35] text-[#FAF6EE]'
                        : assessment.severity === 'HIGH'
                        ? 'bg-[#B98972] text-[#FAF6EE]'
                        : assessment.severity === 'MEDIUM'
                        ? 'bg-[#FAF6EE] text-[#101C35] border border-[#CDBFA7]'
                        : 'bg-[#EDE4D6] text-[#101C35]'
                    }`}
                  >
                    Severity: {assessment.severity}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      assessment.status === 'RESOLVED'
                        ? 'bg-[#2E7D32] text-[#FAF6EE]'
                        : assessment.status === 'CONTAINMENT'
                        ? 'bg-[#B98972] text-[#FAF6EE]'
                        : 'bg-[#101C35] text-[#FAF6EE]'
                    }`}
                  >
                    Status: {assessment.status}
                  </span>
                </div>
              </div>

              {/* Classification Reasoning note if Heuristic Mode was used */}
              {assessment.classificationReasoning && (
                <div className="p-4 rounded-2xl bg-[#EDE4D6] border border-[#B98972]/40 text-xs text-[#101C35] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-[#101C35]">
                    <Sparkle size={15} className="text-[#B98972]" weight="fill" />
                    <span>Possible Incident Category Classification:</span>
                  </div>
                  <p className="text-[#5A544F] leading-relaxed">
                    {assessment.classificationReasoning}
                  </p>
                </div>
              )}

              {/* Assessment Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E5DED7] space-y-1">
                  <span className="text-[#77736F] text-[10px] uppercase font-bold">Affected Systems</span>
                  <p className="font-bold text-[#101C35] text-sm truncate">{assessment.affectedSystemsList}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E5DED7] space-y-1">
                  <span className="text-[#77736F] text-[10px] uppercase font-bold">User Blast Radius</span>
                  <p className="font-bold text-[#101C35] text-sm">{assessment.formData.usersAffected} Impacted</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E5DED7] space-y-1">
                  <span className="text-[#77736F] text-[10px] uppercase font-bold">System Accessibility</span>
                  <p className="font-bold text-[#101C35] text-sm">{assessment.formData.isAccessible}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E5DED7] space-y-1">
                  <span className="text-[#77736F] text-[10px] uppercase font-bold">Recorded Discovery</span>
                  <p className="font-bold text-[#101C35] text-sm">{assessment.formData.startDate} at {assessment.formData.startTime}</p>
                </div>
              </div>

              {/* Information Exposure Risk */}
              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E5DED7] flex items-start gap-3">
                <ShieldWarning size={20} className="text-[#B98972] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-[#101C35] block font-mono uppercase tracking-wider mb-0.5">
                    Information Exposure Risk
                  </span>
                  <p className="text-[#5A544F] leading-relaxed">
                    {assessment.informationExposureRisk}
                  </p>
                </div>
              </div>

              {/* Assessment Disclaimer */}
              <p className="text-[11px] font-mono text-[#77736F] italic">
                Disclaimer: This assessment is an initial response recommendation based on the information provided. It does not replace professional digital forensics or on-site security investigation.
              </p>
            </div>

            {/* LIFECYCLE TIMELINE: Reported -> Assessment -> Containment -> Investigation -> Eradication -> Recovery -> Resolved */}
            <div className="p-6 rounded-3xl bg-[#F8F6F2] border border-[#E5DED7] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DED7] pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#101C35]">
                  Response Lifecycle Timeline
                </span>
                <span className="text-xs font-mono text-[#5A544F]">
                  Stage {assessment.timelineStage + 1} of 7: {LIFECYCLE_STAGES[assessment.timelineStage]?.label || 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {LIFECYCLE_STAGES.map((stage, idx) => {
                  const isCurrent = assessment.timelineStage === idx;
                  const isPast = assessment.timelineStage > idx;

                  return (
                    <div
                      key={stage.id}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-[#B98972] text-[#FAF6EE] border-[#B98972] shadow-sm font-bold'
                          : isPast
                          ? 'bg-[#101C35] text-[#FAF6EE] border-[#101C35]'
                          : 'bg-[#FAF6EE] text-[#77736F] border-[#E5DED7]'
                      }`}
                    >
                      <span className="text-[10px] font-mono block opacity-75">
                        {isPast ? 'COMPLETED' : isCurrent ? 'CURRENT' : `STAGE 0${idx + 1}`}
                      </span>
                      <span className="text-xs font-bold leading-tight block mt-0.5">
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PROGRESS BAR & SUMMARY */}
            <div className="p-6 rounded-3xl bg-[#101C35] text-[#FAF6EE] border border-[#172744] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#D7B5A3] font-bold">
                    Incident Execution Progress
                  </span>
                  <h3 className="text-lg font-bold text-[#FAF6EE]">
                    {completedActions} of {totalActions} actions completed ({progressPercentage}%)
                  </h3>
                </div>

                {assessment.status !== 'RESOLVED' ? (
                  <button
                    onClick={handleMarkResolved}
                    className="px-4 py-2 rounded-xl bg-[#B98972] hover:bg-[#A87963] text-[#FAF6EE] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <CheckCircle size={16} weight="bold" />
                    <span>Mark Incident as Resolved</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#81C784] font-bold">
                    <CheckCircle size={18} weight="fill" />
                    <span>Incident Fully Remediated</span>
                  </div>
                )}
              </div>

              {/* Progress bar line */}
              <div className="w-full h-3 rounded-full bg-[#172744] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-[#B98972] transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP-BY-STEP RESPONSE PLAN (STEPS 01 TO 06)                                */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-editorial font-bold text-[#101C35]">
                    Recommended Response Steps
                  </h2>
                  <p className="text-xs text-[#5A544F]">
                    Sequential containment, eradication, and forensic recovery playbook.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const allOpen = Object.values(expandedStepIds).every(Boolean);
                    const toggled: Record<string, boolean> = {};
                    assessment.steps.forEach((s) => {
                      toggled[s.id] = !allOpen;
                    });
                    setExpandedStepIds(toggled);
                  }}
                  className="text-xs font-mono text-[#B98972] hover:underline cursor-pointer"
                >
                  {Object.values(expandedStepIds).every(Boolean) ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              <div className="space-y-4">
                {assessment.steps.map((step) => {
                  const isExpanded = expandedStepIds[step.id] ?? true;
                  const stepCompletedCount = step.actions.filter((a) => a.completed).length;
                  const isStepComplete = stepCompletedCount === step.actions.length;

                  return (
                    <div
                      key={step.id}
                      className={`rounded-3xl border transition-all ${
                        isStepComplete
                          ? 'bg-[#F4F9F4] border-[#C8E6C9]'
                          : 'bg-[#F8F6F2] border-[#E5DED7] shadow-xs'
                      }`}
                    >
                      {/* Step Header */}
                      <div
                        onClick={() =>
                          setExpandedStepIds((prev) => ({
                            ...prev,
                            [step.id]: !isExpanded
                          }))
                        }
                        className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                              isStepComplete
                                ? 'bg-[#2E7D32] text-[#FAF6EE]'
                                : 'bg-[#101C35] text-[#FAF6EE]'
                            }`}
                          >
                            {isStepComplete ? <Check size={16} weight="bold" /> : step.stepNumber.replace('STEP ', '')}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#B98972] font-bold">
                                {step.stepNumber}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                  step.priority === 'CRITICAL'
                                    ? 'bg-[#8A1E35] text-[#FAF6EE]'
                                    : step.priority === 'HIGH'
                                    ? 'bg-[#B98972] text-[#FAF6EE]'
                                    : 'bg-[#EDE4D6] text-[#101C35]'
                                }`}
                              >
                                {step.priority}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-[#101C35]">
                              {step.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-[#5A544F] hidden sm:inline">
                            {stepCompletedCount} / {step.actions.length} done
                          </span>
                          <span className="text-[#101C35]">
                            {isExpanded ? <CaretDown size={18} /> : <CaretRight size={18} />}
                          </span>
                        </div>
                      </div>

                      {/* Step Body (Expanded) */}
                      {isExpanded && (
                        <div className="px-5 pb-6 sm:px-6 space-y-4 border-t border-[#E5DED7] pt-4">
                          <p className="text-xs text-[#5A544F] leading-relaxed">
                            {step.summary}
                          </p>

                          {/* Action Checklist */}
                          <div className="space-y-2.5">
                            {step.actions.map((act) => (
                              <div
                                key={act.id}
                                onClick={() => toggleActionCompletion(step.id, act.id)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                                  act.completed
                                    ? 'bg-[#FAF6EE] border-[#C8E6C9] opacity-80'
                                    : 'bg-[#FAF6EE] hover:bg-[#EDE4D6] border-[#E5DED7]'
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                    act.completed
                                      ? 'bg-[#2E7D32] border-[#2E7D32] text-[#FAF6EE]'
                                      : 'border-[#CDBFA7] bg-[#FAF6EE]'
                                  }`}
                                >
                                  {act.completed && <Check size={13} weight="bold" />}
                                </div>

                                <div className="space-y-0.5 text-xs">
                                  <span
                                    className={`font-bold block ${
                                      act.completed ? 'line-through text-[#77736F]' : 'text-[#101C35]'
                                    }`}
                                  >
                                    {act.label}
                                  </span>
                                  <p className="text-[#5A544F] text-[11px] leading-relaxed">
                                    {act.detail}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* AI ASSISTANT PANEL: NEED HELP UNDERSTANDING A STEP?                       */}
            {/* ========================================================================= */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F6F2] border border-[#E5DED7] shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#101C35] text-[#D7B5A3] flex items-center justify-center">
                  <ChatCircleDots size={22} weight="fill" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-editorial text-[#101C35]">
                    Need help understanding a step?
                  </h3>
                  <p className="text-xs text-[#5A544F]">
                    Ask in simple language about containment rationale, forensic preservation, or statutory reporting.
                  </p>
                </div>
              </div>

              {/* Quick Prompt Pill Buttons */}
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('What does containment mean?')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#EDE4D6] border border-[#E5DED7] text-[#101C35] transition-colors cursor-pointer"
                >
                  What does containment mean?
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Why should I isolate the system?')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#EDE4D6] border border-[#E5DED7] text-[#101C35] transition-colors cursor-pointer"
                >
                  Why should I isolate the system?
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('What should I do first?')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#EDE4D6] border border-[#E5DED7] text-[#101C35] transition-colors cursor-pointer"
                >
                  What should I do first?
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('How do I preserve evidence?')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#EDE4D6] border border-[#E5DED7] text-[#101C35] transition-colors cursor-pointer"
                >
                  How do I preserve evidence?
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('When do I report to CERT-In or regulators?')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#EDE4D6] border border-[#E5DED7] text-[#101C35] transition-colors cursor-pointer"
                >
                  Regulatory / CERT-In timing?
                </button>
              </div>

              {/* Chat Message History */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#101C35] text-[#FAF6EE] ml-8'
                        : 'bg-[#FAF6EE] text-[#101C35] border border-[#E5DED7] mr-8'
                    }`}
                  >
                    <span className="text-[10px] font-mono block opacity-75 mb-1 font-bold">
                      {msg.sender === 'user' ? 'YOU' : 'RESPONSE ASSISTANT'}
                    </span>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question (e.g., 'Should I pay the ransom?', 'How do I take a memory dump?')..."
                  className="flex-1 p-3 rounded-xl bg-[#FAF6EE] border border-[#CDBFA7] text-[#101C35] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#B98972]"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#101C35] hover:bg-[#172744] text-[#FAF6EE] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Ask</span>
                  <PaperPlaneTilt size={14} />
                </button>
              </form>
            </div>

            {/* BOTTOM ACTIONS BAR */}
            <div className="p-6 rounded-3xl bg-[#FAF6EE] border border-[#E5DED7] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#5A544F]">
                <span className="font-bold text-[#101C35] block">
                  Incident State Stored Locally
                </span>
                Progress is preserved across page refreshes under CyberCPR session persistence.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportPlaybook}
                  className="px-5 py-2.5 rounded-xl bg-[#B98972] hover:bg-[#A87963] text-[#FAF6EE] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <DownloadSimple size={15} />
                  <span>Download Incident Playbook</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] hover:bg-[#EDE4D6] text-[#101C35] text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  Start New Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
