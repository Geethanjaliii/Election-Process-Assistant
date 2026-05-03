import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

type StepId = 'registration' | 'verification' | 'ballotDay' | 'counting' | 'results';

type ModalType = 'assistant' | 'eligibility' | 'documents' | 'address' | 'onboarding' | null;

type AssistantMessage = {
  role: 'user' | 'assistant';
  text: string;
};

type Step = {
  id: StepId;
  shortLabel: string;
  title: string;
  subtitle: string;
  summary: string;
  whatHappens: string;
  whyItMatters: string;
  whatToDo: string;
  actionHint: string;
  quickActions: string[];
  suggestedQuestions: string[];
  assistantFocus: string;
};

const steps: Step[] = [
  {
    id: 'registration',
    shortLabel: 'Registration',
    title: 'Registration',
    subtitle: 'Start your voter journey by confirming eligibility and details.',
    summary: 'Confirm that your voter record is in place and that your details match official records.',
    whatHappens:
      'Your identity and voting address are captured so you can appear in the correct electoral roll.',
    whyItMatters:
      'Registration is the gatekeeper. If it is incomplete, every later step becomes harder.',
    whatToDo:
      'Check your name, confirm your address, and gather any required identity documents.',
    actionHint: 'Start with eligibility and documents. Those two checks remove the most common blockers.',
    quickActions: ['Check eligibility', 'Review documents', 'Update address'],
    suggestedQuestions: ['How do I register?', 'What documents are needed?', 'Can I update my address?'],
    assistantFocus: 'Help the voter confirm they are ready to appear on the roll.',
  },
  {
    id: 'verification',
    shortLabel: 'Verification',
    title: 'Verification',
    subtitle: 'Authorities review submitted details before approval.',
    summary: 'Your application is checked so the record is valid and ready for the next stage.',
    whatHappens:
      'Election officials verify records, resolve mismatches, and confirm that your application is valid.',
    whyItMatters:
      'This step prevents duplicate entries and ensures your ballot will be counted correctly.',
    whatToDo:
      'Watch for status updates and respond quickly if extra information is requested.',
    actionHint: 'Track your status and fix any mismatch quickly to avoid delays.',
    quickActions: ['Track status', 'Fix mismatch', 'Upload proof'],
    suggestedQuestions: ['Why is my application pending?', 'How do I fix a mismatch?', 'What proof should I upload?'],
    assistantFocus: 'Explain what verification means and what documents might be requested.',
  },
  {
    id: 'ballotDay',
    shortLabel: 'Polling Day',
    title: 'Polling Day',
    subtitle: 'You cast your vote at the assigned station or method.',
    summary: 'Go to the right place, bring the required ID, and vote during the official window.',
    whatHappens:
      'Your name is checked, your ballot is issued, and you complete the voting process securely.',
    whyItMatters:
      'This is the core civic action. A smooth arrival and check-in reduces delays for everyone.',
    whatToDo:
      'Carry the required ID, arrive early, and review the ballot instructions before voting.',
    actionHint: 'Bring your ID, check your polling place, and plan travel before the day arrives.',
    quickActions: ['Find polling place', 'See ID rules', 'Plan travel'],
    suggestedQuestions: ['What should I bring?', 'Can I vote without ID?', 'Where do I vote?'],
    assistantFocus: 'Give a practical checklist for voting day logistics.',
  },
  {
    id: 'counting',
    shortLabel: 'Counting',
    title: 'Counting',
    subtitle: 'Ballots are secured, opened, and tallied under formal procedures.',
    summary: 'Votes are tallied in batches and checked carefully before any result is confirmed.',
    whatHappens:
      'Officials verify ballot integrity, count votes, and reconcile totals from each location.',
    whyItMatters:
      'Counting is where trust in the process becomes visible through checks and transparency.',
    whatToDo:
      'Follow official updates and understand that early results can change as more ballots are processed.',
    actionHint: 'Watch the official count and treat early numbers as provisional.',
    quickActions: ['Understand tally', 'See safeguards', 'Review timeline'],
    suggestedQuestions: ['How are votes counted?', 'Why do numbers change?', 'What safeguards exist?'],
    assistantFocus: 'Clarify why results can change as counts are finalized.',
  },
  {
    id: 'results',
    shortLabel: 'Results',
    title: 'Results',
    subtitle: 'The final outcome is certified and published.',
    summary: 'The final outcome is certified after the official count and any required checks.',
    whatHappens:
      'Official results are released, audits may continue, and the new mandate moves into governance.',
    whyItMatters:
      'Results close the loop and connect the voter journey to the next phase of public service.',
    whatToDo:
      'Review the certification notes, understand turnout data, and learn how to stay engaged afterward.',
    actionHint: 'Read the certification summary and follow how the outcome is recorded.',
    quickActions: ['Read outcome', 'Learn certification', 'Stay involved'],
    suggestedQuestions: ['What does certification mean?', 'Where do I see the final result?', 'What happens next?'],
    assistantFocus: 'Help the voter understand what the final result means and what comes next.',
  },
];

