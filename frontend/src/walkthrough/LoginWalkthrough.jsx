import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, ChevronRight, ChevronLeft, X, Copy, Check, Eye, EyeOff, Users, Stethoscope, ShieldCheck } from 'lucide-react';
import './LoginWalkthrough.css';

const DEMO_CREDENTIALS = {
  admin: {
    role: 'Admin',
    icon: <ShieldCheck size={20} />,
    description: 'Full system access — manage clinic settings, staff, doctors, and view audit logs.',
    email: 'admin@globalapex.com',
    password: 'Admin@123',
    color: '#31a3dd',
    features: [
      'Configure clinic hours & working days',
      'Manage staff accounts & roles',
      'Create & link doctor profiles',
      'Access audit logs & system settings',
    ],
  },
  receptionist: {
    role: 'Receptionist',
    icon: <Users size={20} />,
    description: 'Front desk operations — manage patients, book appointments, and handle check-ins.',
    email: 'frontdesk@citadel.com',
    password: '123456789',
    color: '#7db921',
    features: [
      'Register & search patients (35 patients)',
      'Book & manage appointments',
      'Check-in patients on arrival',
      'View doctor schedules & availability',
    ],
  },
  doctor: {
    role: 'Doctor',
    icon: <Stethoscope size={20} />,
    description: 'Role-based clinical view — see only your own patients and appointments (RBAC enforced).',
    email: 'cvelaryon@citadel.com',
    password: '123456789',
    color: '#f39c12',
    features: [
      'View only your assigned appointments',
      'Complete consultations & add notes',
      'Strict role-based access control',
      'Cannot see other doctors\' patients',
    ],
  },
};

const WALKTHROUGH_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to MedLayer',
    subtitle: 'Global Apex Multispeciality Hospital',
    content: 'This interactive walkthrough will guide you through the login process and help you explore the system using pre-configured demo credentials.',
    highlight: null,
  },
  {
    id: 'role-selector',
    title: 'Choose Your Role',
    subtitle: 'Three access levels available',
    content: 'MedLayer uses Role-Based Access Control (RBAC). Select a role tab to see role-specific portal access. Each role sees a different view of the system.',
    highlight: 'role-tabs',
  },
  {
    id: 'credentials',
    title: 'Demo Credentials',
    subtitle: 'Quick-fill with one click',
    content: 'Use the credential cards below to auto-fill the login form. Each role has pre-configured credentials from the Global Apex Multispeciality Hospital demo dataset.',
    highlight: 'credential-cards',
  },
  {
    id: 'login-form',
    title: 'Sign In',
    subtitle: 'Enter your credentials',
    content: 'The email and password fields accept credentials for any role. The system will automatically detect your role and redirect you to the appropriate dashboard.',
    highlight: 'login-form',
  },
  {
    id: 'demo-tip',
    title: 'Demo Workflow Tip',
    subtitle: 'Impress your audience',
    content: 'Start as the Receptionist to show the patient registry and busy schedule. Then log in as a Doctor to demonstrate strict RBAC — they can only see their own patients.',
    highlight: null,
  },
];

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button className="wt-copy-btn" onClick={handleCopy} title="Copy">
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

