# 📧 Checklist Benefícios Fiscais — Backend de Email

Instruções para configurar e rodar o servidor Node.js que envia formulários preenchidos por email.

---

## 🚀 Instalação Rápida

### 1. **Instalar Node.js**
Baixe em: https://nodejs.org/ (versão 18+ recomendada)

### 2. **Instalar dependências**
Abra um terminal nesta pasta e execute:
```bash
npm install
```

### 3. **Configurar variáveis de email** (`.env`)

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure seus dados de email.

#### 📧 **Para Gmail:**
1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Mail" e "Windows Computer" (ou seu device)
3. Clique em "Gerar"
4. Copie a senha de 16 caracteres
5. Cole em `EMAIL_PASS=` no `.env`

**Exemplo:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_ADMIN=seu-email-administrativo@empresa.com
```

#### Para Outlook, Yahoo ou outro serviço:
Procure por "SMTP settings" no seu serviço de email e use os dados lá.

### 4. **Iniciar o servidor**
```bash
node server.js
```

Você verá:
```
╔════════════════════════════════════════════════════════════╗
║  🚀 Servidor iniciado na porta 3000                        ║
║  📧 Pronto para receber formulários                         ║
║  💾 Salvando backups em: ./submissions/                     ║
╚════════════════════════════════════════════════════════════╝
```

### 5. **Acessar o formulário**
Abra no navegador: **http://localhost:3000**

---

## 🎯 Como Usar o Formulário

1. **Preencha** o checklist com suas informações
2. **Anexe documentos** nas zonas "Documentos anexados"
3. Clique em **"Enviar por Email"** (botão verde na parte inferior)
4. Preencha seu **email** e **nome da empresa**
5. Clique em **"Enviar Agora"**

O sistema vai:
- ✅ Coletar todos os dados preenchidos
- ✅ Incluir os documentos anexados
- ✅ Criar um relatório em HTML
- ✅ Enviar por email para o cliente E administrador
- ✅ Salvar um backup em `./submissions/`

---

## 🗂️ Estrutura de Pastas Criadas

Após o primeiro envio, será criada a pasta `submissions/`:
```
submissions/
├── 1704067200000-empresa1/
│   ├── 00_RELATORIO.html       (relatório visual)
│   ├── 00_DADOS.json           (dados em JSON)
│   ├── attach_0_1_documento.pdf
│   ├── attach_1_1_imagem.jpg
│   └── ...
└── 1704067300000-empresa2/
    ├── 00_RELATORIO.html
    ├── 00_DADOS.json
    └── ...
```

---

## 🔧 Variáveis de Ambiente (`.env`)

| Variável | Obrigatória? | Descrição |
|----------|---|-----------|
| `EMAIL_SERVICE` | ✅ | `gmail`, `outlook`, `yahoo`, etc |
| `EMAIL_USER` | ✅ | Email do remetente |
| `EMAIL_PASS` | ✅ | Senha ou App Password |
| `EMAIL_ADMIN` | ✅ | Email administrativo (recebe cópia) |
| `EMAIL_RECIPIENT` | ❌ | Email fixo (se deixar vazio, usa cliente) |
| `EMAIL_CC` | ❌ | Cópias adicionais (separadas por vírgula) |
| `PORT` | ❌ | Porta (padrão: 3000) |

---

## 🐛 Troubleshooting

### ❌ "Erro: Não consegui conectar ao servidor"
Certifique-se de que:
1. O servidor está rodando (`node server.js`)
2. Está na porta 3000 (ou `PORT=` configurado)
3. Não há firewall bloqueando localhost:3000

### ❌ "Erro na configuração de email"
- ✅ Verifique `EMAIL_USER` e `EMAIL_PASS`
- ✅ Para Gmail, use **App Password** (não a senha normal da conta)
- ✅ Teste a conexão: https://www.gmailsmarttester.com/

### ❌ "ENOENT: no such file or directory '.env'"
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

---

## 🚀 Hospedagem (Opcional)

Se quiser hospedar na nuvem:

### **Heroku** (gratuito com limitações)
```bash
heroku login
heroku create seu-app-nome
heroku config:set EMAIL_USER=xxx EMAIL_PASS=xxx EMAIL_ADMIN=xxx
git push heroku main
```

### **Replit** 
1. Crie uma conta em https://replit.com
2. Faça upload dos arquivos
3. Configure `.env`
4. Clique em "Run"

### **Railway, Render, Fly.io**
Todos com setup similar ao Heroku.

---

## 📝 Exemplo de Email Enviado

```
Assunto: Checklist Benefícios Fiscais — Empresa ABC Ltda.

Conteúdo:
├─ Informações de Contato
│  └─ Email: cliente@empresa.com
├─ Dados Preenchidos do Formulário
│  ├─ Benefício pleiteado: Crédito presumido de ICMS
│  ├─ Estimativa do crédito/redução: R$ 500.000,00/ano
│  └─ ... (todos os campos)
└─ Documentos Anexados
   ├─ certidao.pdf
   ├─ contrato.docx
   └─ ... (arquivos selecionados)
```

---

## 📞 Suporte

- **Documentação Node.js:** https://nodejs.org/docs
- **Nodemailer:** https://nodemailer.com
- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833

---

**Versão:** 1.0.0  
**Data:** Abril 2026
