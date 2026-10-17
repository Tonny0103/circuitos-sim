# Publicação e rollback

## Preparar

O remoto configurado é o repositório GitHub circuitos-sim. Confira git remote -v e a visibilidade
no GitHub; não substitua um remoto existente. Use Node 24, npm ci e commit com verificações
aprovadas. Configure GitHub Actions com `.github/workflows/ci.yml`.

O build usa output export e gera out/. Não exige API, Java, banco ou segredo em variáveis.
O site pode ser servido por qualquer host estático; a opção prevista neste projeto é Vercel.

## Vercel

1. Entre na conta Vercel e importe o repositório GitHub existente.
2. Selecione Next.js, Node 24, instalação npm ci e build npm run build. Confira saída out/.
3. Configure main como branch de produção e deployments de preview para revisão.
4. Revise o preview e publique apenas commit com CI aprovado. Confirme que produção é pública
   sem autenticação/proteção de preview. Não exponha credenciais no repositório ou nos links.
5. Em janela anônima, abra divisor, analise e confira 5 V/5 mA. Exclua terra e confira erro.
   Abra um link compartilhado diretamente e crie uma cópia; confira recuperação local.
6. Execute os testes contra o endereço HTTPS real (PowerShell):

```powershell
$env:BASE_URL = 'https://endereco-real-da-publicacao'
npm run test:e2e
Remove-Item Env:BASE_URL
```

7. Registre endereço e SHA do deployment no README e em docs/validation/deploy.md. Não
   substitua a ausência de publicação por uma URL suposta.

## Rollback

Na lista de deployments da Vercel, promova o deployment anterior aprovado para produção.
Execute os smoke tests de divisor, erro sem terra e link v1. Não há migração de banco.
Mantenha decoder v1 em futuras versões e registre links de regressão nos testes.
Trocar de origem não migra localStorage e não modifica URLs já enviadas; planeje isso antes
de trocar domínio. Revalidar instruções por outra pessoa fecha SC-008.

## Estado

Publicação, acesso público e rollback ainda precisam de evidências reais. As etapas que
dependem de conta Vercel/CI remoto não são consideradas concluídas apenas por haver este guia.
