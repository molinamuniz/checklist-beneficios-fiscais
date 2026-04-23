const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static('.'));

// ═══════════════════════════════════════════════════════════════════════════
// Email Setup
// ═══════════════════════════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use App Password para Gmail (não a senha da conta)
  }
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro na configuração de email:', error.message);
  } else {
    console.log('✅ Servidor de email pronto!');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API Endpoint: Enviar formulário + documentos
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/submit-checklist', async (req, res) => {
  try {
    const { email, companyName, formData, attachments } = req.body;

    if (!email || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Email e nome da empresa são obrigatórios'
      });
    }

    console.log(`📋 Recebendo formulário de: ${companyName} (${email})`);

    // ───────────────────────────────────────────────────────────────────────
    // Preparar anexos
    // ───────────────────────────────────────────────────────────────────────
    const mailAttachments = [];
    const safeCompanySlug = companyName.replace(/[^a-z0-9]/gi, '') || 'empresa';
    const submissionDir = path.join(__dirname, 'submissions', `${Date.now()}-${safeCompanySlug}`);

    // Sempre cria a pasta do envio para salvar relatório/JSON, mesmo sem anexos
    if (!fs.existsSync(submissionDir)) {
      fs.mkdirSync(submissionDir, { recursive: true });
    }

    if (attachments && Object.keys(attachments).length > 0) {
      for (const [key, files] of Object.entries(attachments)) {
        if (Array.isArray(files)) {
          files.forEach((file, idx) => {
            try {
              const buffer = Buffer.from(file.data, 'base64');
              const filename = `${key}_${idx + 1}_${file.name}`;
              const filepath = path.join(submissionDir, filename);

              // Salvar arquivo localmente
              fs.writeFileSync(filepath, buffer);

              // Adicionar ao anexo do email
              mailAttachments.push({
                filename: file.name,
                content: buffer
              });

              console.log(`  ✓ Arquivo: ${file.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
            } catch (e) {
              console.error(`  ✗ Erro ao processar: ${file.name}`, e.message);
            }
          });
        }
      }
    }

    // ───────────────────────────────────────────────────────────────────────
    // Gerar relatório em HTML
    // ───────────────────────────────────────────────────────────────────────
    let htmlReport = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .header { background: linear-gradient(135deg, #001a33 0%, #002d50 100%); color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .section { margin: 20px 0; border-left: 4px solid #3d5a80; padding-left: 15px; }
          .section h2 { margin: 10px 0; font-size: 16px; color: #3d5a80; }
          .field { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; border-left: 3px solid #b0c4d8; }
          .field-label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .field-value { color: #222; margin-top: 5px; word-break: break-word; }
          .files { margin-top: 10px; padding: 10px; background: #ede8f8; border-radius: 4px; }
          .files-title { font-weight: bold; color: #6647a6; margin-bottom: 8px; }
          .file-item { margin: 5px 0; padding: 5px 8px; background: #fff; border-radius: 3px; font-size: 13px; color: #444; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f0f0f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Formulário Preenchido — Checklist Benefícios Fiscais</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Empresa: <strong>${companyName}</strong></p>
        </div>

        <div class="section">
          <h2>Informações de Contato</h2>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${email}</div>
          </div>
        </div>
    `;

    // Adicionar dados do formulário
    if (formData && Object.keys(formData).length > 0) {
      htmlReport += `
        <div class="section">
          <h2>Dados Preenchidos do Formulário</h2>
      `;

      for (const [key, value] of Object.entries(formData)) {
        if (value && value.trim()) {
          const label = key.replace(/^n_/, '').replace(/_/g, ' ');
          htmlReport += `
            <div class="field">
              <div class="field-label">${label}</div>
              <div class="field-value">${value.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          `;
        }
      }

      htmlReport += `</div>`;
    }

    // Adicionar lista de arquivos
    if (mailAttachments.length > 0) {
      htmlReport += `
        <div class="section">
          <h2>📎 Documentos Anexados</h2>
          <div class="files">
            <div class="files-title">${mailAttachments.length} arquivo(s) anexado(s)</div>
      `;

      mailAttachments.forEach(att => {
        htmlReport += `<div class="file-item">✓ ${att.filename}</div>`;
      });

      htmlReport += `
          </div>
        </div>
      `;
    }

    htmlReport += `
        <div class="footer">
          <p>Formulário enviado em: ${new Date().toLocaleString('pt-BR')}</p>
          <p>Sistema: Checklist Benefícios Fiscais v2.1</p>
        </div>
      </body>
      </html>
    `;

    // Salvar relatório HTML
    const reportPath = path.join(submissionDir, '00_RELATORIO.html');
    fs.writeFileSync(reportPath, htmlReport);

    // Salvar JSON dos dados
    const jsonPath = path.join(submissionDir, '00_DADOS.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ email, companyName, formData, timestamp: new Date().toISOString() }, null, 2));

    // ───────────────────────────────────────────────────────────────────────
    // Enviar email
    // ───────────────────────────────────────────────────────────────────────
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT || email, // Enviar para o cliente E/OU para um email fixo da empresa
      cc: process.env.EMAIL_CC ? process.env.EMAIL_CC.split(',') : [],
      subject: `Checklist Benefícios Fiscais — ${companyName}`,
      html: htmlReport,
      attachments: mailAttachments
    };

    // Enviar
    await transporter.sendMail(mailOptions);

    console.log(`✅ Email enviado com sucesso para: ${mailOptions.to}`);

    // Também enviar cópia para um email administrativo (se configurado)
    if (process.env.EMAIL_ADMIN && process.env.EMAIL_ADMIN !== process.env.EMAIL_USER) {
      const adminMailOptions = {
        ...mailOptions,
        to: process.env.EMAIL_ADMIN,
        subject: `[ADMIN] ${mailOptions.subject}`,
        html: htmlReport + `<p style="color: #999; font-size: 11px; margin-top: 20px;"><strong>Cópia administrativa</strong> — Cliente original: ${email}</p>`
      };
      await transporter.sendMail(adminMailOptions);
      console.log(`✅ Cópia enviada para admin: ${process.env.EMAIL_ADMIN}`);
    }

    res.json({
      success: true,
      message: '✅ Formulário enviado com sucesso!',
      submissionId: path.basename(submissionDir),
      files: mailAttachments.length
    });

  } catch (error) {
    console.error('❌ Erro ao enviar:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao enviar: ${error.message}`
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Health check
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════════
// Iniciar servidor
// ═══════════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 Servidor iniciado na porta ${PORT}                        ║
║  📧 Pronto para receber formulários                         ║
║  💾 Salvando backups em: ./submissions/                     ║
╚════════════════════════════════════════════════════════════╝
  `);
});
