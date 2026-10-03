// Dynamic Cyber Incident Response Workflows, Heuristic Classifier, and Guidance Knowledge Base

export type IncidentCategory =
  | 'Ransomware'
  | 'Phishing'
  | 'Malware'
  | 'Data Breach'
  | 'DDoS Attack'
  | 'Account Compromise'
  | 'Website Defacement'
  | 'Suspicious Activity'
  | 'Unknown / Not Sure'
  | 'Other';

export type SystemType =
  | 'Website'
  | 'Server'
  | 'Computer'
  | 'Email'
  | 'Database'
  | 'Cloud service'
  | 'User accounts'
  | 'Other';

export type UserImpact = 'One' | 'Few' | 'Many' | 'Everyone' | 'Unknown';
export type AccessibilityStatus = 'Yes' | 'Partially' | 'No' | 'Unknown';
export type SensitiveDataStatus = 'Yes' | 'No' | 'Unknown';
export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type IncidentStatus = 'ACTIVE' | 'CONTAINMENT' | 'INVESTIGATION' | 'ERADICATION' | 'RECOVERY' | 'RESOLVED';

export interface IncidentFormData {
  incidentType: IncidentCategory;
  isNotSure: boolean;
  problemDescription: string;
  startDate: string;
  startTime: string;
  affectedSystems: SystemType[];
  usersAffected: UserImpact;
  isAccessible: AccessibilityStatus;
  sensitiveDataAffected: SensitiveDataStatus;
  symptoms: string;
  actionsTaken: string;
  evidenceNotes: string;
  uploadedEvidenceName?: string;
}

export interface ResponseAction {
  id: string;
  label: string;
  detail: string;
  completed: boolean;
}

export interface ResponseStep {
  id: string;
  stepNumber: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  actions: ResponseAction[];
}

export interface IncidentAssessmentResult {
  classifiedType: IncidentCategory;
  originalType: IncidentCategory;
  classificationReasoning?: string;
  severity: IncidentSeverity;
  severityReasoning: string;
  status: IncidentStatus;
  affectedSystemsList: string;
  informationExposureRisk: string;
  isEmergency: boolean;
  emergencyReason?: string;
  timelineStage: number; // 0 to 6
  steps: ResponseStep[];
  timestamp: string;
  formData: IncidentFormData;
}

// Heuristic incident classifier for "I'm not sure" mode
export function classifyIncidentHeuristically(data: IncidentFormData): {
  category: IncidentCategory;
  reasoning: string;
} {
  const combinedText = `${data.problemDescription} ${data.symptoms} ${data.actionsTaken} ${data.affectedSystems.join(' ')}`.toLowerCase();

  if (
    combinedText.includes('ransom') ||
    combinedText.includes('encrypt') ||
    combinedText.includes('locked file') ||
    combinedText.includes('.lock') ||
    combinedText.includes('decrypt') ||
    combinedText.includes('ransom note') ||
    combinedText.includes('bitcoin') ||
    combinedText.includes('extortion')
  ) {
    return {
      category: 'Ransomware',
      reasoning: 'Extracted symptoms reference encrypted files, extortion notes, or locked file extensions characteristic of ransomware payloads.'
    };
  }

  if (
    combinedText.includes('ddos') ||
    combinedText.includes('flood') ||
    combinedText.includes('traffic spike') ||
    combinedText.includes('high traffic') ||
    combinedText.includes('unavailable') ||
    combinedText.includes('502') ||
    combinedText.includes('503') ||
    combinedText.includes('504 gateway') ||
    combinedText.includes('server timeout') ||
    combinedText.includes('down for everyone')
  ) {
    return {
      category: 'DDoS Attack',
      reasoning: 'Symptoms indicate abnormal request volumes, HTTP 502/503/504 gateway timeouts, or resource exhaustion causing service unavailability.'
    };
  }

  if (
    combinedText.includes('phish') ||
    combinedText.includes('suspicious email') ||
    combinedText.includes('fake login') ||
    combinedText.includes('spoofed') ||
    combinedText.includes('credential harvest') ||
    combinedText.includes('urgent invoice') ||
    combinedText.includes('clicked link') ||
    combinedText.includes('unusual sender')
  ) {
    return {
      category: 'Phishing',
      reasoning: 'Report mentions deceptive emails, fraudulent login portals, spoofed sender domains, or staff clicking unverified links.'
    };
  }

  if (
    combinedText.includes('leak') ||
    combinedText.includes('data dump') ||
    combinedText.includes('exfiltrat') ||
    combinedText.includes('database exposed') ||
    combinedText.includes('customer data') ||
    combinedText.includes('ssn') ||
    combinedText.includes('credit card') ||
    combinedText.includes('unauthorized download')
  ) {
    return {
      category: 'Data Breach',
      reasoning: 'Symptoms describe unauthorized database access, bulk record extraction, or sensitive customer records appearing outside internal controls.'
    };
  }

  if (
    combinedText.includes('deface') ||
    combinedText.includes('homepage changed') ||
    combinedText.includes('hacked by') ||
    combinedText.includes('unauthorized banner') ||
    combinedText.includes('modified page')
  ) {
    return {
      category: 'Website Defacement',
      reasoning: 'Report details unauthorized modifications to public-facing web pages, banner replacements, or visual tampering.'
    };
  }

  if (
    combinedText.includes('account locked') ||
    combinedText.includes('password changed') ||
    combinedText.includes('2fa prompt') ||
    combinedText.includes('mfa fatigue') ||
    combinedText.includes('unauthorized login') ||
    combinedText.includes('impossible travel') ||
    combinedText.includes('compromised account')
  ) {
    return {
      category: 'Account Compromise',
      reasoning: 'Indicators point to unauthorized user account access, rogue MFA prompts, password resets, or anomalous geographical logins.'
    };
  }

  if (
    combinedText.includes('trojan') ||
    combinedText.includes('miner') ||
    combinedText.includes('cpu 100%') ||
    combinedText.includes('powershell script') ||
    combinedText.includes('c2') ||
    combinedText.includes('antivirus alert') ||
    combinedText.includes('malware')
  ) {
    return {
      category: 'Malware',
      reasoning: 'System telemetry reports unauthorized executable processes, abnormal 100% CPU spikes, suspicious PowerShell invocation, or antivirus detections.'
    };
  }

  return {
    category: 'Suspicious Activity',
    reasoning: 'Based on the provided descriptions, the event displays abnormal operational behavior. Initial triage is required to confirm malicious origin.'
  };
}

