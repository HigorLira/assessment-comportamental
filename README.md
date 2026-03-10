# Assessment Comportamental

## Stack: React + Vite + Firebase Auth + Firestore + Vercel

---

## PARTE 1 — Configurar o Firebase (~10 min)

### 1.1 Criar projeto

1. Acesse **https://console.firebase.google.com**
2. Clique **Criar um projeto**
3. Nome: `assessment-comportamental` → **Continuar**
4. Analytics: desmarque → **Criar projeto** → **Continuar**

### 1.2 Registrar app web

1. Na tela do projeto, clique no ícone **Web** (`</>`)
2. Apelido: `assessment-web`
3. **NÃO** marque Firebase Hosting
4. Clique **Registrar app**
5. **Copie as credenciais** que aparecem (apiKey, authDomain, projectId, etc.)
6. **Continuar para o console**

### 1.3 Ativar autenticação por email/senha

1. Menu lateral → **Build** → **Authentication**
2. Clique **Começar** (Get started)
3. Aba **Sign-in method** → clique em **Email/senha**
4. Ative o primeiro toggle (**Email/senha**) → **Salvar**

### 1.4 Criar banco Firestore

1. Menu lateral → **Build** → **Firestore Database**
2. **Criar banco de dados**
3. Localização: `southamerica-east1` (São Paulo)
4. Modo: **Modo de teste** → **Criar**

### 1.5 Criar índice no Firestore (obrigatório)

O sistema filtra assessments por dono e ordena por data.
O Firebase exige um índice composto para isso:

1. Vá em **Firestore** → aba **Índices** (Indexes)
2. Clique **Criar índice** (Create index)
3. Configure:
   - **Collection:** `assessments`
   - **Campo 1:** `ownerId` — Ascending
   - **Campo 2:** `createdAt` — Descending
4. Clique **Criar**
5. Aguarde o status mudar para ✅ (1-2 minutos)

> **Alternativa:** o índice também será criado automaticamente 
> quando o erro aparecer no console do navegador — basta clicar 
> no link de erro que o Firebase gera.

### 1.6 Colar credenciais no projeto

Abra `src/firebase.js` e substitua os valores:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",        // sua apiKey
  authDomain:        "seu-projeto.firebaseapp.com",
  projectId:         "seu-projeto",
  storageBucket:     "seu-projeto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

---

## PARTE 2 — Subir para o GitHub (~3 min)

```bash
cd assessment-project
git init
git add .
git commit -m "Assessment v2 com Firebase Auth"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/assessment-comportamental.git
git push -u origin main
```

### Estrutura:
```
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── firebase.js   ← credenciais aqui
    └── App.jsx
```

---

## PARTE 3 — Deploy na Vercel (~2 min)

1. **vercel.com** → Sign Up com GitHub
2. **Add New** → **Project** → selecione o repositório
3. Framework: **Vite** (detectado automaticamente)
4. Clique **Deploy**
5. URL gerada: `https://assessment-comportamental.vercel.app`

---

## Como funciona

### Fluxo do Admin
1. Acessa a URL principal → tela de **login**
2. Cria conta (primeiro acesso) ou faz login
3. Cadastra colaboradores e gera **links únicos**
4. Quando o colaborador responde, clica **Ver resultados**
5. Dashboard com DISC, mapa comportamental, IE, valores, tempos

### Fluxo do Colaborador
1. Recebe link: `https://site.vercel.app/#respond-AbC12345`
2. **Não precisa de login** — acessa direto
3. Responde 5 etapas (cronômetro automático)
4. Vê apenas tela de "obrigado" — **sem acesso aos resultados**

### Segurança
- Cada admin só vê **seus próprios** assessments (filtrado por UID)
- Colaborador não vê resultados
- Dados na nuvem, acessíveis de qualquer dispositivo

---

## Após os 30 dias de teste do Firestore

Vá em **Firestore → Rules** e cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /assessments/{docId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if request.auth != null 
                    && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

Isso permite:
- Qualquer um lê (colaborador precisa acessar)
- Qualquer um cria/atualiza (colaborador envia respostas)
- Só o admin dono pode excluir

---

## Custos

| Serviço  | Plano  | Custo    |
|----------|--------|----------|
| Firebase | Spark  | R$ 0     |
| GitHub   | Free   | R$ 0     |
| Vercel   | Hobby  | R$ 0     |
| **Total**|        | **R$ 0** |