const LoginWalkthrough = ({ onFillCredentials, onClose, isVisible }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isMinimized, setIsMinimized] = useState(false);
  const panelRef = useRef(null);

  const step = WALKTHROUGH_STEPS[currentStep];
  const cred = DEMO_CREDENTIALS[selectedRole];

  const nextStep = useCallback(() => {
    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleFill = (role) => {
    const c = DEMO_CREDENTIALS[role];
    if (onFillCredentials) {
      onFillCredentials(c.email, c.password, role);
    }
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (!isVisible || isMinimized) return;
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, isMinimized, nextStep, prevStep, onClose]);

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <button
        className="wt-minimized-btn"
        onClick={() => setIsMinimized(false)}
        title="Show Walkthrough"
      >
        <Activity size={18} />
        <span>Walkthrough</span>
      </button>
    );
  }

  return (
    <div className="wt-overlay">
      <div className="wt-panel" ref={panelRef}>
        {/* Header */}
        <div className="wt-header">
          <div className="wt-header-left">
            <Activity size={22} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h3 className="wt-title">MedLayer Walkthrough</h3>
              <span className="wt-step-count">
                Step {currentStep + 1} of {WALKTHROUGH_STEPS.length}
              </span>
            </div>
          </div>
          <div className="wt-header-actions">
            <button className="wt-icon-btn" onClick={() => setIsMinimized(true)} title="Minimize">
              <span style={{ fontSize: '18px', lineHeight: 1 }}>—</span>
            </button>
            <button className="wt-icon-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="wt-progress-track">
          <div
            className="wt-progress-fill"
            style={{ width: `${((currentStep + 1) / WALKTHROUGH_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="wt-body">
          <div className="wt-step-header">
            <h4 className="wt-step-title">{step.title}</h4>
            <p className="wt-step-subtitle">{step.subtitle}</p>
          </div>
          <p className="wt-step-content">{step.content}</p>

          {/* Role Selector — shown on steps 1-3 */}
          {(currentStep >= 1 && currentStep <= 3) && (
            <div className="wt-role-selector">
              {Object.entries(DEMO_CREDENTIALS).map(([key, val]) => (
                <button
                  key={key}
                  className={`wt-role-tab ${selectedRole === key ? 'active' : ''}`}
                  onClick={() => setSelectedRole(key)}
                  style={{
                    '--tab-color': val.color,
                  }}
                >
                  {val.icon}
                  <span>{val.role}</span>
                </button>
              ))}
            </div>
          )}

          {/* Credential Card — shown on steps 2-3 */}
          {(currentStep >= 2 && currentStep <= 3) && (
            <div className="wt-credential-card" style={{ '--card-accent': cred.color }}>
              <div className="wt-cred-header">
                <div className="wt-cred-icon" style={{ color: cred.color }}>
                  {cred.icon}
                </div>
                <div>
                  <strong className="wt-cred-role">{cred.role}</strong>
                  <p className="wt-cred-desc">{cred.description}</p>
                </div>
              </div>

              <div className="wt-cred-fields">
                <div className="wt-cred-field">
                  <label>Email</label>
                  <div className="wt-cred-value">
                    <code>{cred.email}</code>
                    <CopyButton text={cred.email} />
                  </div>
                </div>
                <div className="wt-cred-field">
                  <label>Password</label>
                  <div className="wt-cred-value">
                    <code>{cred.password}</code>
                    <CopyButton text={cred.password} />
                  </div>
                </div>
              </div>

              <button
                className="wt-fill-btn"
                onClick={() => handleFill(selectedRole)}
                style={{ background: cred.color }}
              >
                <ChevronRight size={16} />
                Auto-fill & Use These Credentials
              </button>

              <div className="wt-features">
                <span className="wt-features-label">What you'll see:</span>
                <ul>
                  {cred.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Welcome Illustration */}
          {currentStep === 0 && (
            <div className="wt-welcome-grid">
              {Object.entries(DEMO_CREDENTIALS).map(([key, val]) => (
                <div key={key} className="wt-welcome-card" style={{ '--card-accent': val.color }}>
                  <div className="wt-welcome-icon" style={{ color: val.color }}>
                    {val.icon}
                  </div>
                  <strong>{val.role}</strong>
                  <span className="wt-welcome-email">{val.email}</span>
                </div>
              ))}
            </div>
          )}

          {/* Demo Tip */}
          {currentStep === 4 && (
            <div className="wt-demo-flow">
              <div className="wt-demo-step">
                <div className="wt-demo-number" style={{ background: '#7db921' }}>1</div>
                <div>
                  <strong>Login as Receptionist</strong>
                  <p>Samwell Tarly — <code>frontdesk@citadel.com</code></p>
                  <p className="wt-demo-action">Show 35 patients & busy schedule</p>
                </div>
              </div>
              <div className="wt-demo-arrow">↓</div>
              <div className="wt-demo-step">
                <div className="wt-demo-number" style={{ background: '#7db921' }}>2</div>
                <div>
                  <strong>Check-in Jorah Mormont</strong>
                  <p>Search and mark as <span style={{ color: '#f39c12' }}>Checked-In</span></p>
                </div>
              </div>
              <div className="wt-demo-arrow">↓</div>
              <div className="wt-demo-step">
                <div className="wt-demo-number" style={{ background: '#f39c12' }}>3</div>
                <div>
                  <strong>Login as Dr. Corlys Velaryon</strong>
                  <p><code>cvelaryon@citadel.com</code></p>
                  <p className="wt-demo-action">
                    Only sees <strong>Jaime Lannister</strong> (Orthopedics) — RBAC in action!
                  </p>
                </div>
              </div>
              <div className="wt-demo-arrow">↓</div>
              <div className="wt-demo-step">
                <div className="wt-demo-number" style={{ background: '#31a3dd' }}>4</div>
                <div>
                  <strong>Complete Appointment</strong>
                  <p>Click Complete on Jaime's visit & add medical notes</p>
                </div>
              </div>

              <div className="wt-all-doctors">
                <span className="wt-features-label">All 12 Doctor Logins (password: <code>123456789</code>)</span>
                <div className="wt-doctor-grid">
                  {[
                    { name: 'Dr. Maester Aemon', email: 'aemon@citadel.com', spec: 'Cardiology' },
                    { name: 'Dr. Qyburn', email: 'qyburn@citadel.com', spec: 'Neurology' },
                    { name: 'Dr. Corlys Velaryon', email: 'cvelaryon@citadel.com', spec: 'Orthopedics' },
                    { name: 'Dr. Rhaenyra Targaryen', email: 'rtargaryen@citadel.com', spec: 'Pediatrics' },
                    { name: 'Dr. Alicent Hightower', email: 'ahightower@citadel.com', spec: 'Dermatology' },
                    { name: 'Dr. Daemon Targaryen', email: 'dtargaryen@citadel.com', spec: 'Oncology' },
                    { name: 'Dr. Ser Duncan', email: 'duncan@citadel.com', spec: 'Psychiatry' },
                    { name: 'Dr. Melisandre', email: 'melisandre@citadel.com', spec: 'Gastroenterology' },
                    { name: 'Dr. Otto Hightower', email: 'ohightower@citadel.com', spec: 'Endocrinology' },
                    { name: 'Dr. Grand Maester Pycelle', email: 'pycelle@citadel.com', spec: 'Ophthalmology' },
                    { name: 'Dr. Viserys Targaryen', email: 'vtargaryen@citadel.com', spec: 'Urology' },
                    { name: 'Dr. Aegon the Conqueror', email: 'aegon.c@citadel.com', spec: 'ENT' },
                  ].map((doc, i) => (
                    <div key={i} className="wt-doctor-row">
                      <span className="wt-doctor-name">{doc.name}</span>
                      <span className="wt-doctor-spec">{doc.spec}</span>
                      <code className="wt-doctor-email">{doc.email}</code>
                      <CopyButton text={doc.email} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="wt-footer">
          <button
            className="wt-nav-btn"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <div className="wt-dots">
            {WALKTHROUGH_STEPS.map((_, i) => (
              <button
                key={i}
                className={`wt-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
                onClick={() => setCurrentStep(i)}
              />
            ))}
          </div>
          {currentStep < WALKTHROUGH_STEPS.length - 1 ? (
            <button className="wt-nav-btn wt-nav-next" onClick={nextStep}>
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button className="wt-nav-btn wt-nav-next" onClick={onClose}>
              Get Started
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginWalkthrough;

