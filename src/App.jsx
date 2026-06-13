import { useEffect, useMemo, useState } from 'react';
import { formTableName, isSupabaseConfigured, supabase } from './lib/supabase';

const attentionAreas = [
  'Relacionamento amoroso',
  'Familia',
  'Ansiedade e sobrecarga emocional',
  'Autoestima',
  'Trabalho e carreira',
  'Espiritualidade e proposito',
  'Tomada de decisao',
  'Outro'
];

const durationOptions = [
  'Menos de 3 meses',
  'Entre 3 meses e 1 ano',
  'Entre 1 e 3 anos',
  'Mais de 3 anos'
];

const impactOptions = ['Pouco', 'Moderadamente', 'Muito', 'Extremamente'];

const expectedOutcomes = [
  'Clareza sobre minha situacao',
  'Melhorar relacionamentos',
  'Resolver conflitos familiares',
  'Compreender padroes repetitivos',
  'Tomar uma decisao importante',
  'Desenvolver autoconhecimento',
  'Encontrar mais equilibrio emocional'
];

const previousProcesses = [
  'Nunca',
  'Terapia',
  'Constelacao Familiar',
  'Coaching',
  'Mentoria',
  'Mais de uma das opcoes acima'
];

const investmentMomentOptions = [
  'Estou pronto(a) para investir no meu desenvolvimento pessoal e emocional.',
  'Gostaria de entender melhor antes de decidir.',
  'Preciso avaliar o investimento financeiro.',
  'Preciso conversar com minha familia/parceiro(a).',
  'Busco apenas a sessao gratuita.'
];

const referralOptions = ['Instagram', 'Indicacao', 'WhatsApp', 'Cerimonia', 'Google', 'Outro'];

const initialForm = {
  fullName: '',
  whatsapp: '',
  email: '',
  city: '',
  state: '',
  qualification: '',
  attentionArea: '',
  duration: '',
  impact: '',
  expectedOutcomes: [],
  previousProcess: '',
  investmentMoment: '',
  onlineAvailability: '',
  referralSource: '',
  currentSituation: ''
};

const contactFields = ['fullName', 'whatsapp', 'email', 'city', 'state', 'qualification'];