const phaseLabels = ['Start', 'Review', 'Vote', 'Count', 'Finish'];

const assistantResponses: Record<StepId, Record<string, string>> = {
  registration: {
    'how do i register': 'You can register online or at a local office. Start by checking eligibility, then submit your identity and address details.',
    'what documents are needed': 'You usually need proof of identity and proof of address. Follow the local authority checklist to avoid delays.',
    'can i update my address': 'Yes. Update your address before the deadline so your voting record and polling place stay correct.',
  },
  verification: {
    'why is my application pending': 'Pending usually means the record needs another check. Look for a mismatch, missing proof, or a request for more information.',
    'how do i fix a mismatch': 'Correct the field that does not match your official documents and resubmit the requested proof.',
    'what proof should i upload': 'Upload clear ID and address proof. Use a readable scan or photo and make sure the details are not cropped.',
  },
  ballotDay: {
    'what should i bring': 'Bring the ID or voter slip required in your area. It helps to carry any confirmation message or polling details too.',
    'can i vote without id': 'Rules vary by location, but ID is usually required. Check your local guidance before election day.',
    'where do i vote': 'Vote at your assigned polling place or approved voting location. Use the address listed in your voter record.',
  },
  counting: {
    'how are votes counted': 'Votes are counted in secured batches with verification steps in between. That keeps the tally accurate and auditable.',
    'why do numbers change': 'Early numbers are often partial. As more ballots are processed, the totals can shift before final certification.',
    'what safeguards exist': 'Common safeguards include sealed transport, observers, reconciliation checks, and audit trails.',
  },
  results: {
    'what does certification mean': 'Certification confirms the result after checks, audits, and any required recounts are complete.',
    'where do i see the final result': 'Final results are posted by the official election authority after counting is finished and verified.',
    'what happens next': 'The result moves into the governance stage, and civic engagement continues through local updates and future elections.',
  },
};

function normalizeQuestion(question: string) {
  return question.toLowerCase().replace(/[?.!,]/g, '').trim();
}

function getStepIndex(stepId: StepId) {
  return steps.findIndex((step) => step.id === stepId);
}

function getNextStep(stepId: StepId) {
  const index = getStepIndex(stepId);
  return steps[index + 1] ?? steps[index];
}

function getAssistantGreeting(step: Step, firstTimeVoter: boolean | null) {
  if (firstTimeVoter) {
    return `Simple guide for ${step.title.toLowerCase()}: ${step.assistantFocus}`;
  }

  return `Quick summary for ${step.title.toLowerCase()}: ${step.summary}`;
}

