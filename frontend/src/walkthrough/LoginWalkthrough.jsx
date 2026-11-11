import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, ChevronRight, ChevronLeft, X, Copy, Check, Eye, EyeOff, Users, Stethoscope, ShieldCheck } from 'lucide-react';
import './LoginWalkthrough.css';

const DEMO_CREDENTIALS = {
  admin: {
    role: 'Admin',
    icon: <ShieldCheck size={20} />,
    description: 'You run the show — set up the clinic, add staff, and keep everything running smoothly.',
    email: 'admin@globalapex.com',
    password: 'Admin@123',
    color: '#31a3dd',
    features: [
      'Set clinic hours & working days',
      'Add or remove staff members',
      'Create doctor profiles',
      'View activity history',
    ],
  },
  receptionist: {
    role: 'Receptionist',
    icon: <Users size={20} />,
    description: 'The front desk — register patients, schedule visits, and check people in when they arrive.',
    email: 'frontdesk@citadel.com',
    password: '123456789',
    color: '#7db921',
    features: [
      'Add & look up patients',
      'Book & reschedule appointments',
      'Check in patients on arrival',
      'See which doctors are available',
    ],
  },
  doctor: {
    role: 'Doctor',
    icon: <Stethoscope size={20} />,
    description: 'Your personal dashboard — you\'ll only see your own patients and appointments, nothing else.',
    email: 'cvelaryon@citadel.com',
    password: '123456789',
    color: '#f39c12',
    features: [
      'See only your appointments',
      'Mark visits as complete & add notes',
      'Private view — other doctors\' data is hidden',
      'Focused, distraction-free workspace',
    ],
  },
};

const WALKTHROUGH_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to MedLayer',
    subtitle: 'Global Apex Multispeciality Hospital',
    content: 'Let\'s get you started! This quick guide will show you how to log in and explore the app with ready-to-use demo accounts.',
    highlight: null,
  },
  {
    id: 'role-selector',
    title: 'Pick a Role',
    subtitle: 'Three ways to explore',
    content: 'Each person in the clinic sees a different view. Tap a role below to learn what that login can do.',
    highlight: 'role-tabs',
  },
  {
    id: 'credentials',
    title: 'Try It Out',
    subtitle: 'One-click login',
    content: 'Pick a role, then hit the button below to fill in the email & password for you — no typing needed.',
    highlight: 'credential-cards',
  },
  {
    id: 'login-form',
    title: 'Sign In',
    subtitle: 'You\'re all set',
    content: 'Just click "Sign In" once the fields are filled. You\'ll be taken straight to the right dashboard for your role.',
    highlight: 'login-form',
  },
  {
    id: 'demo-tip',
    title: 'Pro Tip for Demos',
    subtitle: 'The best way to show it off',
    content: 'Start as the Receptionist to show off the full patient list and busy schedule. Then switch to a Doctor login to see how each doctor only sees their own patients — great for showing privacy & security.',
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
        <span>Guide</span>
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
              <h3 className="wt-title">Quick Start Guide</h3>
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
                Use This Login
              </button>

              <div className="wt-features">
                <span className="wt-features-label">What you'll see inside:</span>
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
                  <strong>Sign in as the Receptionist</strong>
                  <p>Samwell Tarly — <code>frontdesk@citadel.com</code></p>
                  <p className="wt-demo-action">Browse all 35 patients & the day's schedule</p>
                </div>
              </div>
              <div className="wt-demo-arrow">↓</div>
              <div className="wt-demo-step">
                <div className="wt-demo-number" style={{ background: '#7db921' }}>2</div>
                <div>
                  <strong>Check in a patient</strong>
                  <p>Find <strong>Jorah Mormont</strong> and mark him as <span style={{ color: '#f39c12' }}>Checked-In</span></p>
                </div>
              </div>
              <div className="wt-demo-arrow">↓</div>
              <div className="wt-demo-step">
                <div className="wt-demo-number" style={{ background: '#f39c12' }}>3</div>
                <div>
                  <strong>Switch to a Doctor login</strong>
                  <p>Dr. Corlys Velaryon — <code>cvelaryon@citadel.com</code></p>
                  <p className="wt-demo-action">
                    He only sees <strong>Jaime Lannister</strong> (his patient) — everyone else is hidden!
                  </p>
                </div>
              </div>
              <div className="wt-demo-arrow">↓</div>
              <div className="wt-demo-step">
                <div className="wt-demo-number" style={{ background: '#31a3dd' }}>4</div>
                <div>
                  <strong>Finish a visit</strong>
                  <p>Click Complete on Jaime's appointment & add notes</p>
                </div>
              </div>

              <div className="wt-all-doctors">
                <span className="wt-features-label">All 12 doctors — same password: <code>123456789</code></span>
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