const steps = [
  { id: 'contact', label: 'Contato', fields: contactFields },
  { id: 'attentionArea', label: 'Pergunta 6', fields: ['attentionArea'] },
  { id: 'duration', label: 'Pergunta 7', fields: ['duration'] },
  { id: 'impact', label: 'Pergunta 8', fields: ['impact'] },
  { id: 'expectedOutcomes', label: 'Pergunta 9', fields: ['expectedOutcomes'] },
  { id: 'previousProcess', label: 'Pergunta 10', fields: ['previousProcess'] },
  { id: 'investmentMoment', label: 'Pergunta 11', fields: ['investmentMoment'] },
  { id: 'onlineAvailability', label: 'Pergunta 12', fields: ['onlineAvailability'] },
  { id: 'referralSource', label: 'Pergunta 13', fields: ['referralSource'] },
  { id: 'currentSituation', label: 'Pergunta 14', fields: ['currentSituation'] }
];

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
    <fieldset className="question">
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
    <fieldset className="question">
      <legend>{legend}</legend>
      <p className="hint">Escolha uma ou mais opcoes.</p>
      <div className="option-grid">
        {options.map((option) => (
          <label className="option" key={option}>
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

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      setIsLoading(true);
      setError('');
      setSelectedSlot('');
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
      <section className="next-step-panel success-panel" aria-live="polite">
        <div className="confirmation-mark" aria-hidden="true">✓</div>
        <div>
          <p className="step-kicker">Agendamento confirmado</p>
          <h2>Sua conversa foi agendada</h2>
          <p>
            O convite foi criado no Google Calendar e enviado para o e-mail informado. O link do
            Google Meet tambem esta disponivel abaixo.
          </p>
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
    <section className="next-step-panel scheduling-flow" aria-live="polite">
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

        {!hasSubmittedContact ? (
          <div className="schedule-section">
            <div className="schedule-section-title">
              <span>1</span>
              <strong>Seus dados</strong>
            </div>
            <div className="scheduling-contact-grid">
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
          </div>
        ) : null}

        <div className="schedule-section">
          <div className="schedule-section-title">
            <span>{hasSubmittedContact ? '1' : '2'}</span>
            <strong>Data e horario</strong>
          </div>

          <div className="calendar-picker" aria-label="Calendario de datas disponiveis">
            <div className="calendar-toolbar">
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
              <strong>{formatMonthLabel(visibleMonth)}</strong>
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
                    onClick={() => setSelectedDate(dateValue)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="slots-header">
            <strong>{formatSelectedDate(selectedDate)}</strong>
            {isLoading ? <span>Buscando horarios...</span> : <span>{slots.length} horarios disponiveis</span>}
          </div>

          {isLoading ? (
            <div className="slot-grid" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <span className="slot-skeleton" key={index} />
              ))}
            </div>
          ) : null}

          {!isLoading && slots.length === 0 ? (
            <div className="schedule-warning">
              <strong>Nao ha horarios disponiveis nesta data.</strong>
              <span>Escolha outro dia para ver novas opcoes.</span>
            </div>
          ) : null}

          {!isLoading && slots.length > 0 ? (
            <div className="slot-grid" role="group" aria-label="Horarios disponiveis">
              {slots.map((slot) => (
                <button
                  className={selectedSlot === slot.start ? 'slot-button selected' : 'slot-button'}
                  key={slot.start}
                  type="button"
                  onClick={() => setSelectedSlot(slot.start)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <p className="submit-error">Erro ao agendar: {error}</p> : null}
      </div>

      <aside className="schedule-summary" aria-label="Resumo do agendamento">
        <div>
          <p className="summary-label">Resumo</p>
          <h3>Sessao gratuita</h3>
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
        </div>

        <button
          className="schedule-button"
          type="button"
          onClick={handleBooking}
          disabled={!canConfirm}
        >
          {isBooking ? 'Agendando...' : selectedSlot ? 'Confirmar horario' : 'Escolha um horario'}
        </button>
      </aside>
    </section>
  );
}

function DirectSchedulingPage() {
  return (
    <main className="page-shell scheduling-page">
      <section className="form-panel scheduling-panel" aria-labelledby="scheduling-title">
        <div className="form-heading">
          <div>
            <p className="eyebrow">Sessao gratuita</p>
            <h1 id="scheduling-title">Agende sua conversa</h1>
            <p>
              Escolha um horario disponivel na agenda e informe seus dados para receber o convite com
              Google Meet.
            </p>
          </div>
          <div className="heading-pill" aria-label="Duracao da conversa">
            <strong>30 min</strong>
            <span>online</span>
          </div>
        </div>

        <SchedulingPanel standalone />
      </section>
    </main>
  );
}

export default function App() {
  const isDirectSchedulingPage = window.location.pathname === '/agendamento';
  const [form, setForm] = useState(initialForm);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = useMemo(
    () => Math.round(((currentStepIndex + 1) / steps.length) * 100),
    [currentStepIndex]
  );

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setValidationMessage('');
    setSubmitError('');
  }

  function toSupabasePayload() {
    return {
      full_name: form.fullName.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      qualification: form.qualification.trim(),
      attention_area: form.attentionArea,
      duration: form.duration,
      impact: form.impact,
      expected_outcomes: form.expectedOutcomes,
      previous_process: form.previousProcess,
      investment_moment: form.investmentMoment,
      online_availability: form.onlineAvailability,
      referral_source: form.referralSource,
      current_situation: form.currentSituation.trim()
    };
  }

  function isFieldFilled(field) {
    const value = form[field];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(String(value).trim());
  }

  function validateCurrentStep() {
    const missingField = currentStep.fields.find((field) => !isFieldFilled(field));

    if (!missingField) {
      return true;
    }

    if (currentStep.id === 'expectedOutcomes') {
      setValidationMessage('Selecione pelo menos uma expectativa para continuar.');
      return false;
    }

    setValidationMessage('Preencha esta etapa antes de continuar.');
    return false;
  }

  function handleNext() {
    if (!validateCurrentStep()) {
      return;
    }

    setCurrentStepIndex((stepIndex) => Math.min(stepIndex + 1, steps.length - 1));
  }

  function handlePrevious() {
    setValidationMessage('');
    setSubmitError('');
    setCurrentStepIndex((stepIndex) => Math.max(stepIndex - 1, 0));
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
    const { error } = await supabase.from(formTableName).insert(payload);

    if (error) {
      setSubmitStatus('error');
      setSubmitError(error.message);
      return;
    }

    setSubmittedData(payload);
    setSubmitStatus('success');
  }

  function handleReset() {
    setForm(initialForm);
    setSubmittedData(null);
    setSubmitStatus('idle');
    setSubmitError('');
    setValidationMessage('');
    setCurrentStepIndex(0);
  }

  function renderStep() {
    switch (currentStep.id) {
      case 'contact':
        return (
          <section className="step-content" aria-labelledby="contact-title">
            <p className="step-kicker">Dados de contato</p>
            <h2 id="contact-title">Como podemos falar com voce?</h2>
            <div className="fields-grid">
              <TextField
                id="fullName"
                label="Nome completo"
                value={form.fullName}
                onChange={(value) => updateField('fullName', value)}
                placeholder="Seu nome completo"
              />
              <TextField
                id="whatsapp"
                label="WhatsApp"
                type="tel"
                value={form.whatsapp}
                onChange={(value) => updateField('whatsapp', value)}
                placeholder="(00) 00000-0000"
              />
              <TextField
                id="email"
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(value) => updateField('email', value)}
                placeholder="voce@email.com"
              />
              <TextField
                id="city"
                label="Cidade"
                value={form.city}
                onChange={(value) => updateField('city', value)}
              />
              <TextField
                id="state"
                label="Estado"
                value={form.state}
                onChange={(value) => updateField('state', value)}
                placeholder="UF ou estado"
              />
              <TextField
                id="qualification"
                label="Qualificacao"
                value={form.qualification}
                onChange={(value) => updateField('qualification', value)}
                placeholder="Profissao, ocupacao ou formacao"
              />
            </div>
          </section>
        );
      case 'attentionArea':
        return (
          <RadioGroup
            legend="6. Qual area da sua vida mais precisa de atencao neste momento?"
            name="attentionArea"
            options={attentionAreas}
            value={form.attentionArea}
            onChange={(value) => updateField('attentionArea', value)}
          />
        );
      case 'duration':
        return (
          <RadioGroup
            legend="7. Ha quanto tempo essa situacao esta presente?"
            name="duration"
            options={durationOptions}
            value={form.duration}
            onChange={(value) => updateField('duration', value)}
          />
        );
      case 'impact':
        return (
          <RadioGroup
            legend="8. Quanto essa situacao impacta sua vida atualmente?"
            name="impact"
            options={impactOptions}
            value={form.impact}
            onChange={(value) => updateField('impact', value)}
          />
        );
      case 'expectedOutcomes':
        return (
          <CheckboxGroup
            legend="9. O que voce espera obter com essa conversa?"
            options={expectedOutcomes}
            values={form.expectedOutcomes}
            onChange={(value) => updateField('expectedOutcomes', value)}
          />
        );
      case 'previousProcess':
        return (
          <RadioGroup
            legend="10. Voce ja participou de algum processo terapeutico anteriormente?"
            name="previousProcess"
            options={previousProcesses}
            value={form.previousProcess}
            onChange={(value) => updateField('previousProcess', value)}
          />
        );
      case 'investmentMoment':
        return (
          <RadioGroup
            legend="11. Caso perceba que um acompanhamento pode ajuda-lo(a), qual opcao melhor representa seu momento atual?"
            name="investmentMoment"
            options={investmentMomentOptions}
            value={form.investmentMoment}
            onChange={(value) => updateField('investmentMoment', value)}
          />
        );
      case 'onlineAvailability':
        return (
          <RadioGroup
            legend="12. Voce possui disponibilidade para realizar sessoes online por video?"
            name="onlineAvailability"
            options={['Sim', 'Nao']}
            value={form.onlineAvailability}
            onChange={(value) => updateField('onlineAvailability', value)}
          />
        );
      case 'referralSource':
        return (
          <RadioGroup
            legend="13. Como conheceu meu trabalho?"
            name="referralSource"
            options={referralOptions}
            value={form.referralSource}
            onChange={(value) => updateField('referralSource', value)}
          />
        );
      case 'currentSituation':
        return (
          <label className="field textarea-field" htmlFor="currentSituation">
            <span>
              14. Descreva brevemente o que voce esta vivendo hoje e por que esta sessao gratuita
              seria importante para voce.
            </span>
            <textarea
              id="currentSituation"
              value={form.currentSituation}
              onChange={(event) => updateField('currentSituation', event.target.value)}
              required
              rows="7"
              placeholder="Conte de forma breve o que esta acontecendo no momento."
            />
          </label>
        );
      default:
        return null;
    }
  }

  if (isDirectSchedulingPage) {
    return <DirectSchedulingPage />;
  }

  if (submittedData) {
    return (
      <main className="page-shell">
        <section className="form-panel" aria-labelledby="submitted-title">
          <div className="form-heading">
            <div>
              <p className="eyebrow">Formulario enviado</p>
              <h1 id="submitted-title">Recebemos suas respostas</h1>
              <p>
                Agora escolha um horario para sua conversa. O convite sera enviado para o e-mail
                informado no formulario.
              </p>
            </div>
            <div className="heading-pill" aria-label="Proximo passo">
              <strong>2</strong>
              <span>agendar</span>
            </div>
          </div>

          <SchedulingPanel submittedData={submittedData} />
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="form-panel" aria-labelledby="form-title">
        <div className="form-heading">
          <p className="eyebrow">Sessao gratuita</p>
          <h1 id="form-title">Formulario de acolhimento</h1>
          <p>
            Preencha os dados abaixo para que a conversa inicial seja conduzida com mais clareza e
            cuidado.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="progress-area" aria-label="Progresso do formulario">
            <div className="progress-meta">
              <span>{currentStep.label}</span>
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
