# Configuracao do Google Calendar

Este projeto usa a Google Calendar API para consultar horarios disponiveis e criar eventos com
Google Meet.

## Variaveis necessarias

Configure estas variaveis no ambiente local e tambem no deploy:

```bash
GOOGLE_CLIENT_ID=seu_client_id_google
GOOGLE_CLIENT_SECRET=seu_client_secret_google
GOOGLE_REFRESH_TOKEN=seu_refresh_token_google
GOOGLE_CALENDAR_ID=primary
GOOGLE_CALENDAR_TIME_ZONE=America/Sao_Paulo
GOOGLE_WORK_START=09:00
GOOGLE_WORK_END=18:00
GOOGLE_SLOT_MINUTES=30
GOOGLE_DAYS_AHEAD=14
```

## Criar projeto e ativar API

1. Acesse o Google Cloud Console.
2. Crie ou selecione um projeto.
3. Ative a Google Calendar API no projeto.

## Configurar OAuth

1. Abra a area Google Auth Platform ou OAuth consent screen.
2. Configure o app como externo se necessario.
3. Enquanto estiver em teste, adicione o e-mail que fara a autorizacao em usuarios de teste.
4. Crie um OAuth Client do tipo Web application.
5. Adicione este redirect URI autorizado:

```text
https://developers.google.com/oauthplayground
```

6. Copie o Client ID e o Client Secret para:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Gerar refresh token

1. Acesse o OAuth 2.0 Playground:

```text
https://developers.google.com/oauthplayground/
```

2. Clique na engrenagem de configuracao.
3. Marque `Use your own OAuth credentials`.
4. Preencha o mesmo Client ID e Client Secret criados no Google Cloud.
5. Em `Access type`, use `Offline`.
6. Em `Force prompt`, use `Consent Screen`.
7. Feche a configuracao.
8. No Step 1, autorize este escopo:

```text
https://www.googleapis.com/auth/calendar
```

9. Clique em `Authorize APIs`.
10. Faca login com a conta Google dona da agenda.
11. No Step 2, clique em `Exchange authorization code for tokens`.
12. Copie apenas o `Refresh token`.
13. Salve no ambiente:

```bash
GOOGLE_REFRESH_TOKEN=...
```

## Cuidados de seguranca

- Nunca publique `GOOGLE_CLIENT_SECRET`.
- Nunca publique `GOOGLE_REFRESH_TOKEN`.
- Nao envie prints de telas que exibem secrets ou tokens.
- Se um secret ou token for exposto, gere outro no Google Cloud e atualize o ambiente.
- Use `.env.local` apenas localmente. Ele ja esta ignorado pelo Git.

## Validacao local

Com o `.env.local` preenchido, valide a troca do refresh token por access token:

```bash
node --env-file=.env.local -e "import('./api/googleCalendar.js').then(async (m)=>{ const token=await m.getAccessToken(); console.log(token ? 'GOOGLE_ACCESS_TOKEN_OK' : 'NO_TOKEN'); })"
```

Valide tambem a consulta de disponibilidade:

```bash
node --env-file=.env.local -e "import('./api/googleCalendar.js').then(async (m)=>{ const start=new Date(); const end=m.addMinutes(start, 60); const busy=await m.getBusyBlocks(start,end); console.log('GOOGLE_FREEBUSY_OK blocks='+busy.length); })"
```

## Deploy

No deploy, cadastre as variaveis Google como variaveis de ambiente do provedor. Na Vercel, elas
devem ser cadastradas em Project Settings -> Environment Variables.