function App() {
  const [activeStepId, setActiveStepId] = useState<StepId>('registration');
  const [selectedQuickAction, setSelectedQuickAction] = useState('Check eligibility');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [firstTimeVoter, setFirstTimeVoter] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const stored = window.localStorage.getItem('epa.firstTimeVoter');
    return stored === null ? null : stored === 'yes';
  });
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [addressForm, setAddressForm] = useState({ name: '', address: '' });
  const [addressConfirmation, setAddressConfirmation] = useState('');

  const activeStep = useMemo(
    () => steps.find((step) => step.id === activeStepId) ?? steps[0],
    [activeStepId],
  );

  const activeIndex = getStepIndex(activeStep.id);
  const nextStep = getNextStep(activeStep.id);
  const completionProgress = Math.round(((activeIndex + 1) / steps.length) * 100);
  const isFirstTimeVoter = firstTimeVoter === true;
  const currentWhatHappens = isFirstTimeVoter ? activeStep.whatHappens : activeStep.summary;
  const currentWhatToDo = isFirstTimeVoter ? activeStep.whatToDo : activeStep.actionHint;
  const currentAssistantGreeting = getAssistantGreeting(activeStep, firstTimeVoter);

  useEffect(() => {
    if (activeModal !== 'assistant') {
      return;
    }

    if (assistantMessages.length === 0) {
      setAssistantMessages([
        { role: 'assistant', text: currentAssistantGreeting },
      ]);
      setAssistantInput('');
    }
  }, [activeModal, assistantMessages.length, currentAssistantGreeting]);

  useEffect(() => {
    if (firstTimeVoter === null) {
      setActiveModal('onboarding');
    }
  }, [firstTimeVoter]);

  useEffect(() => {
    if (typeof window === 'undefined' || firstTimeVoter === null) {
      return;
    }

    window.localStorage.setItem('epa.firstTimeVoter', firstTimeVoter ? 'yes' : 'no');
  }, [firstTimeVoter]);

  function openModal(modal: ModalType) {
    setActiveModal(modal);
  }

  function closeModal() {
    setActiveModal(null);
  }

  function resolveAssistantResponse(question: string) {
    const normalizedQuestion = normalizeQuestion(question);
    const responses = assistantResponses[activeStep.id];

    for (const [key, response] of Object.entries(responses)) {
      if (normalizedQuestion.includes(key)) {
        return response;
      }
    }

    return firstTimeVoter
      ? 'I can break that into a simpler step. Try one of the suggested questions below.'
      : 'I can summarize that step. Pick one of the suggested questions or ask in your own words.';
  }

  function submitAssistantQuestion(question: string) {
    const trimmed = question.trim();

    if (!trimmed) {
      return;
    }

    const answer = resolveAssistantResponse(trimmed);
    setAssistantMessages((previous) => [
      ...previous,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: answer },
    ]);
    setAssistantInput('');
  }

  function handleAssistantSuggestion(question: string) {
    setAssistantInput(question);
    submitAssistantQuestion(question);
  }

  function handleQuickAction(action: string) {
    setSelectedQuickAction(action);

    if (action === 'Check eligibility') {
      openModal('eligibility');
      return;
    }

    if (action === 'Review documents') {
      openModal('documents');
      return;
    }

    if (action === 'Update address') {
      openModal('address');
      return;
    }

    openModal('assistant');
    const answer = resolveAssistantResponse(action);
    setAssistantMessages([
      { role: 'assistant', text: currentAssistantGreeting },
      { role: 'user', text: action },
      { role: 'assistant', text: answer },
    ]);
    setAssistantInput('');
  }

  function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressConfirmation(`Address update request received for ${addressForm.name || 'the voter'}.`);
  }

  const quickReply = useMemo(() => {
    switch (selectedQuickAction) {
      case 'Check eligibility':
        return isFirstTimeVoter
          ? 'Start here. Check age, ID, and address rules before moving on.'
          : 'Eligibility usually depends on age, citizenship, and local registration rules.';
      case 'Review documents':
        return isFirstTimeVoter
          ? 'Gather your ID and address proof before submitting anything.'
          : 'Common checks include proof of identity and address.';
      case 'Update address':
        return isFirstTimeVoter
          ? 'Update early so your voting place and record stay correct.'
          : 'If your residence changed, update the record early.';
      case 'Track status':
        return 'Track the record so you can fix any mismatch or pending item quickly.';
      case 'Fix mismatch':
        return 'Correct the field that does not match your documents, then resubmit proof.';
      case 'Upload proof':
        return 'Use a clear scan or photo, and keep the details readable.';
      case 'Find polling place':
        return 'Use your assigned polling place and plan your route before election day.';
      case 'See ID rules':
        return 'ID rules differ by place. Verify the accepted IDs ahead of time.';
      case 'Plan travel':
        return 'Leave time for queues, traffic, and accessibility needs.';
      case 'Understand tally':
        return 'Tallying happens in secure batches to preserve accuracy.';
      case 'See safeguards':
        return 'Safeguards include sealed transport, observers, and reconciliation checks.';
      case 'Review timeline':
        return 'Follow the count in stages so partial returns do not feel final.';
      case 'Read outcome':
        return 'Look for totals, turnout, and certification notes in the final result.';
      case 'Learn certification':
        return 'Certification confirms the outcome after validation and any required checks.';
      case 'Stay involved':
        return 'Stay engaged through civic updates, meetings, and future registration windows.';
      default:
        return 'Choose a helpful action and I will tailor the guidance to this step.';
    }
  }, [selectedQuickAction, isFirstTimeVoter]);

  const assistantHistory = assistantMessages.length > 0
    ? assistantMessages
    : [{ role: 'assistant' as const, text: currentAssistantGreeting }];

  const suggestedQuestions = activeStep.suggestedQuestions.slice(0, 3);

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-left" />
      <div className="backdrop backdrop-right" />

      {activeModal === 'onboarding' ? (
        <div className="assistant-overlay" role="dialog" aria-modal="true" aria-label="Onboarding">
          <button
            type="button"
            className="assistant-overlay-backdrop"
            aria-label="Close onboarding"
            onClick={closeModal}
          />
          <section className="assistant-sheet onboarding-sheet">
            <div className="assistant-sheet-header">
              <div>
                <span className="detail-label">Personalization</span>
                <h3>Are you a first-time voter?</h3>
              </div>
            </div>
            <p className="onboarding-copy">
              Your choice changes how much detail we show and which actions get highlighted.
            </p>
            <div className="onboarding-actions">
              <button type="button" className="onboarding-choice primary" onClick={() => {
                setFirstTimeVoter(true);
                closeModal();
              }}>
                Yes
              </button>
              <button type="button" className="onboarding-choice" onClick={() => {
                setFirstTimeVoter(false);
                closeModal();
              }}>
                No
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <header className="hero">
        <div>
          <p className="eyebrow">Election Process Assistant</p>
          <h1>Follow the civic journey from registration to results.</h1>
          <p className="hero-copy">
            A guided, step-based experience that explains each phase, shows progress, and answers questions in context.
          </p>
        </div>
        <div className="hero-card">
          <span className="hero-card-label">Current phase</span>
          <strong>{activeStep.title}</strong>
          <p>{isFirstTimeVoter ? activeStep.subtitle : activeStep.summary}</p>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar panel">
          <div className="panel-title">
            <span>Journey map</span>
            <small>{activeIndex + 1} of {steps.length}</small>
          </div>

          <div className="step-list">
            {steps.map((step, index) => {
              const isActive = step.id === activeStep.id;
              const isComplete = index < activeIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  className={`step-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                  onClick={() => {
                    setActiveStepId(step.id);
                    setSelectedQuickAction(step.quickActions[0]);
                  }}
                >
                  <span className="step-marker">
                    <span className="step-number">{index + 1}</span>
                  </span>
                  <span className="step-copy">
                    <strong>{step.shortLabel}</strong>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="milestone-card">
            <p>Timeline</p>
            <div className="milestone-track">
              {phaseLabels.map((label, index) => (
                <div key={label} className={`milestone ${index <= activeIndex ? 'on' : ''}`}>
                  <span />
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="panel main-panel">
          <div className="main-panel-top">
            <div>
              <p className="eyebrow">Structured guidance</p>
              <h2>{activeStep.title}</h2>
              <p className="section-copy">{activeStep.subtitle}</p>
            </div>

            <div className="status-stack">
              <div className="status-card highlight">
                <span>Current phase</span>
                <strong>{activeStep.title}</strong>
              </div>
              <div className="status-card">
                <span>Next step</span>
                <strong>{nextStep.title}</strong>
              </div>
              <div className="status-card">
                <span>Completion progress</span>
                <strong>{completionProgress}%</strong>
              </div>
            </div>
          </div>

          <div className="mode-banner">
            <span>{isFirstTimeVoter ? 'First-time voter mode' : 'Summary mode'}</span>
            <p>{isFirstTimeVoter ? 'Simple explanations and highlighted actions are enabled.' : 'Concise summaries are enabled.'}</p>
          </div>

          <div className="content-grid">
            <article className="info-card accent">
              <span>What happens</span>
              <p>{currentWhatHappens}</p>
            </article>
            <article className="info-card">
              <span>What you should do</span>
              <p>{currentWhatToDo}</p>
            </article>
          </div>

          <details className="why-card">
            <summary>Why it matters</summary>
            <p>{activeStep.whyItMatters}</p>
          </details>

          <div className="quick-actions">
            {activeStep.quickActions.map((action, index) => (
              <button
                key={action}
                type="button"
                className={`quick-pill ${selectedQuickAction === action ? 'selected' : ''} ${index === 0 ? 'primary' : ''}`}
                onClick={() => handleQuickAction(action)}
              >
                {index === 0 ? <span className="pill-tag">Recommended</span> : null}
                <span className="pill-label">{action}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <button
        type="button"
        className="assistant-fab"
        onClick={() => openModal('assistant')}
      >
        Ask Assistant
      </button>

      {activeModal === 'assistant' ? (
        <div className="assistant-overlay" role="dialog" aria-modal="true" aria-label="Assistant">
          <button
            type="button"
            className="assistant-overlay-backdrop"
            aria-label="Close assistant"
            onClick={closeModal}
          />
          <section className="assistant-sheet">
            <div className="assistant-sheet-header">
              <div>
                <span className="detail-label">Context helper</span>
                <h3>{activeStep.shortLabel}</h3>
              </div>
              <button type="button" className="assistant-close" onClick={closeModal}>
                Close
              </button>
            </div>

            <div className="assistant-card chat-card">
              <div className="assistant-transcript">
                {assistantHistory.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
                    {message.text}
                  </div>
                ))}
              </div>

              <form
                className="assistant-input-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitAssistantQuestion(assistantInput);
                }}
              >
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  placeholder="Ask a question about this step"
                />
                <button type="submit">Ask</button>
              </form>

              <div className="assistant-bubble">
                <span>Suggested questions</span>
                <div className="assistant-prompts compact">
                  {suggestedQuestions.map((question) => (
                    <button key={question} type="button" onClick={() => handleAssistantSuggestion(question)}>
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div className="assistant-bubble current-guidance">
                <span>Current guidance</span>
                <p>{quickReply}</p>
              </div>
            </div>

          </section>
        </div>
      ) : null}

      {activeModal === 'eligibility' ? (
        <ActionModal title="Check Eligibility" onClose={closeModal}>
          <Checklist items={['Age >= 18', 'Valid ID', 'Registered address']} />
        </ActionModal>
      ) : null}

      {activeModal === 'documents' ? (
        <ActionModal title="Review Documents" onClose={closeModal}>
          <Checklist items={['ID proof', 'Address proof', 'Voter ID (if available)']} />
        </ActionModal>
      ) : null}

      {activeModal === 'address' ? (
        <ActionModal title="Update Address" onClose={closeModal}>
          <form className="address-form" onSubmit={handleAddressSubmit}>
            <label>
              Name
              <input
                type="text"
                value={addressForm.name}
                onChange={(event) => setAddressForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              Address
              <textarea
                rows={3}
                value={addressForm.address}
                onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))}
              />
            </label>
            <button type="submit" className="primary-action">Submit</button>
          </form>
          {addressConfirmation ? <p className="confirmation-copy">{addressConfirmation}</p> : null}
        </ActionModal>
      ) : null}
    </div>
  );
}

export default App;

function ActionModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="assistant-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="assistant-overlay-backdrop" aria-label={`Close ${title}`} onClick={onClose} />
      <section className="assistant-sheet action-sheet">
        <div className="assistant-sheet-header">
          <div>
            <span className="detail-label">Action</span>
            <h3>{title}</h3>
          </div>
          <button type="button" className="assistant-close" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="checklist">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}