// Compute incident severity
export function calculateSeverity(data: IncidentFormData, category: IncidentCategory): {
  severity: IncidentSeverity;
  reasoning: string;
  isEmergency: boolean;
  emergencyReason?: string;
} {
  let score = 0;
  const reasons: string[] = [];
  let isEmergency = false;
  let emergencyReason: string | undefined;

  // Sensitive data exposure is critical
  if (data.sensitiveDataAffected === 'Yes') {
    score += 3;
    reasons.push('Sensitive or private data is potentially compromised');
    isEmergency = true;
    emergencyReason = 'Sensitive customer, corporate, or financial information may be exposed. This may trigger statutory regulatory notification obligations (such as India DPDP Act 2023 or CERT-In 6-hour directions).';
  }

  // Active ransomware is emergency
  if (category === 'Ransomware') {
    score += 4;
    reasons.push('Active ransomware encryption causes critical operational stoppage');
    isEmergency = true;
    emergencyReason = 'Active ransomware infection detected. Immediate network isolation of affected segments is essential to halt lateral propagation to shared storage and backups.';
  }

  // System accessibility
  if (data.isAccessible === 'No') {
    score += 2;
    reasons.push('Critical systems are completely offline / unavailable');
  } else if (data.isAccessible === 'Partially') {
    score += 1;
    reasons.push('Systems are experiencing partial service degradation');
  }

  // User impact
  if (data.usersAffected === 'Everyone') {
    score += 3;
    reasons.push('Widespread impact affecting all users across the organization');
  } else if (data.usersAffected === 'Many') {
    score += 2;
    reasons.push('Significant user population impacted');
  }

  // Multiple systems compromised
  if (data.affectedSystems.length >= 3) {
    score += 2;
    reasons.push(`Multiple infrastructure layers impacted (${data.affectedSystems.join(', ')})`);
    if (data.affectedSystems.includes('Database') && data.affectedSystems.includes('Server')) {
      isEmergency = true;
      emergencyReason = emergencyReason || 'Core database and application server layers both impacted, risking systemic operational failure.';
    }
  }

  // Determine severity tier
  let severity: IncidentSeverity = 'LOW';
  if (score >= 6) {
    severity = 'CRITICAL';
  } else if (score >= 4) {
    severity = 'HIGH';
  } else if (score >= 2) {
    severity = 'MEDIUM';
  } else if (category === 'Unknown / Not Sure') {
    severity = 'UNKNOWN';
  } else {
    severity = 'LOW';
  }

  return {
    severity,
    reasoning: reasons.length > 0 ? reasons.join('; ') : 'Baseline triage score based on reported single-host symptoms.',
    isEmergency,
    emergencyReason
  };
}

