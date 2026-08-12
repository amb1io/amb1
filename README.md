# AMB1

Site Astro com template de landing page baseado no logo positivo padrão.

## Paleta

| Token | Hex | Uso |
|-------|-----|-----|
| Lime | `#B8D040` | CTA, acentos, faixa de destaque |
| Charcoal | `#585858` | Texto secundário, tipografia de apoio |
| Fog | `#F0F0F0` | Fundo / atmosfera |

## Idiomas

- `en-US` → `/` (padrão, sem redirect)
- `pt-BR` → `/pt-br/`

Traduções em `src/i18n/ui.ts`.

## Desenvolvimento

```bash
npm run dev
```

Worker de contato (e-mail via Cloudflare Email Sending):

```bash
npm run worker:dev
```

Em outro terminal, o site aponta para `PUBLIC_CONTACT_API` (veja `.env.example`).

```bash
npm run worker:deploy
```

Variáveis do Worker (`worker/wrangler.jsonc`):

- `FROM_EMAIL` — remetente (`contato@amb1.io`)
- `CONTACT_TO` — destino (`rhamses@amb1.io`)
- `ALLOWED_ORIGINS` — origens CORS do formulário

O domínio do remetente precisa estar habilitado no Cloudflare Email Sending.

```bash
npm run build
npm run preview
```
