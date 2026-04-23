# Publicacao no Netlify (site estatico)

## Arquivos principais para o site
- index.html (pagina principal)
- checklist-beneficios-fiscais-v2_1.html (versao original, mantida como backup)
- netlify.toml (configuracao de publicacao e redirect)

## Como publicar
1. Acesse https://app.netlify.com
2. Clique em Add new site > Deploy manually
3. Arraste esta pasta inteira para a area de upload
4. Aguarde o deploy terminar
5. Abra a URL gerada pelo Netlify

## Observacoes
- O formulario esta configurado para enviar para Formspree usando o endpoint atual.
- O arquivo netlify.toml redireciona /checklist-beneficios-fiscais-v2_1.html para /.
- Nao e necessario rodar servidor Node para o site funcionar no Netlify.
