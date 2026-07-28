[![Website](https://img.shields.io/website?url=https%3A%2F%2FSEU-UTILIZADOR.github.io%2FSEU-REPOSITORIO%2F)](https://SEU-UTILIZADOR.github.io/SEU-REPOSITORIO/)
[![GitHub last commit](https://img.shields.io/github/last-commit/SEU-UTILIZADOR/SEU-REPOSITORIO)](https://github.com/SEU-UTILIZADOR/SEU-REPOSITORIO)
[![GitHub repo size](https://img.shields.io/github/repo-size/SEU-UTILIZADOR/SEU-REPOSITORIO)](https://github.com/SEU-UTILIZADOR/SEU-REPOSITORIO)
[![GitHub Pages](https://img.shields.io/badge/deployment-GitHub%20Pages-222222?logo=github)](https://pages.github.com/)
[![Static Website](https://img.shields.io/badge/type-static%20website-009846)](#)

# 🏢 Vertis — Portal Interno de Procedimentos e Ferramentas

> Portal interno desenvolvido para apoiar a operação diária da **Vertis — Gestão de Condomínios**.  
> O projeto reúne procedimentos operacionais, pesquisa, filtros, impressão individual e ferramentas de apoio à gestão, incluindo uma calculadora de orçamentos com fases de pagamento e regimes de IVA configuráveis.

---

## 📸 Pré-visualização

Adicione uma imagem do portal neste caminho:

```text
assets/preview.jpg
```

Depois, retire o comentário da linha seguinte:

<!-- ![Pré-visualização do Portal Vertis](assets/preview.jpg) -->

---

## 🌐 Site

🔗 [Abrir o Portal Vertis](https://SEU-UTILIZADOR.github.io/SEU-REPOSITORIO/)

> Substitua `SEU-UTILIZADOR` e `SEU-REPOSITORIO` pelo utilizador e nome reais do repositório no GitHub.

---

## ✨ Funcionalidades

- 📚 **Manual de procedimentos** organizado por categoria
- 🔎 **Pesquisa** por título, objetivo, responsável, passo ou documento
- 🗂️ **Filtros e ordenação** dos procedimentos
- 🖨️ **Impressão individual** de cada procedimento
- 🖼️ **Imagens associadas aos passos**
- 🔗 **Ligações diretas** para procedimentos específicos
- 🔐 **Código visual de acesso** à área de procedimentos
- 🧰 **Área de ferramentas**
- 💶 **Calculadora de orçamentos**
- 🧾 **IVA configurável** por taxa e percentagem da base
- 📊 **Fases de pagamento dinâmicas**
- 📋 **Modelos de texto prontos a copiar**
- 📱 **Interface responsiva** para computador, tablet e telemóvel
- 🌐 **Publicação direta no GitHub Pages**

---

## 🧮 Calculadora de Orçamentos

A calculadora permite configurar:

- valor total da obra sem IVA;
- adjudicação;
- pagamentos intermediários;
- pagamento final;
- número livre de fases;
- taxa de IVA;
- percentagem da base sujeita a cada taxa.

As fases de pagamento e a distribuição do IVA devem totalizar **100%**.

### Formatação monetária

Os valores são apresentados no formato português:

```text
18.500,00€
```

### Modelos disponíveis

A calculadora inclui quatro botões de cópia:

- **Pagamento da adjudicação**
- **Pagamento intermédio**
- **Pagamento final**
- **Orçamentação**

Os valores e percentagens conhecidos são preenchidos automaticamente. Os restantes campos ficam preparados para preenchimento pelos colaboradores.

---

## 🛠️ Tecnologias

- 🌐 **HTML5**
- 🎨 **CSS3**
- ⚙️ **JavaScript**
- 📄 **CSV**
- 📦 **GitHub Pages**
- 🔒 **Session Storage** para manter o estado de acesso durante a sessão
- 🧩 **Sem frameworks**
- 🗄️ **Sem base de dados**
- 🖥️ **Sem backend**

---

## 📁 Estrutura do Projeto

```text
/
├── index.html
├── styles.css
├── app.js
├── .nojekyll
├── README.md
├── PUBLICAR_GITHUB_PAGES.md
│
├── assets/
│   ├── branding/
│   │   ├── logo.jpg
│   │   ├── icon.jpg
│   │   └── LEIA-ME.txt
│   │
│   └── imagens/
│       └── procedimentos/
│           └── nome-do-procedimento/
│               ├── 01-primeiro-passo.webp
│               └── 02-segundo-passo.webp
│
└── procedimentos/
    ├── index.js
    ├── MODELO_PROCEDIMENTO.csv
    ├── 01_registo_ocorrencias.csv
    ├── 02_pagamento_fornecedores.csv
    ├── 03_preparacao_assembleia.csv
    └── ...
```

---

## 🚀 Executar Localmente

Como o portal carrega ficheiros CSV através de JavaScript, não é recomendado abrir diretamente o `index.html` através de `file://`.

### Opção 1 — Python

Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois, abrir:

```text
http://127.0.0.1:8000
```

### Opção 2 — VS Code

1. Instalar a extensão **Live Server**
2. Abrir a pasta do projeto
3. Clicar com o botão direito em `index.html`
4. Escolher **Open with Live Server**

---

## 📦 Publicação no GitHub Pages

No repositório, abrir:

```text
Settings → Pages
```

Configurar:

```text
Source: Deploy from a branch
Branch: main
Folder: /(root)
```

A raiz do repositório deve conter diretamente:

```text
index.html
styles.css
app.js
procedimentos/
assets/
```

Depois do `commit` e `push`, acompanhar a publicação em:

```text
Actions
```

---

## 📄 Adicionar um Procedimento

### 1. Duplicar o modelo

```text
procedimentos/MODELO_PROCEDIMENTO.csv
```

### 2. Dar um nome ao ficheiro

Exemplo:

```text
10_validacao_contratos.csv
```

Recomendações:

- utilizar letras minúsculas;
- evitar espaços;
- evitar acentos;
- usar `_` para separar palavras;
- manter numeração inicial.

### 3. Registar o ficheiro

Abrir:

```text
procedimentos/index.js
```

Adicionar o nome do novo CSV:

```javascript
window.VERTIS_PROCEDURE_FILES = [
  "01_registo_ocorrencias.csv",
  "02_pagamento_fornecedores.csv",
  "10_validacao_contratos.csv"
];
```

---

## 🧾 Formato dos Procedimentos

Cada ficheiro CSV representa um procedimento.

Cada linha representa um passo.

### Colunas obrigatórias

```text
titulo
categoria
passo_numero
passo_descricao
```

### Colunas disponíveis

```text
id
titulo
categoria
ordem
responsavel
objetivo
passo_numero
passo_titulo
passo_descricao
passo_imagem
passo_imagem_alt
passo_imagem_legenda
prazo
documentos
observacoes
ativo
versao
ultima_revisao
```

O separador utilizado é:

```text
;
```

Os ficheiros devem ser guardados em **UTF-8**.

---

## 🖼️ Imagens nos Procedimentos

As imagens devem ser guardadas em:

```text
assets/imagens/procedimentos/nome-do-procedimento/
```

Exemplo:

```text
assets/imagens/procedimentos/registo-ocorrencias/01-receber-ocorrencia.webp
```

No CSV:

```csv
passo_imagem;passo_imagem_alt;passo_imagem_legenda
assets/imagens/procedimentos/registo-ocorrencias/01-receber-ocorrencia.webp;Formulário de registo;Dados necessários para o registo inicial.
```

Boas práticas:

- preferir `.webp`;
- usar nomes em minúsculas;
- não usar espaços;
- preencher sempre o texto alternativo;
- não iniciar o caminho por `/`.

---

## 🎨 Logótipo e Ícone

Colocar as imagens em:

```text
assets/branding/logo.jpg
assets/branding/icon.jpg
```

### `logo.jpg`

Utilizado:

- na barra superior;
- no menu lateral.

Formato recomendado:

```text
600 × 180 píxeis
```

### `icon.jpg`

Utilizado:

- como favicon;
- como ícone de atalho em dispositivos móveis.

Formato recomendado:

```text
512 × 512 píxeis
```

---

## 🔐 Acesso aos Procedimentos

A área de procedimentos utiliza um código visual de acesso.

Código atual:

```text
2011
```

> Esta proteção não substitui autenticação real. Como o projeto é estático e publicado no GitHub Pages, os ficheiros continuam tecnicamente acessíveis através dos respetivos endereços públicos.

Não devem ser colocados no repositório:

- dados pessoais;
- passwords;
- documentos confidenciais;
- informação bancária sensível;
- contratos reservados;
- dados privados de condóminos.

---

## 🧹 Manutenção

Antes de publicar alterações:

1. validar os ficheiros CSV;
2. confirmar que os passos estão numerados;
3. verificar os caminhos das imagens;
4. testar pesquisa, filtros e categorias;
5. testar a calculadora;
6. verificar a versão móvel;
7. fazer `commit` com uma mensagem clara.

Exemplo:

```bash
git add .
git commit -m "Atualiza procedimentos e calculadora"
git push
```

---

## 🐛 Resolução de Problemas

### O site aparece sem estilos

Confirmar que este endereço abre corretamente:

```text
https://SEU-UTILIZADOR.github.io/SEU-REPOSITORIO/styles.css
```

### Os procedimentos não aparecem

Verificar:

- se o CSV está dentro de `procedimentos/`;
- se o ficheiro foi adicionado a `procedimentos/index.js`;
- se as colunas obrigatórias existem;
- se a coluna `ativo` está definida como `1`;
- se o nome respeita maiúsculas e minúsculas.

### O GitHub Pages procura a pasta `/docs`

Em:

```text
Settings → Pages
```

Selecionar:

```text
Branch: main
Folder: /(root)
```

### O logótipo ou ícone não aparece

Confirmar os caminhos:

```text
assets/branding/logo.jpg
assets/branding/icon.jpg
```

E atualizar a página com:

```text
Ctrl + F5
```

---

## 🛠️ Créditos

- Desenvolvido para **Vertis — Gestão de Condomínios**
- Interface, procedimentos e ferramentas adaptados ao fluxo operacional interno
- Publicação através de **GitHub Pages**

---

## 📄 Utilização

Este projeto destina-se a utilização interna da Vertis.

A reprodução, distribuição ou adaptação fora do contexto autorizado deve ser previamente aprovada pela administração da empresa.