// Generate tailored response plan workflows for each incident archetype
export function generateResponsePlan(category: IncidentCategory, data: IncidentFormData): ResponseStep[] {
  switch (category) {
    case 'Ransomware':
      return [
        {
          id: 'step-1',
          stepNumber: 'STEP 01',
          title: 'Stabilize the Situation',
          priority: 'CRITICAL',
          summary: 'Prevent operational panic and establish incident management command.',
          actions: [
            { id: 'act-1-1', label: 'Identify and confirm all encrypted devices', detail: 'Check servers, workstations, and network attached storage (NAS) displaying ransom extensions.', completed: false },
            { id: 'act-1-2', label: 'Designate primary Incident Coordinator', detail: 'Appoint an authorized lead to coordinate technical actions and executive communication.', completed: false },
            { id: 'act-1-3', label: 'Avoid rebooting affected systems immediately', detail: 'Powering down or rebooting may destroy volatile RAM memory containing encryption keys or injection artifacts.', completed: false },
            { id: 'act-1-4', label: 'Log the exact discovery timestamp', detail: 'Record when the ransom note or encryption was first observed for statutory compliance reporting.', completed: false }
          ]
        },
        {
          id: 'step-2',
          stepNumber: 'STEP 02',
          title: 'Contain the Incident',
          priority: 'CRITICAL',
          summary: 'Halt lateral encryption spread without deleting potential forensic artifacts.',
          actions: [
            { id: 'act-2-1', label: 'Physically disconnect Ethernet cables and disable Wi-Fi', detail: 'Isolate compromised machines from the internal network immediately to sever file-share mapping.', completed: false },
            { id: 'act-2-2', label: 'Disable connected shared network storage and cloud sync', detail: 'Unmount mapped drives (SMB/NFS) and pause automatic cloud file synchronization to preserve clean storage.', completed: false },
            { id: 'act-2-3', label: 'Isolate backup repositories immediately', detail: 'Ensure offline / immutable backup disks and write-once vaults are completely severed from network access.', completed: false },
            { id: 'act-2-4', label: 'Preserve copy of ransom note and sample encrypted file', detail: 'Take a clear screenshot and save the text note for threat intelligence and decryptor matching.', completed: false }
          ]
        },
        {
          id: 'step-3',
          stepNumber: 'STEP 03',
          title: 'Investigate',
          priority: 'HIGH',
          summary: 'Determine entry vector, ransomware family, and blast radius.',
          actions: [
            { id: 'act-3-1', label: 'Identify ransomware variant via hash or note', detail: 'Compare ransom note indicators against the No More Ransom public database (nomoreransom.org).', completed: false },
            { id: 'act-3-2', label: 'Inspect VPN, RDP, and firewall access logs', detail: 'Check for brute-force logon attempts or credential stuffing during the 48 hours preceding discovery.', completed: false },
            { id: 'act-3-3', label: 'Check for signs of data exfiltration before encryption', detail: 'Review outbound bandwidth logs for large unusual file transfers to untrusted IP addresses.', completed: false }
          ]
        },
        {
          id: 'step-4',
          stepNumber: 'STEP 04',
          title: 'Remove the Threat',
          priority: 'HIGH',
          summary: 'Eradicate malware binaries, backdoors, and scheduled persistence tasks.',
          actions: [
            { id: 'act-4-1', label: 'Re-image infected endpoints from clean trusted gold masters', detail: 'Do not attempt to salvage infected operating systems; re-image drives completely after forensic capture.', completed: false },
            { id: 'act-4-2', label: 'Revoke and reset all domain administrator and service credentials', detail: 'Assume elevated enterprise credentials were dumped via LSASS or Mimikatz prior to encryption.', completed: false },
            { id: 'act-4-3', label: 'Patch initial entry point vulnerability', detail: 'Patch the exposed VPN gateway, exposed RDP port, or vulnerable edge appliance that allowed entry.', completed: false }
          ]
        },
        {
          id: 'step-5',
          stepNumber: 'STEP 05',
          title: 'Recover',
          priority: 'HIGH',
          summary: 'Restore verified clean data and gradually return systems to production.',
          actions: [
            { id: 'act-5-1', label: 'Verify backup integrity and ensure snapshots predate intrusion', detail: 'Confirm backup archives were created prior to the initial threat actor dwell time.', completed: false },
            { id: 'act-5-2', label: 'Restore critical services in an isolated staging VLAN first', detail: 'Validate that restored systems boot cleanly and do not re-encrypt before reconnecting to core network.', completed: false },
            { id: 'act-5-3', label: 'Deploy enhanced endpoint detection (EDR) before reconnecting', detail: 'Ensure real-time process monitoring is active on all restored endpoints.', completed: false }
          ]
        },
        {
          id: 'step-6',
          stepNumber: 'STEP 06',
          title: 'Post-Incident Review',
          priority: 'MEDIUM',
          summary: 'Document lessons learned and implement long-term security hardening.',
          actions: [
            { id: 'act-6-1', label: 'Compile statutory incident report', detail: 'Submit formal notification within regulatory windows (CERT-In 6-hour directions or applicable local law).', completed: false },
            { id: 'act-6-2', label: 'Implement Multi-Factor Authentication across all external access', detail: 'Enforce phishing-resistant hardware MFA for all VPN, RDP, and cloud logins.', completed: false },
            { id: 'act-6-3', label: 'Establish immutable write-once read-many (WORM) backups', detail: 'Ensure future backups cannot be altered or encrypted even by compromised domain admin accounts.', completed: false }
          ]
        }
      ];

    case 'DDoS Attack':
      return [
        {
          id: 'step-1',
          stepNumber: 'STEP 01',
          title: 'Stabilize the Situation',
          priority: 'CRITICAL',
          summary: 'Confirm legitimate outage vs synthetic attack and notify key operational stakeholders.',
          actions: [
            { id: 'act-1-1', label: 'Confirm outage is not internal software bug or hardware failure', detail: 'Verify web server error logs and resource monitors (CPU, memory, database connection pool).', completed: false },
            { id: 'act-1-2', label: 'Establish out-of-band communication channel for incident team', detail: 'Use secondary channels (Slack, Signal, or phone) if internal mail and web servers are saturated.', completed: false },
            { id: 'act-1-3', label: 'Note the exact start time and initial request spike profile', detail: 'Document packet rate (PPS), bandwidth (Gbps), and request rate (RPS) for provider escalation.', completed: false }
          ]
        },
        {
          id: 'step-2',
          stepNumber: 'STEP 02',
          title: 'Contain the Incident',
          priority: 'CRITICAL',
          summary: 'Filter incoming flood traffic and activate upstream mitigation layers.',
          actions: [
            { id: 'act-2-1', label: 'Activate upstream Cloudflare, AWS Shield, or CDN DDoS protection', detail: 'Switch CDN or WAF posture to "Under Attack Mode" or aggressive bot challenge rate limiting.', completed: false },
            { id: 'act-2-2', label: 'Apply geographic or protocol rate-limiting at edge firewall', detail: 'Throttle or block request floods targeting heavy dynamic API endpoints like search or login.', completed: false },
            { id: 'act-2-3', label: 'Contact ISP / Hosting provider for upstream scrubbing', detail: 'Provide hosting NOC with target IP, port, and attack protocol (SYN flood, UDP reflection, HTTP GET flood).', completed: false }
          ]
        },
        {
          id: 'step-3',
          stepNumber: 'STEP 03',
          title: 'Investigate',
          priority: 'HIGH',
          summary: 'Analyze attack vector, source botnet IP distribution, and potential extortion demands.',
          actions: [
            { id: 'act-3-1', label: 'Determine DDoS attack type (Layer 3/4 network vs Layer 7 application)', detail: 'Check if flood is overwhelming network bandwidth (Volumetric) or exhausting database threads (Layer 7).', completed: false },
            { id: 'act-3-2', label: 'Identify dominant User-Agent, referer, or URI patterns', detail: 'Create targeted WAF regex rules to drop anomalous synthetic bot requests without challenging valid users.', completed: false },
            { id: 'act-3-3', label: 'Check for smoke-screen diversion tactics', detail: 'Verify database and authorization logs to ensure DDoS was not a distraction for data exfiltration.', completed: false }
          ]
        },
        {
          id: 'step-4',
          stepNumber: 'STEP 04',
          title: 'Remove the Threat',
          priority: 'MEDIUM',
          summary: 'Tune automated scrubbing filters and blackhole persistent attack traffic.',
          actions: [
            { id: 'act-4-1', label: 'Implement BGP Anycast routing or temporary DNS redirect to scrubbing center', detail: 'Route public traffic through high-capacity cloud mitigation scrubbers before hitting origin server.', completed: false },
            { id: 'act-4-2', label: 'Shield origin server IP addresses from direct internet access', detail: 'Ensure origin web servers only accept incoming traffic from verified CDN/WAF IP ranges.', completed: false }
          ]
        },
        {
          id: 'step-5',
          stepNumber: 'STEP 05',
          title: 'Recover',
          priority: 'HIGH',
          summary: 'Restore normal web service and monitor response latencies.',
          actions: [
            { id: 'act-5-1', label: 'Gradually ease rate-limiting thresholds once traffic normalizes', detail: 'Transition from aggressive challenge mode to standard rate limiting while monitoring server latency.', completed: false },
            { id: 'act-5-2', label: 'Restart stalled application application workers and database pools', detail: 'Clear stalled PHP-FPM, Node.js, or database worker pools clogged during peak flood.', completed: false },
            { id: 'act-5-3', label: 'Verify synthetic health checks from multiple external global locations', detail: 'Confirm website availability and SSL handshake times across diverse network providers.', completed: false }
          ]
        },
        {
          id: 'step-6',
          stepNumber: 'STEP 06',
          title: 'Post-Incident Review',
          priority: 'MEDIUM',
          summary: 'Strengthen edge capacity and establish automated failover policies.',
          actions: [
            { id: 'act-6-1', label: 'Document attack profile, peak bandwidth, and mitigation timeline', detail: 'Record metrics for technical post-mortem and executive availability reports.', completed: false },
            { id: 'act-6-2', label: 'Implement permanent multi-CDN failover configuration', detail: 'Configure automatic DNS failover between primary and backup CDN providers.', completed: false }
          ]
        }
      ];

    case 'Phishing':
      return [
        {
          id: 'step-1',
          stepNumber: 'STEP 01',
          title: 'Stabilize the Situation',
          priority: 'CRITICAL',
          summary: 'Identify the fraudulent message and isolate affected user mailboxes.',
          actions: [
            { id: 'act-1-1', label: 'Preserve complete original email headers and source code', detail: 'Export original .EML or .MSG file without modifying recipient or message body.', completed: false },
            { id: 'act-1-2', label: 'Identify all internal recipients who received the email', detail: 'Search mail server logs using Message-ID and sender domain to count total recipients.', completed: false },
            { id: 'act-1-3', label: 'Determine if any recipient opened attachments or entered credentials', detail: 'Interview recipients immediately to confirm who interacted with the link or entered passwords.', completed: false }
          ]
        },
        {
          id: 'step-2',
          stepNumber: 'STEP 02',
          title: 'Contain the Incident',
          priority: 'CRITICAL',
          summary: 'Revoke active sessions and prevent unauthorized account takeover.',
          actions: [
            { id: 'act-2-1', label: 'Reset passwords for all confirmed interacting users', detail: 'Perform forced password reset through administrator console with session invalidation.', completed: false },
            { id: 'act-2-2', label: 'Revoke all active web and mobile authentication sessions', detail: 'Invalidate OAuth tokens, refresh tokens, and active browser cookies in Microsoft 365 or Google Workspace.', completed: false },
            { id: 'act-2-3', label: 'Purge the malicious email from all user inboxes company-wide', detail: 'Execute tenant-wide hard delete or compliance purge to prevent unopened messages from being accessed.', completed: false }
          ]
        },
        {
          id: 'step-3',
          stepNumber: 'STEP 03',
          title: 'Investigate',
          priority: 'HIGH',
          summary: 'Examine spoofed landing page, malicious attachments, and mailbox rule tampering.',
          actions: [
            { id: 'act-3-1', label: 'Check compromised mailboxes for unauthorized forwarding rules', detail: 'Attackers commonly create auto-forwarding rules to external inboxes to silently monitor conversations.', completed: false },
            { id: 'act-3-2', label: 'Inspect sign-in logs for anomalous IP addresses or User-Agents', detail: 'Check for successful logins within minutes of the phishing delivery from unrecognized countries.', completed: false },
            { id: 'act-3-3', label: 'Analyze landing page domain and block across perimeter DNS / web proxy', detail: 'Add phishing domain and IP addresses to enterprise DNS firewall (e.g. Cisco Umbrella, Cloudflare Gateway).', completed: false }
          ]
        },
        {
          id: 'step-4',
          stepNumber: 'STEP 04',
          title: 'Remove the Threat',
          priority: 'HIGH',
          summary: 'Remove unauthorized mailbox modifications and report hostile infrastructure.',
          actions: [
            { id: 'act-4-1', label: 'Remove unauthorized mailbox delegates and forwarding rules', detail: 'Delete hidden inbox forwarding rules, OAuth app permissions, and delegate authorizations.', completed: false },
            { id: 'act-4-2', label: 'Report phishing domain to hosting provider and Google Safe Browsing', detail: 'Submit abuse report to domain registrar and hosting provider to initiate takedown.', completed: false }
          ]
        },
        {
          id: 'step-5',
          stepNumber: 'STEP 05',
          title: 'Recover',
          priority: 'MEDIUM',
          summary: 'Re-enable account access with enforced phishing-resistant MFA.',
          actions: [
            { id: 'act-5-1', label: 'Re-enroll user in FIDO2 / hardware token Multi-Factor Authentication', detail: 'Require hardware security key (YubiKey) or Microsoft Authenticator number matching to prevent MFA fatigue.', completed: false },
            { id: 'act-5-2', label: 'Monitor user mailbox sent folder for secondary phishing campaigns', detail: 'Verify the compromised account was not used to send secondary phishing lures to customers or vendors.', completed: false }
          ]
        },
        {
          id: 'step-6',
          stepNumber: 'STEP 06',
          title: 'Post-Incident Review',
          priority: 'MEDIUM',
          summary: 'Conduct awareness training and strengthen email authentication defenses.',
          actions: [
            { id: 'act-6-1', label: 'Verify SPF, DKIM, and DMARC enforcement policies', detail: 'Ensure enterprise email domains reject unauthenticated spoofed messages (p=reject).', completed: false },
            { id: 'act-6-2', label: 'Share sanitized indicator brief with team for threat awareness', detail: 'Educate personnel on the specific social engineering lure used in the campaign.', completed: false }
          ]
        }
      ];

    case 'Data Breach':
      return [
        {
          id: 'step-1',
          stepNumber: 'STEP 01',
          title: 'Stabilize the Situation',
          priority: 'CRITICAL',
          summary: 'Mobilize incident response counsel and verify scope of exposed records.',
          actions: [
            { id: 'act-1-1', label: 'Assemble Legal, Privacy, and IT Security incident leadership', detail: 'Engage designated Data Protection Officer (DPO) and legal counsel to govern disclosure protocols.', completed: false },
            { id: 'act-1-2', label: 'Identify exact database tables or file storage repositories involved', detail: 'Pinpoint affected AWS S3 buckets, SQL databases, customer CRM instances, or backup snapshots.', completed: false },
            { id: 'act-1-3', label: 'Do not modify or delete transaction audit logs', detail: 'Preserve immutable log archives to establish proof of accessed vs extracted record counts.', completed: false }
          ]
        },
        {
          id: 'step-2',
          stepNumber: 'STEP 02',
          title: 'Contain the Incident',
          priority: 'CRITICAL',
          summary: 'Sever unauthorized exfiltration channels and restrict database permissions.',
          actions: [
            { id: 'act-2-1', label: 'Revoke exposed API keys, service credentials, and database tokens', detail: 'Rotate database master passwords and invalidate all leaked access keys immediately.', completed: false },
            { id: 'act-2-2', label: 'Close unauthorized public access on cloud buckets or database ports', detail: 'Verify S3 Block Public Access is strictly enabled and database is isolated behind private VPC.', completed: false },
            { id: 'act-2-3', label: 'Terminate unauthorized active database connections and sessions', detail: 'Kill rogue database query threads and disconnect suspicious IP addresses at security group level.', completed: false }
          ]
        },
        {
          id: 'step-3',
          stepNumber: 'STEP 03',
          title: 'Investigate',
          priority: 'HIGH',
          summary: 'Determine exact volume, categories of compromised personal data, and exposure timeframe.',
          actions: [
            { id: 'act-3-1', label: 'Classify categories of compromised personal and confidential records', detail: 'Audit for PII (names, phone numbers, addresses), financial data (card/bank info), or health records.', completed: false },
            { id: 'act-3-2', label: 'Establish precise attack timeline from database query history', detail: 'Determine the earliest timestamp of unauthorized SELECT query execution and total rows returned.', completed: false },
            { id: 'act-3-3', label: 'Determine if exfiltrated records were encrypted at rest or in transit', detail: 'Document whether compromised files utilized AES-256 encryption with securely isolated keys.', completed: false }
          ]
        },
        {
          id: 'step-4',
          stepNumber: 'STEP 04',
          title: 'Remove the Threat',
          priority: 'HIGH',
          summary: 'Eliminate backend injection vulnerabilities and patch cloud misconfigurations.',
          actions: [
            { id: 'act-4-1', label: 'Fix underlying SQL injection, SSRF, or IAM privilege escalation vulnerability', detail: 'Deploy parameterized queries and enforce Least Privilege IAM roles on all microservices.', completed: false },
            { id: 'act-4-2', label: 'Audit perimeter code repositories for accidentally committed credentials', detail: 'Run automated secret scanner (TruffleHog/GitGuardian) across all GitHub/GitLab repositories.', completed: false }
          ]
        },
        {
          id: 'step-5',
          stepNumber: 'STEP 05',
          title: 'Recover',
          priority: 'HIGH',
          summary: 'Execute statutory breach notifications and deploy identity protection safeguards.',
          actions: [
            { id: 'act-5-1', label: 'Draft statutory regulatory notification within required legal windows', detail: 'India CERT-In 6-hour directions, DPDP Act 2023 provisions, or GDPR Article 33 notifications.', completed: false },
            { id: 'act-5-2', label: 'Prepare clear, empathetic customer communication and remediation guidance', detail: 'Notify impacted data principals with concrete steps (e.g. password resets, credit monitoring).', completed: false }
          ]
        },
        {
          id: 'step-6',
          stepNumber: 'STEP 06',
          title: 'Post-Incident Review',
          priority: 'MEDIUM',
          summary: 'Implement data minimization architecture and independent security audits.',
          actions: [
            { id: 'act-6-1', label: 'Implement field-level encryption for all sensitive customer records', detail: 'Enforce application-layer envelope encryption on database columns containing PII.', completed: false },
            { id: 'act-6-2', label: 'Engage accredited third-party cybersecurity firm for forensic audit', detail: 'Obtain formal external verification report confirming complete threat containment.', completed: false }
          ]
        }
      ];

    case 'Website Defacement':
      return [
        {
          id: 'step-1',
          stepNumber: 'STEP 01',
          title: 'Stabilize the Situation',
          priority: 'CRITICAL',
          summary: 'Preserve forensic evidence of defacement and temporarily put up maintenance page.',
          actions: [
            { id: 'act-1-1', label: 'Capture full browser screenshots, HTML source, and server timestamps', detail: 'Preserve exact visual proof and HTTP headers of defaced page for legal and forensic documentation.', completed: false },
            { id: 'act-1-2', label: 'Switch public web traffic to branded temporary maintenance page', detail: 'Display clean "System Maintenance" banner to prevent visitor alarm or reputational damage.', completed: false },
            { id: 'act-1-3', label: 'Preserve web server access logs and modified file metadata', detail: 'Export Apache/Nginx access logs and file timestamps (mtime/ctime) before overwriting files.', completed: false }
          ]
        },
        {
          id: 'step-2',
          stepNumber: 'STEP 02',
          title: 'Contain the Incident',
          priority: 'CRITICAL',
          summary: 'Restrict administrative access and freeze file system modifications.',
          actions: [
            { id: 'act-2-1', label: 'Revoke and reset all CMS (WordPress/Drupal/Custom), FTP, and SSH credentials', detail: 'Change all administrative passwords and invalidate active CMS cookie sessions.', completed: false },
            { id: 'act-2-2', label: 'Set web root directories to read-only permissions', detail: 'Prevent web server process from writing or editing index.html and core PHP/HTML files.', completed: false },
            { id: 'act-2-3', label: 'Block attacker IP address at cloud WAF / CDN level', detail: 'Filter traffic originating from attacker IP observed uploading defacement files.', completed: false }
          ]
        },
        {
          id: 'step-3',
          stepNumber: 'STEP 03',
          title: 'Investigate',
          priority: 'HIGH',
          summary: 'Identify the injection vector (plugin exploit, CMS vulnerability, stolen credentials).',
          actions: [
            { id: 'act-3-1', label: 'Diff current web root against version-controlled Git repository', detail: 'Identify every file modified, created, or injected (git status / git diff).', completed: false },
            { id: 'act-3-2', label: 'Scan web root for hidden web shells or PHP backdoors', detail: 'Search for eval(), base64_decode(), and anomalous uploads in media/asset directories.', completed: false },
            { id: 'act-3-3', label: 'Inspect file upload and administrative access logs', detail: 'Pinpoint the exact POST request or file upload script exploited to inject content.', completed: false }
          ]
        },
        {
          id: 'step-4',
          stepNumber: 'STEP 04',
          title: 'Remove the Threat',
          priority: 'HIGH',
          summary: 'Purge unauthorized files and patch exploited web application vulnerabilities.',
          actions: [
            { id: 'act-4-1', label: 'Restore web root completely from clean Git repository or trusted backup', detail: 'Deploy clean codebase build rather than manually attempting to edit modified files.', completed: false },
            { id: 'act-4-2', label: 'Update CMS core, plugins, themes, and server packages to latest patched versions', detail: 'Remediate known CVEs in web components that allowed unauthorized file writes.', completed: false }
          ]
        },
        {
          id: 'step-5',
          stepNumber: 'STEP 05',
          title: 'Recover',
          priority: 'HIGH',
          summary: 'Verify website integrity and re-open public traffic.',
          actions: [
            { id: 'act-5-1', label: 'Validate page integrity and SSL certificate status from external networks', detail: 'Confirm all pages display authentic company content and SSL certificates are intact.', completed: false },
            { id: 'act-5-2', label: 'Purge CDN and browser cache completely', detail: 'Clear Cloudflare / CDN edge caches to remove any lingering cached defaced versions.', completed: false }
          ]
        },
        {
          id: 'step-6',
          stepNumber: 'STEP 06',
          title: 'Post-Incident Review',
          priority: 'MEDIUM',
          summary: 'Deploy file integrity monitoring and automated deployment pipelines.',
          actions: [
            { id: 'act-6-1', label: 'Install File Integrity Monitoring (FIM / Tripwire / OSSEC)', detail: 'Configure instant alert notification if any file in production web root is modified.', completed: false },
            { id: 'act-6-2', label: 'Enforce Multi-Factor Authentication on all administrative portal logins', detail: 'Require 2FA for all WordPress, CMS, cPanel, and cloud hosting management consoles.', completed: false }
          ]
        }
      ];

    default: // Malware, Account Compromise, Suspicious Activity, Unknown
      return [
        {
          id: 'step-1',
          stepNumber: 'STEP 01',
          title: 'Stabilize the Situation',
          priority: 'CRITICAL',
          summary: 'Confirm affected systems and preserve current operating state for inspection.',
          actions: [
            { id: 'act-1-1', label: 'Confirm and document the affected systems and user accounts', detail: 'List all workstations, servers, or cloud accounts exhibiting anomalous telemetry.', completed: false },
            { id: 'act-1-2', label: 'Avoid making unnecessary configuration changes on affected systems', detail: 'Keep system logs intact and refrain from wiping disks until initial triage is complete.', completed: false },
            { id: 'act-1-3', label: 'Record discovery timestamp and assign response lead', detail: 'Establish who is leading the triage and maintain a continuous chronological action log.', completed: false }
          ]
        },
        {
          id: 'step-2',
          stepNumber: 'STEP 02',
          title: 'Contain the Incident',
          priority: 'CRITICAL',
          summary: 'Prevent unauthorized lateral movement and limit potential data exposure.',
          actions: [
            { id: 'act-2-1', label: 'Isolate affected devices from the local network and internet', detail: 'Disconnect network adapters or assign endpoints to a quarantine network segment.', completed: false },
            { id: 'act-2-2', label: 'Reset credentials and revoke active sessions for suspicious accounts', detail: 'Force password rotation and terminate existing browser / API sessions immediately.', completed: false },
            { id: 'act-2-3', label: 'Preserve system memory (RAM) and relevant event logs', detail: 'Capture volatile RAM dump if forensic analysis is required before powering down.', completed: false }
          ]
        },
        {
          id: 'step-3',
          stepNumber: 'STEP 03',
          title: 'Investigate',
          priority: 'HIGH',
          summary: 'Establish attack timeline, examine security alerts, and evaluate compromise scope.',
          actions: [
            { id: 'act-3-1', label: 'Review firewall, authentication, and endpoint detection logs', detail: 'Look for unexpected outbound connections, privilege escalations, or persistence mechanisms.', completed: false },
            { id: 'act-3-2', label: 'Determine whether sensitive company or customer data was accessed', detail: 'Analyze file access logs to verify if proprietary documents or databases were read.', completed: false },
            { id: 'act-3-3', label: 'Identify probable entry vector and initial compromise timestamp', detail: 'Correlate user activity and web traffic to establish how the anomaly entered the environment.', completed: false }
          ]
        },
        {
          id: 'step-4',
          stepNumber: 'STEP 04',
          title: 'Remove the Threat',
          priority: 'HIGH',
          summary: 'Remediate unauthorized changes, remove malicious artifacts, and patch flaws.',
          actions: [
            { id: 'act-4-1', label: 'Remove detected malicious software, scripts, or unauthorized accounts', detail: 'Eradicate malware binaries, unauthorized scheduled tasks, and rogue administrative users.', completed: false },
            { id: 'act-4-2', label: 'Apply security patches for exploited software vulnerabilities', detail: 'Update operating systems, third-party libraries, and firmware to patched versions.', completed: false }
          ]
        },
        {
          id: 'step-5',
          stepNumber: 'STEP 05',
          title: 'Recover',
          priority: 'HIGH',
          summary: 'Restore verified services from trusted sources and monitor health.',
          actions: [
            { id: 'act-5-1', label: 'Restore systems from verified clean backups or golden images', detail: 'Ensure restored files pre-date the detected initial compromise timestamp.', completed: false },
            { id: 'act-5-2', label: 'Deploy enhanced endpoint telemetry before restoring network access', detail: 'Monitor CPU utilization, active network sockets, and user authentication events.', completed: false }
          ]
        },
        {
          id: 'step-6',
          stepNumber: 'STEP 06',
          title: 'Post-Incident Review',
          priority: 'MEDIUM',
          summary: 'Document lessons learned and implement architectural hardening.',
          actions: [
            { id: 'act-6-1', label: 'Document root cause, remediation steps, and timeline in formal report', detail: 'Maintain comprehensive incident documentation for audit compliance and management review.', completed: false },
            { id: 'act-6-2', label: 'Update incident response playbooks and staff training based on findings', detail: 'Incorporate lessons learned into standard operating procedures and defense-in-depth controls.', completed: false }
          ]
        }
      ];
  }
}

