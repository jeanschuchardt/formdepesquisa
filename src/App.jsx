import { useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const FORM_SLUG = 'acolhimento-inicial';
const DYNAMIC_SUBMISSIONS_TABLE = 'dynamic_form_submissions';
const contactQuestionKeys = ['full_name', 'whatsapp', 'email', 'city', 'state', 'qualification'];

function TextField({ id, label, type = 'text', value, onChange, required = true, placeholder }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

function RadioGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="question choice-question">
      <legend>{legend}</legend>
      <div className="option-grid">
        {options.map((option) => (
          <label className="option" key={option}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              required
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxGroup({ legend, options, values, onChange }) {
  function toggleOption(option) {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    onChange([...values, option]);
  }

  return (
    <fieldset className="question choice-question">
      <legend>{legend}</legend>
      <p className="hint">Escolha uma ou mais opcoes.</p>
      <div className="option-grid">
        {options.map((option) => (
          <label className="option checkbox-option" key={option}>
            <input
              type="checkbox"
              value={option}
              checked={values.includes(option)}
              onChange={() => toggleOption(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function getInitialAnswers(questions) {
  return Object.fromEntries(
    questions.map((question) => [question.key, question.type === 'multi_choice' ? [] : ''])
  );
}

function buildFormSteps(questions) {
  return questions.map((question, index) => ({
    id: question.key,
    label: contactQuestionKeys.includes(question.key) ? 'Contato' : `Pergunta ${index + 1}`,
    questions: [question]
  }));
}

function getPlaceholder(question) {
  const placeholders = {
    full_name: 'Seu nome completo',
    whatsapp: '(00) 00000-0000',
    email: 'voce@email.com',
    state: 'UF ou estado',
    qualification: 'Profissao, ocupacao ou formacao',
    current_situation: 'Conte de forma breve o que esta acontecendo no momento.'
  };

  return placeholders[question.key];
}

function getInputType(question) {
  if (question.type === 'email') {
    return 'email';
  }

  if (question.type === 'phone') {
    return 'tel';
  }

  return 'text';
}

function getQuestionCopy(question) {
  const copyByKey = {
    full_name: {
      eyebrow: 'Primeiro passo',
      title: 'Me conta como posso te chamar?',
      helper: 'Use o nome que voce prefere que apareca na nossa conversa.'
    },
    whatsapp: {
      eyebrow: 'Contato',
      title: 'Qual WhatsApp podemos usar se precisarmos falar com voce?',
      helper: 'Use DDD e numero. Se preferir, pode repetir o contato principal.'
    },
    email: {
      eyebrow: 'Convite',
      title: 'Qual e o melhor e-mail para receber o convite?',
      helper: 'O link do Google Meet sera enviado para esse e-mail.'
    },
    city: {
      eyebrow: 'Contexto',
      title: 'Em qual cidade voce esta?',
      helper: 'Isso ajuda a entender fuso, contexto e disponibilidade.'
    },
    state: {
      eyebrow: 'Contexto',
      title: 'E em qual estado?',
      helper: 'Pode informar a UF ou o nome do estado.'
    },
    qualification: {
      eyebrow: 'Sobre voce',
      title: 'Como voce descreveria sua ocupacao hoje?',
      helper: 'Pode ser profissao, formacao, ocupacao atual ou area de atuacao.'
    },
    attention_area: {
      eyebrow: 'Momento atual',
      title: 'O que mais pede sua atencao neste momento?',
      helper: 'Escolha a opcao que mais se aproxima do que voce esta vivendo.'
    },
    duration: {
      eyebrow: 'Tempo',
      title: 'Isso vem acontecendo ha quanto tempo?',
      helper: 'Nao precisa ser exato. Escolha a faixa que fizer mais sentido.'
    },
    impact: {
      eyebrow: 'Impacto',
      title: 'Quanto isso tem impactado sua vida atualmente?',
      helper: 'Essa resposta ajuda a calibrar a conversa inicial.'
    },
    expected_outcomes: {
      eyebrow: 'Expectativas',
      title: 'O que voce gostaria de levar dessa conversa?',
      helper: 'Voce pode escolher mais de uma opcao.'
    },
    previous_process: {
      eyebrow: 'Caminho anterior',
      title: 'Voce ja participou de algum processo terapeutico?',
      helper: 'Isso ajuda a entender sua familiaridade com esse tipo de trabalho.'
    },
    investment_moment: {
      eyebrow: 'Momento de decisao',
      title: 'Se um acompanhamento fizer sentido, qual frase representa melhor seu momento?',
      helper: 'Nao existe resposta certa. A ideia e entender seu momento atual.'
    },
    online_availability: {
      eyebrow: 'Formato',
      title: 'Voce tem disponibilidade para sessoes online por video?',
      helper: 'A conversa gratuita acontece por Google Meet.'
    },
    referral_source: {
      eyebrow: 'Origem',
      title: 'Como voce conheceu este trabalho?',
      helper: 'Essa informacao ajuda a entender os canais de chegada.'
    },
    current_situation: {
      eyebrow: 'Para finalizar',
      title: 'Me conta brevemente o que voce esta vivendo hoje.',
      helper: 'Escreva o que sentir que e importante para preparar a conversa gratuita.'
    }
  };

  return copyByKey[question.key] || {
    eyebrow: 'Pergunta',
    title: question.label,
    helper: question.description
  };
}

function formatDateForInput(date) {
  return date.toISOString().slice(0, 10);
}

function formatSelectedDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  }).format(date);
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = firstDay.getDay();

  return [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))
  ];
}

function isSameDateValue(date, dateValue) {
  return formatDateForInput(date) === dateValue;
}

const emptySchedulingContact = {
  full_name: '',
  email: '',
  whatsapp: ''
};

function SchedulingPanel({ submittedData = null, standalone = false }) {
  const [contactData, setContactData] = useState(submittedData || emptySchedulingContact);
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalStep, setContactModalStep] = useState('details');
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState('');

  const hasSubmittedContact = Boolean(submittedData);
  const selectedSlotLabel = slots.find((slot) => slot.start === selectedSlot)?.label;
  const todayValue = formatDateForInput(new Date());
  const calendarDays = buildCalendarDays(visibleMonth);
  const canConfirm =
    Boolean(selectedSlot) &&
    Boolean(contactData.full_name.trim()) &&
    Boolean(contactData.email.trim()) &&
    !isBooking;

  function closeContactModal() {
    setIsContactModalOpen(false);
    setContactModalStep('details');
    setError('');
  }

  function openContactModal() {
    setContactModalStep('details');
    setIsContactModalOpen(true);
    setError('');
  }

  function openReviewModal() {
    if (!selectedSlot) {
      setError('Selecione um horario para continuar.');
      return;
    }

    setContactModalStep('review');
    setIsContactModalOpen(true);
    setError('');
  }

  function handleReviewBooking() {
    if (!selectedSlot) {
      setError('Selecione um horario para continuar.');
      return;
    }

    if (!contactData.full_name.trim() || !contactData.email.trim()) {
      setError('Informe nome e e-mail para revisar o agendamento.');
      return;
    }

    setError('');
    setContactModalStep('review');
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      setIsLoading(true);
      setError('');
      setBookingResult(null);

      try {
        const response = await fetch(`/api/availability?date=${selectedDate}`, {
          signal: controller.signal
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'Nao foi possivel carregar os horarios');
        }

        setSlots(payload.slots || []);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message);
          setSlots([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAvailability();

    return () => controller.abort();
  }, [selectedDate]);

  async function handleBooking() {
    if (!selectedSlot) {
      setError('Selecione um horario para continuar.');
      return;
    }

    if (!contactData.full_name.trim() || !contactData.email.trim()) {
      setError('Informe nome e e-mail para confirmar o agendamento.');
      return;
    }

    setIsBooking(true);
    setError('');

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: selectedSlot,
          name: contactData.full_name.trim(),
          email: contactData.email.trim(),
          whatsapp: contactData.whatsapp.trim()
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Nao foi possivel confirmar o agendamento');
      }

      setBookingResult(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBooking(false);
    }
  }

  if (bookingResult) {
    return (
      <section className="booking-success-panel" aria-live="polite">
        <div className="success-card">
          <div className="confirmation-mark" aria-hidden="true">✓</div>
          <p className="step-kicker">Agendamento confirmado</p>
          <h2>Sua conversa foi agendada</h2>
          <p>
            Enviamos o convite para {contactData.email}. Guarde este resumo e acesse o Google Meet
            pelo link abaixo quando chegar o horario.
          </p>

          <dl className="confirmation-details">
            <div>
              <dt>Data</dt>
              <dd>{formatSelectedDate(selectedDate)}</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>{selectedSlotLabel}</dd>
            </div>
            <div>
              <dt>Formato</dt>
              <dd>Google Meet</dd>
            </div>
          </dl>

          <div className="booking-links">
            {bookingResult.meetLink ? (
              <a className="schedule-button" href={bookingResult.meetLink} target="_blank" rel="noreferrer">
                Abrir Google Meet
              </a>
            ) : null}
            {bookingResult.htmlLink ? (
              <a className="secondary-link" href={bookingResult.htmlLink} target="_blank" rel="noreferrer">
                Ver evento no calendario
              </a>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="next-step-panel scheduling-flow calendly-flow" aria-live="polite">
      <aside className="schedule-summary" aria-label="Resumo do agendamento">
        <p className="summary-label">{standalone ? 'Sessao gratuita' : 'Proximo passo'}</p>
        <h3>{standalone ? 'Conversa inicial' : 'Agendamento da conversa'}</h3>
        <p className="event-description">
          Uma conversa online para entender o momento atual e combinar os proximos passos.
        </p>

        <dl>
          <div>
            <dt>Duracao</dt>
            <dd>30 minutos</dd>
          </div>
          <div>
            <dt>Formato</dt>
            <dd>Google Meet</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>{formatSelectedDate(selectedDate)}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>{selectedSlotLabel || 'Selecione um horario'}</dd>
          </div>
        </dl>
      </aside>

      <div className="schedule-main">
        <div className="section-heading">
          <p className="step-kicker">{standalone ? 'Agendamento' : 'Proximo passo'}</p>
          <h2>
            {standalone ? 'Escolha um horario para sua conversa' : 'Agora escolha um horario para a conversa'}
          </h2>
          <p>
            Os horarios abaixo sao calculados a partir da agenda. Cada conversa dura 30 minutos e o
            convite e enviado por e-mail.
          </p>
        </div>

        <div className="schedule-section">
          <div className="schedule-section-title">
            <span>1</span>
            <strong>Data e horario</strong>
          </div>

          <div className="date-time-layout">
            <div className="calendar-picker" aria-label="Calendario de datas disponiveis">
              <div className="calendar-toolbar">
                <strong>{formatMonthLabel(visibleMonth)}</strong>
                <div className="calendar-nav-group">
                  <button
                    className="calendar-nav"
                    type="button"
                    onClick={() =>
                      setVisibleMonth(
                        (currentMonth) =>
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                      )
                    }
                    aria-label="Mes anterior"
                  >
                    ‹
                  </button>
                  <button
                    className="calendar-nav"
                    type="button"
                    onClick={() =>
                      setVisibleMonth(
                        (currentMonth) =>
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                      )
                    }
                    aria-label="Proximo mes"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="calendar-weekdays" aria-hidden="true">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>

              <div className="calendar-days">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <span className="calendar-empty-day" key={`empty-${index}`} />;
                  }

                  const dateValue = formatDateForInput(day);
                  const isPast = dateValue < todayValue;
                  const isSelected = isSameDateValue(day, selectedDate);

                  return (
                    <button
                      className={isSelected ? 'calendar-day selected' : 'calendar-day'}
                      disabled={isPast}
                      key={dateValue}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dateValue);
                        setSelectedSlot('');
                        closeContactModal();
                      }}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="time-column" aria-label="Horarios disponiveis">
              <div className="slots-header">
                <strong>{formatSelectedDate(selectedDate)}</strong>
                {isLoading ? <span>Buscando horarios...</span> : <span>{slots.length} horarios</span>}
              </div>

              {isLoading ? (
                <div className="time-list" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span className="slot-skeleton" key={index} />
                  ))}
                </div>
              ) : slots.length > 0 ? (
                <div className="time-list">
                  {slots.map((slot) => (
                    <button
                      className={selectedSlot === slot.start ? 'slot-button selected' : 'slot-button'}
                      key={slot.start}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot.start);
                        if (!hasSubmittedContact) {
                          openContactModal();
                        }
                      }}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="week-empty">Nenhum horario disponivel para esta data.</p>
              )}

              {hasSubmittedContact ? (
                <button
                  className="schedule-button"
                  type="button"
                  onClick={openReviewModal}
                  disabled={!canConfirm}
                >
                  {selectedSlot ? 'Revisar agendamento' : 'Escolha um horario'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {error ? <p className="submit-error">Erro ao agendar: {error}</p> : null}
      </div>

      {isContactModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="contact-modal"
            role="dialog"
            aria-labelledby="contact-modal-title"
            aria-modal="true"
          >
            <button
              className="modal-close"
              type="button"
              onClick={closeContactModal}
              aria-label="Fechar dados de confirmacao"
            >
              ×
            </button>
            {contactModalStep === 'details' && !hasSubmittedContact ? (
              <>
                <div className="modal-heading">
                  <p className="summary-label">Seus dados</p>
                  <h2 id="contact-modal-title">Complete seus dados</h2>
                  <p>
                    Vamos enviar o convite para {formatSelectedDate(selectedDate)}
                    {selectedSlotLabel ? ` as ${selectedSlotLabel}` : ''}.
                  </p>
                </div>

                <div className="scheduling-contact-grid modal-contact-grid">
                  <TextField
                    id="schedule-full-name"
                    label="Nome completo"
                    value={contactData.full_name}
                    onChange={(value) => setContactData((current) => ({ ...current, full_name: value }))}
                    placeholder="Seu nome completo"
                  />
                  <TextField
                    id="schedule-email"
                    label="E-mail"
                    type="email"
                    value={contactData.email}
                    onChange={(value) => setContactData((current) => ({ ...current, email: value }))}
                    placeholder="voce@email.com"
                  />
                  <TextField
                    id="schedule-whatsapp"
                    label="WhatsApp"
                    type="tel"
                    value={contactData.whatsapp}
                    onChange={(value) => setContactData((current) => ({ ...current, whatsapp: value }))}
                    required={false}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {error ? <p className="submit-error">Erro ao agendar: {error}</p> : null}

                <div className="modal-actions">
                  <button className="secondary-button" type="button" onClick={closeContactModal}>
                    Cancelar
                  </button>
                  <button
                    className="schedule-button"
                    type="button"
                    onClick={handleReviewBooking}
                    disabled={!canConfirm}
                  >
                    Revisar agendamento
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-heading">
                  <p className="summary-label">Revise antes de enviar</p>
                  <h2 id="contact-modal-title">Confirmar agendamento?</h2>
                  <p>Confira os dados abaixo antes de criar o evento e enviar o convite.</p>
                </div>

                <dl className="review-details">
                  <div>
                    <dt>Nome</dt>
                    <dd>{contactData.full_name}</dd>
                  </div>
                  <div>
                    <dt>E-mail</dt>
                    <dd>{contactData.email}</dd>
                  </div>
                  <div>
                    <dt>WhatsApp</dt>
                    <dd>{contactData.whatsapp || 'Nao informado'}</dd>
                  </div>
                  <div>
                    <dt>Data</dt>
                    <dd>{formatSelectedDate(selectedDate)}</dd>
                  </div>
                  <div>
                    <dt>Horario</dt>
                    <dd>{selectedSlotLabel}</dd>
                  </div>
                </dl>

                {error ? <p className="submit-error">Erro ao agendar: {error}</p> : null}

                <div className="modal-actions review-actions">
                  <button className="secondary-button" type="button" onClick={closeContactModal}>
                    Cancelar
                  </button>
                  {!hasSubmittedContact ? (
                    <button className="secondary-button" type="button" onClick={() => setContactModalStep('details')}>
                      Editar dados
                    </button>
                  ) : null}
                  <button
                    className="schedule-button"
                    type="button"
                    onClick={handleBooking}
                    disabled={!canConfirm}
                  >
                    {isBooking ? 'Agendando...' : 'Confirmar agendamento'}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}

function DirectSchedulingPage() {
  return (
    <main className="page-shell scheduling-page minimal-scheduling-page">
      <section className="form-panel scheduling-panel minimal-scheduling-panel" aria-labelledby="scheduling-title">
        <h1 className="visually-hidden" id="scheduling-title">Agende sua conversa</h1>
        <SchedulingPanel standalone />
      </section>
    </main>
  );
}

export default function App() {
  const isDirectSchedulingPage = window.location.pathname === '/agendamento';
  const [dynamicForm, setDynamicForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [formLoadStatus, setFormLoadStatus] = useState('idle');
  const [formLoadError, setFormLoadError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const shouldFocusNextStepRef = useRef(false);

  const steps = useMemo(() => buildFormSteps(questions), [questions]);
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = useMemo(
    () => (steps.length > 0 ? Math.round(((currentStepIndex + 1) / steps.length) * 100) : 0),
    [currentStepIndex, steps.length]
  );

  useEffect(() => {
    if (!shouldFocusNextStepRef.current) {
      return undefined;
    }

    shouldFocusNextStepRef.current = false;

    const frameId = window.requestAnimationFrame(() => {
      const nextField = document.querySelector(
        '.guided-form .step-card input:not([type="radio"]):not([type="checkbox"]), .guided-form .step-card textarea, .guided-form .step-card input[type="radio"], .guided-form .step-card input[type="checkbox"]'
      );

      if (nextField instanceof HTMLElement) {
        nextField.focus();
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentStepIndex]);

  useEffect(() => {
    if (isDirectSchedulingPage) {
      return;
    }

    async function loadDynamicForm() {
      if (!isSupabaseConfigured) {
        setFormLoadStatus('error');
        setFormLoadError(
          'Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local.'
        );
        return;
      }

      setFormLoadStatus('loading');
      setFormLoadError('');

      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('id, slug, title, description')
        .eq('slug', FORM_SLUG)
        .single();

      if (formError) {
        setFormLoadStatus('error');
        setFormLoadError(formError.message);
        return;
      }

      const { data: questionData, error: questionError } = await supabase
        .from('form_questions')
        .select('id, key, label, description, type, required, options, position')
        .eq('form_id', formData.id)
        .order('position', { ascending: true });

      if (questionError) {
        setFormLoadStatus('error');
        setFormLoadError(questionError.message);
        return;
      }

      const activeQuestions = questionData || [];
      setDynamicForm(formData);
      setQuestions(activeQuestions);
      setAnswers(getInitialAnswers(activeQuestions));
      setCurrentStepIndex(0);
      setFormLoadStatus('success');
    }

    loadDynamicForm();
  }, [isDirectSchedulingPage]);

  function updateField(field, value) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [field]: value }));
    setValidationMessage('');
    setSubmitError('');
  }

  function toSupabasePayload() {
    const normalizedAnswers = Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value
      ])
    );

    return {
      form_id: dynamicForm.id,
      respondent_name: String(normalizedAnswers.full_name || ''),
      respondent_email: String(normalizedAnswers.email || ''),
      respondent_phone: String(normalizedAnswers.whatsapp || ''),
      answers: normalizedAnswers
    };
  }

  function isFieldFilled(field) {
    const value = answers[field];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(String(value).trim());
  }

  function validateCurrentStep() {
    const missingQuestion = currentStep.questions.find(
      (question) => question.required && !isFieldFilled(question.key)
    );

    if (!missingQuestion) {
      return true;
    }

    if (missingQuestion.type === 'multi_choice') {
      setValidationMessage('Selecione pelo menos uma opcao para continuar.');
      return false;
    }

    setValidationMessage('Preencha esta etapa antes de continuar.');
    return false;
  }

  function handleNext() {
    if (!validateCurrentStep()) {
      return false;
    }

    setCurrentStepIndex((stepIndex) => Math.min(stepIndex + 1, steps.length - 1));
    return true;
  }

  function handlePrevious() {
    setValidationMessage('');
    setSubmitError('');
    setCurrentStepIndex((stepIndex) => Math.max(stepIndex - 1, 0));
  }

  function handleFormKeyDown(event) {
    if (event.key !== 'Enter' || event.isComposing) {
      return;
    }

    if (event.target instanceof HTMLTextAreaElement) {
      return;
    }

    event.preventDefault();

    if (!isLastStep && submitStatus !== 'submitting') {
      shouldFocusNextStepRef.current = handleNext();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    if (!validateCurrentStep()) {
      return;
    }

    if (!isSupabaseConfigured) {
      setSubmitStatus('error');
      setSubmitError(
        'Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local.'
      );
      return;
    }

    setSubmitStatus('submitting');

    const payload = toSupabasePayload();
    const { error } = await supabase.from(DYNAMIC_SUBMISSIONS_TABLE).insert(payload);

    if (error) {
      setSubmitStatus('error');
      setSubmitError(error.message);
      return;
    }

    setSubmittedData({
      full_name: payload.respondent_name,
      email: payload.respondent_email,
      whatsapp: payload.respondent_phone
    });
    setSubmitStatus('success');
  }

  function handleReset() {
    setAnswers(getInitialAnswers(questions));
    setSubmittedData(null);
    setSubmitStatus('idle');
    setSubmitError('');
    setValidationMessage('');
    setCurrentStepIndex(0);
    setHasStartedForm(false);
  }

  function renderQuestion(question) {
    const copy = getQuestionCopy(question);

    if (question.type === 'long_text') {
      return (
        <section className="guided-question" key={question.id}>
          <div className="guided-copy">
            <p className="step-kicker">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            {copy.helper ? <p>{copy.helper}</p> : null}
          </div>
          <label className="field textarea-field guided-field" htmlFor={question.key}>
            <span className="visually-hidden">{question.label}</span>
            <textarea
              id={question.key}
              value={answers[question.key] || ''}
              onChange={(event) => updateField(question.key, event.target.value)}
              required={question.required}
              rows="7"
              placeholder={getPlaceholder(question)}
            />
          </label>
        </section>
      );
    }

    if (question.type === 'single_choice' || question.type === 'yes_no') {
      return (
        <section className="guided-question" key={question.id}>
          <div className="guided-copy">
            <p className="step-kicker">{copy.eyebrow}</p>
          </div>
          <RadioGroup
            legend={copy.title}
            name={question.key}
            options={question.options || []}
            value={answers[question.key] || ''}
            onChange={(value) => updateField(question.key, value)}
          />
          {copy.helper ? <p className="guided-helper">{copy.helper}</p> : null}
        </section>
      );
    }

    if (question.type === 'multi_choice') {
      return (
        <section className="guided-question" key={question.id}>
          <div className="guided-copy">
            <p className="step-kicker">{copy.eyebrow}</p>
          </div>
          <CheckboxGroup
            legend={copy.title}
            options={question.options || []}
            values={answers[question.key] || []}
            onChange={(value) => updateField(question.key, value)}
          />
          {copy.helper ? <p className="guided-helper">{copy.helper}</p> : null}
        </section>
      );
    }

    return (
      <section className="guided-question" key={question.id}>
        <div className="guided-copy">
          <p className="step-kicker">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          {copy.helper ? <p>{copy.helper}</p> : null}
        </div>
        <TextField
          id={question.key}
          label={question.label}
          type={getInputType(question)}
          value={answers[question.key] || ''}
          onChange={(value) => updateField(question.key, value)}
          required={question.required}
          placeholder={getPlaceholder(question)}
        />
      </section>
    );
  }

  function renderStep() {
    if (!currentStep) {
      return null;
    }

    return currentStep.questions.map(renderQuestion);
  }

  if (isDirectSchedulingPage) {
    return <DirectSchedulingPage />;
  }

  if (submittedData) {
    return (
      <main className="page-shell submitted-scheduling-page">
        <section className="form-panel submitted-scheduling-panel" aria-labelledby="submitted-title">
          <h1 className="visually-hidden" id="submitted-title">Escolha um horario para sua conversa</h1>
          <SchedulingPanel submittedData={submittedData} />
        </section>
      </main>
    );
  }

  if (formLoadStatus === 'loading' || formLoadStatus === 'idle') {
    return (
      <main className="page-shell">
        <section className="form-panel" aria-labelledby="form-loading-title">
          <div className="form-heading">
            <p className="eyebrow">Sessao gratuita</p>
            <h1 id="form-loading-title">Carregando formulario</h1>
            <p>Estamos preparando as perguntas para voce.</p>
          </div>
        </section>
      </main>
    );
  }

  if (formLoadStatus === 'error') {
    return (
      <main className="page-shell">
        <section className="startup-error" aria-labelledby="form-error-title">
          <h1 id="form-error-title">Erro ao carregar o formulario</h1>
          <p>Confira a configuracao do Supabase e tente novamente.</p>
          <pre>{formLoadError}</pre>
        </section>
      </main>
    );
  }

  if (!hasStartedForm) {
    return (
      <main className="page-shell guided-shell">
        <section className="guided-panel welcome-panel" aria-labelledby="welcome-title">
          <div>
            <p className="eyebrow">Sessao gratuita</p>
            <h1 id="welcome-title">Vamos preparar sua conversa com calma</h1>
            <p>
              Vou te fazer algumas perguntas para entender seu momento e conduzir a conversa inicial
              com mais clareza.
            </p>
          </div>

          <div className="welcome-summary" aria-label="Resumo do fluxo">
            <span>Leva poucos minutos</span>
            <span>Depois voce escolhe o horario</span>
            <span>Convite enviado por e-mail</span>
          </div>

          <button className="primary-button welcome-button" type="button" onClick={() => setHasStartedForm(true)}>
            Comecar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell guided-shell">
      <section className="guided-panel" aria-labelledby="form-title">
        <div className="guided-topbar">
          <div>
            <p className="eyebrow">Sessao gratuita</p>
            <h1 id="form-title">{dynamicForm?.title || 'Formulario de acolhimento'}</h1>
          </div>
          <span>{currentStepIndex + 1} de {steps.length}</span>
        </div>

        <form className="guided-form" onKeyDown={handleFormKeyDown} onSubmit={handleSubmit} noValidate>
          <div className="progress-area" aria-label="Progresso do formulario">
            <div className="progress-meta">
              <span>{currentStep?.label || 'Formulario'}</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="step-card">{renderStep()}</div>

          {validationMessage ? <p className="validation-note">{validationMessage}</p> : null}

          <div className="actions">
            <button className="secondary-button" type="button" onClick={handleReset}>
              Limpar
            </button>
            <div className="navigation-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={handlePrevious}
                disabled={isFirstStep || submitStatus === 'submitting'}
              >
                Voltar
              </button>
              {isLastStep ? (
                <button
                  className="primary-button"
                  type="submit"
                  disabled={submitStatus === 'submitting'}
                >
                  {submitStatus === 'submitting' ? 'Enviando...' : 'Agendar horario'}
                </button>
              ) : (
                <button className="primary-button" type="button" onClick={handleNext}>
                  Proxima
                </button>
              )}
            </div>
          </div>

          {submitError ? <p className="submit-error">Erro ao salvar: {submitError}</p> : null}
          {submitStatus === 'success' ? (
            <p className="submit-success">Formulario enviado.</p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
