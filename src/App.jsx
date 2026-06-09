import { useMemo, useState } from 'react';
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

export default function App() {
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
                  {submitStatus === 'submitting' ? 'Enviando...' : 'Enviar formulario'}
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
            <p className="submit-success">Formulario salvo no Supabase com sucesso.</p>
          ) : null}
        </form>

        {submittedData ? (
          <section className="submission-preview" aria-live="polite">
            <h2>Formulario capturado</h2>
            <p>
              Os dados foram registrados no estado da aplicacao. Abaixo esta uma pre-visualizacao
              para facilitar a integracao futura com API, e-mail ou planilha.
            </p>
            <pre>{JSON.stringify(submittedData, null, 2)}</pre>
          </section>
        ) : null}
      </section>
    </main>
  );
}