// Pre-packaged AI assistant answers for prompt guidance
export const ASSISTANT_KNOWLEDGE: Record<string, string> = {
  'what does containment mean?':
    'Containment is the phase of incident response where you stop the threat from spreading or doing further damage without destroying evidence. This includes disconnecting network cables, isolating virtual machines, blocking IP addresses at the firewall, or invalidating compromised user session tokens.',
  'why should i isolate the system?':
    'Isolating an affected computer or server prevents malicious software or unauthorized attackers from moving laterally to other machines on your network, accessing backup files, or continuously stealing data. Disconnecting network access immediately limits the blast radius.',
  'what should i do first?':
    'First, stay calm and stabilize the situation. Do not immediately reboot or wipe the machine, as volatile memory contains vital evidence. Document the exact time of discovery, disconnect the device from the network (unplug Ethernet / turn off Wi-Fi), and designate a single coordinator to lead the response.',
  'how do i preserve evidence?':
    'To preserve evidence: avoid rebooting or running aggressive cleanup tools right away; take clear photos or screenshots of error messages and ransom notes; copy relevant log files to a clean external drive; and note down all observed symptoms and timestamps.',
  'should i pay a ransom?':
    'Security agencies worldwide, including CERT-In, CISA, and the FBI, strongly advise against paying ransoms. Payment does not guarantee that you will receive a working decryption key, funds criminal enterprises, and frequently causes victims to be targeted again. Priority should be given to restoring from clean, verified backups.',
  'when do i report to cert-in or regulators?':
    'Under the Indian CERT-In Directions 2022, critical cybersecurity incidents (including ransomware, data breaches, and large-scale attacks) must be reported within 6 hours of discovery. If personal data of citizens is compromised, notifications may also be required under the Digital Personal Data Protection (DPDP) Act 2023 or local privacy laws.'
};

export function getAssistantAnswer(query: string, category: IncidentCategory): string {
  const normalized = query.toLowerCase().trim();

  // Check direct matches
  for (const [key, answer] of Object.entries(ASSISTANT_KNOWLEDGE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return answer;
    }
  }

  if (normalized.includes('contain') || normalized.includes('isolate') || normalized.includes('disconnect')) {
    return ASSISTANT_KNOWLEDGE['what does containment mean?'];
  }

  if (normalized.includes('first') || normalized.includes('start') || normalized.includes('begin')) {
    return ASSISTANT_KNOWLEDGE['what should i do first?'];
  }

  if (normalized.includes('evidence') || normalized.includes('log') || normalized.includes('proof')) {
    return ASSISTANT_KNOWLEDGE['how do i preserve evidence?'];
  }

  if (normalized.includes('ransom') || normalized.includes('pay') || normalized.includes('extort')) {
    return ASSISTANT_KNOWLEDGE['should i pay a ransom?'];
  }

  if (normalized.includes('report') || normalized.includes('legal') || normalized.includes('cert') || normalized.includes('police')) {
    return ASSISTANT_KNOWLEDGE['when do i report to cert-in or regulators?'];
  }

  // Dynamic context answer based on category
  return `For a suspected ${category} incident, the critical priority is to complete STEP 01 (Stabilize) and STEP 02 (Contain). Focus on disconnecting affected systems from network shares, avoiding rapid reboots that wipe volatile memory, and verifying whether clean offline backups are available. Consult your designated IT administrator or incident response provider if sensitive information is exposed.`;
}
