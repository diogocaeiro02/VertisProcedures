/**
 * Manual de Procedimentos Vertis
 *
 * A aplicação é totalmente estática. Os nomes dos ficheiros CSV
 * disponíveis no repositório são definidos em procedimentos/index.js.
 */

const REQUIRED_COLUMNS = [
  "titulo",
  "categoria",
  "passo_numero",
  "passo_descricao"
];

const PROCEDURES_SESSION_KEY = "vertis-procedures-unlocked";
const PROCEDURES_ACCESS_HASH =
  "72d1b5da6eeaf1789df86487da50ad5e9dadb5ffaecb56b6de592aa286c9c1b8";

const state = {
  procedures: [],
  errors: [],
  selectedCategory: "",
  proceduresUnlocked: readProceduresUnlockState(),
  pendingProtectedTarget: "#procedimentos",
  calculatorData: null
};

const elements = {
  menuButton: document.getElementById("menuButton"),
  sidebar: document.getElementById("sidebar"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  loadStatus: document.getElementById("loadStatus"),

  categoryNavigation: document.getElementById("categoryNavigation"),
  procedureNavigation: document.getElementById("procedureNavigation"),
  categoryCount: document.getElementById("categoryCount"),
  sidebarProcedureCount: document.getElementById("sidebarProcedureCount"),

  procedureCount: document.getElementById("procedureCount"),
  stepCount: document.getElementById("stepCount"),
  overviewCategoryCount: document.getElementById("overviewCategoryCount"),

  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortSelect: document.getElementById("sortSelect"),
  clearFiltersButton: document.getElementById("clearFiltersButton"),
  resultsSummary: document.getElementById("resultsSummary"),
  messageBox: document.getElementById("messageBox"),
  manualContent: document.getElementById("manualContent"),

  expandAllButton: document.getElementById("expandAllButton"),
  collapseAllButton: document.getElementById("collapseAllButton"),
  backToTopButton: document.getElementById("backToTopButton"),
  breadcrumbCurrent: document.getElementById("breadcrumbCurrent"),

  proceduresNavLock: document.getElementById("proceduresNavLock"),
  proceduresLockScreen: document.getElementById("proceduresLockScreen"),
  proceduresProtectedContent:
    document.getElementById("proceduresProtectedContent"),
  proceduresHeadingActions:
    document.getElementById("proceduresHeadingActions"),
  openAccessButton: document.getElementById("openAccessButton"),
  lockProceduresButton: document.getElementById("lockProceduresButton"),

  accessModal: document.getElementById("accessModal"),
  accessForm: document.getElementById("accessForm"),
  accessCodeInput: document.getElementById("accessCodeInput"),
  accessError: document.getElementById("accessError"),
  unlockProceduresButton:
    document.getElementById("unlockProceduresButton"),

  budgetCalculatorForm:
    document.getElementById("budgetCalculatorForm"),
  budgetAmount: document.getElementById("budgetAmount"),

  paymentPhaseRows:
    document.getElementById("paymentPhaseRows"),
  addPaymentPhaseButton:
    document.getElementById("addPaymentPhaseButton"),
  paymentPercentageTotal:
    document.getElementById("paymentPercentageTotal"),

  vatRows: document.getElementById("vatRows"),
  addVatRowButton: document.getElementById("addVatRowButton"),
  vatAllocationTotal:
    document.getElementById("vatAllocationTotal"),

  calculatorMessage: document.getElementById("calculatorMessage"),
  resetBudgetCalculator:
    document.getElementById("resetBudgetCalculator"),

  baseAmountResult: document.getElementById("baseAmountResult"),
  vatAmountResult: document.getElementById("vatAmountResult"),
  totalAmountResult: document.getElementById("totalAmountResult"),

  paymentSplit: document.getElementById("paymentSplit"),
  paymentBreakdownBody:
    document.getElementById("paymentBreakdownBody"),
  vatBreakdownBody: document.getElementById("vatBreakdownBody")
};


/**
 * Recupera o estado de desbloqueio apenas para a sessão atual.
 */
function readProceduresUnlockState() {
  try {
    return sessionStorage.getItem(PROCEDURES_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}


/**
 * Guarda ou remove o desbloqueio da sessão.
 */
function persistProceduresUnlockState(unlocked) {
  try {
    if (unlocked) {
      sessionStorage.setItem(PROCEDURES_SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(PROCEDURES_SESSION_KEY);
    }
  } catch {
    // O manual continua a funcionar mesmo sem acesso ao sessionStorage.
  }
}


/**
 * Calcula SHA-256 para comparar o código sem o guardar em texto simples.
 */
async function sha256(value) {
  if (!window.crypto?.subtle) {
    return value === "2011" ? PROCEDURES_ACCESS_HASH : "";
  }

  const data = new TextEncoder().encode(value);
  const hash = await window.crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(hash)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}


/**
 * Atualiza a interface protegida dos procedimentos.
 */
function syncProceduresAccessUi() {
  const unlocked = state.proceduresUnlocked;

  elements.proceduresLockScreen.hidden = unlocked;
  elements.proceduresProtectedContent.hidden = !unlocked;
  elements.proceduresHeadingActions.hidden = !unlocked;

  elements.proceduresNavLock.textContent = unlocked ? "✓" : "●";
  elements.proceduresNavLock.classList.toggle("unlocked", unlocked);

  if (!unlocked) {
    elements.resultsSummary.textContent = "Acesso protegido";
  }
}


/**
 * Mostra a navegação lateral bloqueada.
 */
function renderLockedProcedureNavigation() {
  elements.categoryCount.textContent = "—";
  elements.sidebarProcedureCount.textContent = "—";

  elements.categoryNavigation.innerHTML = `
    <button class="sidebar-locked-link"
            type="button"
            data-request-procedures="true">
      <span aria-hidden="true">⌁</span>
      Introduzir código
    </button>
  `;

  elements.procedureNavigation.innerHTML = `
    <div class="sidebar-placeholder">
      Desbloqueie os procedimentos para consultar o manual.
    </div>
  `;
}


/**
 * Abre a janela de código e guarda o destino pretendido.
 */
function requestProceduresAccess(target = "#procedimentos") {
  state.pendingProtectedTarget = target;
  elements.accessError.textContent = "";
  elements.accessCodeInput.value = "";
  elements.accessModal.hidden = false;
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    elements.accessCodeInput.focus();
  });
}


/**
 * Fecha a janela de código.
 */
function closeAccessModal() {
  elements.accessModal.hidden = true;
  elements.accessError.textContent = "";
  document.body.classList.remove("modal-open");
}


/**
 * Navega para o destino protegido depois do desbloqueio.
 */
function navigateToProtectedTarget(target) {
  const safeTarget = target || "#procedimentos";

  window.location.hash = safeTarget;

  requestAnimationFrame(() => {
    const destination = document.querySelector(safeTarget);

    if (destination) {
      destination.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    openHashTarget();
  });
}


/**
 * Valida o código e desbloqueia os procedimentos.
 */
async function unlockProcedures(code) {
  elements.unlockProceduresButton.disabled = true;
  elements.accessError.textContent = "A validar…";

  try {
    const hash = await sha256(code);

    if (hash !== PROCEDURES_ACCESS_HASH) {
      elements.accessError.textContent = "Código incorreto.";
      elements.accessCodeInput.select();
      elements.accessModal
        .querySelector(".access-modal-dialog")
        ?.classList.add("access-denied");

      window.setTimeout(() => {
        elements.accessModal
          .querySelector(".access-modal-dialog")
          ?.classList.remove("access-denied");
      }, 350);

      return;
    }

    state.proceduresUnlocked = true;
    persistProceduresUnlockState(true);
    closeAccessModal();
    syncProceduresAccessUi();
    renderCategoryNavigation();
    renderManual();
    renderErrors();

    navigateToProtectedTarget(state.pendingProtectedTarget);
  } finally {
    elements.unlockProceduresButton.disabled = false;
  }
}


/**
 * Volta a bloquear os procedimentos.
 */
function lockProcedures() {
  state.proceduresUnlocked = false;
  state.selectedCategory = "";
  persistProceduresUnlockState(false);

  elements.searchInput.value = "";
  elements.categoryFilter.value = "";
  elements.sortSelect.value = "order";

  renderLockedProcedureNavigation();
  syncProceduresAccessUi();

  const url = new URL(window.location.href);
  url.hash = "procedimentos";
  window.history.replaceState(null, "", url);

  document.getElementById("procedimentos").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/**
 * Converte texto monetário português para número.
 */
function parsePortugueseNumber(value) {
  let text = String(value ?? "")
    .replace(/[€\s\u00A0]/g, "")
    .trim();

  if (!text) {
    return 0;
  }

  if (text.includes(",")) {
    text = text.replace(/\./g, "").replace(",", ".");
  }

  const number = Number(text);
  return Number.isFinite(number) ? number : Number.NaN;
}


/**
 * Formata um número com ponto nos milhares e vírgula nos cêntimos.
 */
function formatPortugueseNumber(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue < 0 ? "-" : "";
  const [integerPart, decimalPart] = Math.abs(safeValue)
    .toFixed(2)
    .split(".");

  const groupedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  return `${sign}${groupedInteger},${decimalPart}`;
}


/**
 * Formata valores monetários como 18.500,00€.
 */
function formatCurrency(value) {
  return `${formatPortugueseNumber(value)}€`;
}


/**
 * Formata o valor editável sem o símbolo de euro.
 */
function formatEditableAmount(value) {
  return formatPortugueseNumber(value);
}


/**
 * Limita uma percentagem ao intervalo entre 0 e 100.
 */
function normalizePercentage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, number));
}


/**
 * Formata percentagens sem zeros desnecessários.
 */
function formatPercentage(value) {
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}


/**
 * Normaliza texto para identificar as fases principais.
 */
function normalizeLabel(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


/**
 * Calcula quantos pagamentos intermediários devem aparecer na lista.
 */
function getPaymentIntermediateLimit(extraName = "") {
  const names = [
    ...elements.paymentPhaseRows.querySelectorAll(
      ".payment-phase-name"
    )
  ]
    .map(select => select.value)
    .concat(extraName);

  const highestExistingNumber = names.reduce(
    (highest, name) => {
      const match = normalizeLabel(name).match(
        /pagamento intermediario\s+(\d+)/
      );

      return match
        ? Math.max(highest, Number(match[1]))
        : highest;
    },
    0
  );

  const rowCount = elements.paymentPhaseRows
    .querySelectorAll(".phase-editor-row").length;

  return Math.max(
    10,
    highestExistingNumber + 3,
    rowCount + 5
  );
}


/**
 * Devolve as designações disponíveis para uma fase.
 */
function getPaymentPhaseOptionNames(selectedName = "") {
  const names = ["Adjudicação"];
  const limit = getPaymentIntermediateLimit(selectedName);

  for (let number = 1; number <= limit; number += 1) {
    names.push(`Pagamento Intermediário ${number}`);
  }

  names.push("Pagamento Final");

  if (selectedName && !names.includes(selectedName)) {
    names.splice(names.length - 1, 0, selectedName);
  }

  return names;
}


/**
 * Gera as opções da lista de designações.
 */
function renderPaymentPhaseOptions(selectedName) {
  return getPaymentPhaseOptionNames(selectedName)
    .map(name => `
      <option value="${escapeHtml(name)}"
              ${name === selectedName ? "selected" : ""}>
        ${escapeHtml(name)}
      </option>
    `)
    .join("");
}


/**
 * Impede designações repetidas nas várias linhas.
 */
function refreshPaymentPhaseOptions() {
  const selects = [
    ...elements.paymentPhaseRows.querySelectorAll(
      ".payment-phase-name"
    )
  ];

  const selectedNames = selects.map(select => select.value);

  selects.forEach((select, selectIndex) => {
    const currentName = selectedNames[selectIndex];

    select.innerHTML = renderPaymentPhaseOptions(currentName);
    select.value = currentName;

    [...select.options].forEach(option => {
      option.disabled = selectedNames.some(
        (selectedName, selectedIndex) =>
          selectedIndex !== selectIndex &&
          selectedName === option.value
      );
    });
  });
}


/**
 * Escolhe o próximo pagamento intermediário disponível.
 */
function getNextPaymentPhaseName() {
  const usedNames = new Set(
    [
      ...elements.paymentPhaseRows.querySelectorAll(
        ".payment-phase-name"
      )
    ].map(select => select.value)
  );

  let number = 1;

  while (
    usedNames.has(`Pagamento Intermediário ${number}`)
  ) {
    number += 1;
  }

  return `Pagamento Intermediário ${number}`;
}


/**
 * Cria uma linha editável de fase de pagamento.
 */
function createPaymentPhaseRow(
  name = "Pagamento Intermediário 1",
  percentage = 0
) {
  const row = document.createElement("div");
  row.className = "phase-editor-row";

  row.innerHTML = `
    <label class="phase-name-field">
      <select class="payment-phase-name"
              aria-label="Designação da fase">
        ${renderPaymentPhaseOptions(name)}
      </select>
    </label>

    <label class="phase-percentage-field">
      <div class="percentage-input">
        <input class="payment-phase-percentage"
               type="number"
               min="0"
               max="100"
               step="0.01"
               value="${escapeHtml(percentage)}">
        <span>%</span>
      </div>
    </label>

    <button class="phase-remove-button"
            type="button"
            data-remove-payment-phase
            aria-label="Remover fase de pagamento">
      ×
    </button>
  `;

  return row;
}


/**
 * Cria uma linha editável para uma taxa de IVA.
 */
function createVatRow(rate = 0, allocation = 0) {
  const row = document.createElement("div");
  row.className = "vat-editor-row";

  row.innerHTML = `
    <label class="vat-rate-field">
      <div class="percentage-input">
        <input class="vat-rate"
               aria-label="Taxa de IVA"
               type="number"
               min="0"
               max="100"
               step="0.01"
               value="${escapeHtml(rate)}">
        <span>%</span>
      </div>
    </label>

    <label class="vat-allocation-field">
      <div class="percentage-input">
        <input class="vat-allocation"
               aria-label="Percentagem da base"
               type="number"
               min="0"
               max="100"
               step="0.01"
               value="${escapeHtml(allocation)}">
        <span>%</span>
      </div>
    </label>

    <button class="vat-remove-button"
            type="button"
            data-remove-vat-row
            aria-label="Remover taxa de IVA">
      ×
    </button>
  `;

  return row;
}


/**
 * Lê todas as fases de pagamento configuradas.
 */
function getPaymentPhases() {
  return [
    ...elements.paymentPhaseRows.querySelectorAll(
      ".phase-editor-row"
    )
  ].map((row, index) => {
    const name = row
      .querySelector(".payment-phase-name")
      ?.value.trim();

    return {
      index,
      name: name || `Fase ${index + 1}`,
      percentage: normalizePercentage(
        row.querySelector(".payment-phase-percentage")
          ?.value
      )
    };
  });
}


/**
 * Lê todas as linhas da distribuição de IVA.
 */
function getVatRows() {
  return [
    ...elements.vatRows.querySelectorAll(".vat-editor-row")
  ].map(row => ({
    rate: normalizePercentage(
      row.querySelector(".vat-rate")?.value
    ),
    allocation: normalizePercentage(
      row.querySelector(".vat-allocation")?.value
    )
  }));
}


/**
 * Atualiza o estado visual dos totais percentuais.
 */
function updatePercentageStatus(element, value, valid) {
  element.textContent = `${formatPercentage(value)}%`;
  element.classList.toggle("percentage-total-valid", valid);
  element.classList.toggle("percentage-total-invalid", !valid);
}


/**
 * Devolve uma classe visual para cada fase.
 */
function getPaymentSegmentClass(index) {
  return `payment-segment-tone-${(index % 6) + 1}`;
}


/**
 * Apresenta resultados vazios quando a configuração é inválida.
 */
function clearBudgetResults() {
  elements.baseAmountResult.textContent = "—";
  elements.vatAmountResult.textContent = "—";
  elements.totalAmountResult.textContent = "—";

  elements.paymentSplit.innerHTML = "";

  elements.paymentBreakdownBody.innerHTML = `
    <tr>
      <td colspan="5" class="empty-table-cell">
        Corrija as percentagens para apresentar os resultados.
      </td>
    </tr>
  `;

  elements.vatBreakdownBody.innerHTML = `
    <tr>
      <td colspan="4" class="empty-table-cell">
        Corrija as percentagens para apresentar os resultados.
      </td>
    </tr>
  `;

  state.calculatorData = null;
}


/**
 * Cria uma descrição legível do regime de IVA.
 */
function buildVatDescriptor(vatDetails) {
  if (
    vatDetails.length === 1 &&
    Math.abs(vatDetails[0].allocation - 100) < 0.001
  ) {
    return `${formatPercentage(vatDetails[0].rate)}%`;
  }

  return vatDetails
    .map(row =>
      `${formatPercentage(row.allocation)}% a ` +
      `${formatPercentage(row.rate)}%`
    )
    .join(" + ");
}


/**
 * Atualiza todos os resultados da calculadora.
 */
function calculateBudget() {
  const baseAmount = parsePortugueseNumber(
    elements.budgetAmount.value
  );

  const phases = getPaymentPhases();
  const vatRows = getVatRows();

  const paymentTotal = phases.reduce(
    (total, phase) => total + phase.percentage,
    0
  );

  const vatAllocationTotal = vatRows.reduce(
    (total, row) => total + row.allocation,
    0
  );

  const paymentValid =
    phases.length > 0 &&
    Math.abs(paymentTotal - 100) < 0.001;

  const vatValid =
    vatRows.length > 0 &&
    Math.abs(vatAllocationTotal - 100) < 0.001;

  updatePercentageStatus(
    elements.paymentPercentageTotal,
    paymentTotal,
    paymentValid
  );

  updatePercentageStatus(
    elements.vatAllocationTotal,
    vatAllocationTotal,
    vatValid
  );

  const messages = [];

  if (!Number.isFinite(baseAmount) || baseAmount < 0) {
    messages.push(
      "Introduza um valor válido e igual ou superior a zero."
    );
  }

  if (!paymentValid) {
    messages.push(
      `As fases de pagamento totalizam ` +
      `${formatPercentage(paymentTotal)}%. ` +
      "Devem totalizar 100%."
    );
  }

  if (!vatValid) {
    messages.push(
      `A distribuição do IVA totaliza ` +
      `${formatPercentage(vatAllocationTotal)}%. ` +
      "Deve totalizar 100%."
    );
  }

  elements.calculatorMessage.textContent = messages.join(" ");

  if (messages.length > 0) {
    clearBudgetResults();
    return;
  }

  const vatDetails = vatRows.map(row => {
    const taxableBase =
      baseAmount * (row.allocation / 100);

    const vatAmount =
      taxableBase * (row.rate / 100);

    return {
      ...row,
      taxableBase,
      vatAmount
    };
  });

  const totalVat = vatDetails.reduce(
    (total, row) => total + row.vatAmount,
    0
  );

  const totalAmount = baseAmount + totalVat;

  const calculatedPhases = phases.map(phase => {
    const ratio = phase.percentage / 100;

    return {
      ...phase,
      baseAmount: baseAmount * ratio,
      vatAmount: totalVat * ratio,
      totalAmount: totalAmount * ratio
    };
  });

  elements.baseAmountResult.textContent =
    formatCurrency(baseAmount);

  elements.vatAmountResult.textContent =
    formatCurrency(totalVat);

  elements.totalAmountResult.textContent =
    formatCurrency(totalAmount);

  elements.paymentSplit.innerHTML = calculatedPhases
    .filter(phase => phase.percentage > 0)
    .map((phase, index) => `
      <div class="payment-split-segment
                  ${getPaymentSegmentClass(index)}"
           style="width: ${phase.percentage}%"
           title="${escapeHtml(phase.name)}: ${formatPercentage(phase.percentage)}%">
        <span>${formatPercentage(phase.percentage)}%</span>
      </div>
    `)
    .join("");

  elements.paymentBreakdownBody.innerHTML =
    calculatedPhases
      .map(phase => `
        <tr>
          <th>${escapeHtml(phase.name)}</th>
          <td>${formatPercentage(phase.percentage)}%</td>
          <td>${formatCurrency(phase.baseAmount)}</td>
          <td>${formatCurrency(phase.vatAmount)}</td>
          <td>${formatCurrency(phase.totalAmount)}</td>
        </tr>
      `)
      .join("");

  elements.vatBreakdownBody.innerHTML = vatDetails
    .map(row => `
      <tr>
        <th>${formatPercentage(row.rate)}%</th>
        <td>${formatPercentage(row.allocation)}%</td>
        <td>${formatCurrency(row.taxableBase)}</td>
        <td>${formatCurrency(row.vatAmount)}</td>
      </tr>
    `)
    .join("");

  state.calculatorData = {
    baseAmount,
    totalVat,
    totalAmount,
    phases: calculatedPhases,
    vatDetails,
    vatDescriptor: buildVatDescriptor(vatDetails)
  };
}


/**
 * Repõe os valores iniciais da calculadora.
 */
function resetBudgetCalculator() {
  elements.budgetAmount.value = "10.000,00";

  elements.paymentPhaseRows.innerHTML = "";
  elements.paymentPhaseRows.append(
    createPaymentPhaseRow("Adjudicação", 40),
    createPaymentPhaseRow("Pagamento Intermediário 1", 30),
    createPaymentPhaseRow("Pagamento Final", 30)
  );

  refreshPaymentPhaseOptions();

  elements.vatRows.innerHTML = "";
  elements.vatRows.append(
    createVatRow(6, 70),
    createVatRow(23, 30)
  );

  calculateBudget();
}


/**
 * Localiza uma fase padrão através da sua designação.
 */
function findStandardPhase(type) {
  if (!state.calculatorData) {
    return null;
  }

  const matchers = {
    award: label => label.includes("adjudic"),
    intermediate: label =>
      label.includes("intermed") ||
      label.includes("intermedi"),
    final: label => label.includes("final")
  };

  const matcher = matchers[type];

  return state.calculatorData.phases.find(phase =>
    matcher(normalizeLabel(phase.name))
  ) || null;
}


/**
 * Cria o modelo de texto pedido para copiar.
 */
function buildBudgetTemplate(type) {
  const data = state.calculatorData;

  if (!data) {
    return null;
  }

  const award = findStandardPhase("award");
  const intermediate = findStandardPhase("intermediate");
  const final = findStandardPhase("final");

  if (type === "award") {
    const percentage = award
      ? `${formatPercentage(award.percentage)}%`
      : "X%";

    const amount = award
      ? formatCurrency(award.totalAmount)
      : "X€";

    return [
      "Pagamento Adjudicação",
      "",
      "Nº Ata: X (Assinada e Válida)",
      "Intervenção:",
      "Data de Início:",
      "Despesa: DXXX",
      `Valor Total Obra s/ IVA: ${formatCurrency(data.baseAmount)}`,
      `Valor Total Obra c/ IVA: ${formatCurrency(data.totalAmount)}`,
      `Adjudicação (${percentage}): ${amount}`,
      "Fornecedor:",
      "IBAN: PT50"
    ].join("\n");
  }

  if (type === "intermediate") {
    const percentage = intermediate
      ? `${formatPercentage(intermediate.percentage)}%`
      : "X%";

    const amount = intermediate
      ? formatCurrency(intermediate.totalAmount)
      : "X€";

    return [
      "Pagamento Intermediário",
      "",
      "Intervenção:",
      "Fornecedor: (nosso fornecedor)",
      "Despesa: DXXX",
      `Valor c/ IVA (${percentage}): ${amount}`,
      "IBAN: PT50"
    ].join("\n");
  }

  if (type === "final") {
    const percentage = final
      ? `${formatPercentage(final.percentage)}%`
      : "X%";

    const amount = final
      ? formatCurrency(final.totalAmount)
      : "X€";

    return [
      "Pagamento Final",
      "",
      "Intervenção:",
      "Fornecedor: (nosso fornecedor)",
      "Despesa: DXXX",
      `Valor c/ IVA (${percentage}): ${amount}`,
      "IBAN: PT50"
    ].join("\n");
  }

  return [
    "Orçamentação",
    "",
    "Fornecedor:",
    `Valor s/ IVA: ${formatCurrency(data.baseAmount)}`,
    `Valor c/ IVA (${data.vatDescriptor}): ${formatCurrency(data.totalAmount)}`,
    "",
    "Descrição:"
  ].join("\n");
}


/**
 * Copia um dos quatro modelos da calculadora.
 */
async function copyBudgetTemplate(type, button) {
  calculateBudget();

  const template = buildBudgetTemplate(type);

  if (!template) {
    elements.calculatorMessage.textContent =
      "Corrija os valores e as percentagens antes de copiar.";
    return;
  }

  const originalText = button.textContent.trim();

  try {
    await navigator.clipboard.writeText(template);
    button.textContent = "Copiado";

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1800);
  } catch {
    elements.calculatorMessage.textContent =
      "Não foi possível copiar automaticamente o texto.";
  }
}


/**
 * Evita que conteúdo proveniente dos CSV seja interpretado como HTML.
 */
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}


/**
 * Normaliza valores lidos do CSV.
 */
function normalize(value) {
  return String(value ?? "").trim();
}


/**
 * Normaliza nomes de colunas.
 */
function normalizeKey(value) {
  return normalize(value).toLowerCase();
}


/**
 * Cria identificadores seguros para URLs e elementos HTML.
 */
function slug(value) {
  return normalize(value || "procedimento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


/**
 * Interpreta o campo "ativo".
 */
function isActive(value) {
  return !["0", "false", "não", "nao", "inativo"].includes(
    normalize(value || "1").toLowerCase()
  );
}


/**
 * Converte um CSV para uma lista de objetos.
 *
 * Suporta:
 * - separador por ponto e vírgula ou vírgula;
 * - texto entre aspas;
 * - aspas duplicadas;
 * - quebras de linha dentro de campos entre aspas;
 * - UTF-8 com BOM.
 */
function parseCsv(text) {
  const cleanText = text.replace(/^\uFEFF/, "");
  const firstLine = cleanText.split(/\r?\n/, 1)[0] || "";

  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = semicolonCount >= commaCount ? ";" : ",";

  const matrix = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < cleanText.length; index += 1) {
    const character = cleanText[index];
    const nextCharacter = cleanText[index + 1];

    if (character === '"') {
      if (quoted && nextCharacter === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if (
      (character === "\n" || character === "\r") &&
      !quoted
    ) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(cell);

      if (row.some(value => normalize(value) !== "")) {
        matrix.push(row);
      }

      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);

  if (row.some(value => normalize(value) !== "")) {
    matrix.push(row);
  }

  if (!matrix.length) {
    return [];
  }

  const headers = matrix[0].map(normalizeKey);

  return matrix.slice(1).map(values => {
    const item = {};

    headers.forEach((header, index) => {
      item[header] = normalize(values[index] ?? "");
    });

    return item;
  });
}


/**
 * Converte as linhas de um CSV num procedimento.
 */
function rowsToProcedure(rows, filename) {
  const cleanRows = rows.filter(row =>
    Object.values(row).some(Boolean)
  );

  if (!cleanRows.length) {
    throw new Error("O ficheiro está vazio.");
  }

  const missingColumns = REQUIRED_COLUMNS.filter(
    column => !(column in cleanRows[0])
  );

  if (missingColumns.length) {
    throw new Error(
      `Faltam as colunas: ${missingColumns.join(", ")}.`
    );
  }

  const activeRows = cleanRows.filter(row => isActive(row.ativo));

  if (!activeRows.length) {
    return null;
  }

  const firstRow = activeRows[0];

  if (!firstRow.titulo) {
    throw new Error("O título não está preenchido.");
  }

  if (!firstRow.categoria) {
    throw new Error("A categoria não está preenchida.");
  }

  const steps = activeRows
    .map((row, index) => {
      if (!row.passo_descricao) {
        throw new Error(
          `O passo ${index + 1} não tem descrição.`
        );
      }

      return {
        number: Number(row.passo_numero) || index + 1,
        title: row.passo_titulo || "",
        description: row.passo_descricao,
        deadline: row.prazo || "",
        documents: row.documentos || "",
        notes: row.observacoes || "",
        image: row.passo_imagem || "",
        imageAlt: row.passo_imagem_alt || "",
        imageCaption: row.passo_imagem_legenda || ""
      };
    })
    .sort((left, right) => left.number - right.number);

  return {
    id: firstRow.id || slug(firstRow.titulo),
    title: firstRow.titulo,
    category: firstRow.categoria,
    order: Number(firstRow.ordem) || 10,
    owner: firstRow.responsavel || "Não definido",
    objective: firstRow.objetivo || "Não indicado",
    version: firstRow.versao || "1.0",
    reviewDate: firstRow.ultima_revisao || "",
    filename,
    steps
  };
}


/**
 * Indica se a navegação está no modo móvel.
 */
function isMobileSidebar() {
  return window.innerWidth <= 900;
}


/**
 * Fecha o menu lateral apenas no modo móvel.
 *
 * No computador, os cliques na navegação não devem alterar o estado
 * recolhido ou expandido escolhido através do botão de menu.
 */
function closeSidebar() {
  if (!isMobileSidebar()) {
    return;
  }

  elements.sidebar.classList.remove("open");
  elements.sidebarOverlay.hidden = true;
  elements.menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("sidebar-open");
}


/**
 * Abre ou fecha o menu lateral.
 *
 * Em computador, o menu recolhe a barra lateral e liberta toda a largura
 * para o conteúdo. Em telemóvel e tablet, funciona como painel sobreposto.
 */
function toggleSidebar() {
  if (!isMobileSidebar()) {
    const willCollapse = !document.body.classList.contains(
      "sidebar-collapsed"
    );

    document.body.classList.toggle(
      "sidebar-collapsed",
      willCollapse
    );

    elements.sidebarOverlay.hidden = true;
    elements.menuButton.setAttribute(
      "aria-expanded",
      String(!willCollapse)
    );

    return;
  }

  const willOpen = !elements.sidebar.classList.contains("open");

  elements.sidebar.classList.toggle("open", willOpen);
  elements.sidebarOverlay.hidden = !willOpen;
  elements.menuButton.setAttribute(
    "aria-expanded",
    String(willOpen)
  );
  document.body.classList.toggle("sidebar-open", willOpen);
}


/**
 * Ajusta o estado da navegação quando a largura do ecrã muda.
 */
function syncSidebarWithViewport() {
  elements.sidebar.classList.remove("open");
  elements.sidebarOverlay.hidden = true;
  document.body.classList.remove("sidebar-open");

  if (isMobileSidebar()) {
    document.body.classList.remove("sidebar-collapsed");
    elements.menuButton.setAttribute("aria-expanded", "false");
  } else {
    elements.menuButton.setAttribute(
      "aria-expanded",
      String(
        !document.body.classList.contains("sidebar-collapsed")
      )
    );
  }
}


/**
 * Obtém as categorias únicas.
 */
function getCategories(procedures = state.procedures) {
  return [...new Set(
    procedures
      .map(procedure => procedure.category)
      .filter(Boolean)
  )].sort((left, right) => left.localeCompare(right, "pt"));
}


/**
 * Determina se um procedimento corresponde aos filtros atuais.
 */
function matchesFilters(procedure) {
  const query = elements.searchInput.value
    .trim()
    .toLocaleLowerCase("pt");

  const selectedCategory = elements.categoryFilter.value;

  if (
    selectedCategory &&
    procedure.category !== selectedCategory
  ) {
    return false;
  }

  if (!query) {
    return true;
  }

  const searchableContent = [
    procedure.id,
    procedure.title,
    procedure.category,
    procedure.owner,
    procedure.objective,
    procedure.version,
    procedure.reviewDate,
    ...procedure.steps.flatMap(step => [
      step.title,
      step.description,
      step.deadline,
      step.documents,
      step.notes,
      step.imageAlt,
      step.imageCaption
    ])
  ]
    .join(" ")
    .toLocaleLowerCase("pt");

  return searchableContent.includes(query);
}


/**
 * Ordena os procedimentos segundo a preferência atual.
 */
function sortProcedures(procedures) {
  const mode = elements.sortSelect.value;

  return [...procedures].sort((left, right) => {
    if (mode === "title") {
      return left.title.localeCompare(right.title, "pt");
    }

    if (mode === "review") {
      return (
        String(right.reviewDate).localeCompare(
          String(left.reviewDate)
        ) ||
        left.title.localeCompare(right.title, "pt")
      );
    }

    return (
      left.category.localeCompare(right.category, "pt") ||
      left.order - right.order ||
      left.title.localeCompare(right.title, "pt")
    );
  });
}


/**
 * Aceita apenas caminhos relativos seguros para imagens do repositório.
 */
function getSafeImagePath(value) {
  const path = normalize(value);

  if (
    !path ||
    path.startsWith("/") ||
    path.startsWith("\\") ||
    path.includes("..") ||
    /^[a-z]+:/i.test(path)
  ) {
    return "";
  }

  return path;
}


/**
 * Apresenta a imagem associada ao passo, quando definida no CSV.
 */
function renderStepImage(step) {
  const imagePath = getSafeImagePath(step.image);

  if (!imagePath) {
    return "";
  }

  const alternativeText =
    step.imageAlt ||
    step.imageCaption ||
    step.title ||
    "Imagem do procedimento";

  return `
    <figure class="step-image">
      <a href="${escapeHtml(imagePath)}"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Abrir imagem em tamanho original">
        <img src="${escapeHtml(imagePath)}"
             alt="${escapeHtml(alternativeText)}"
             loading="lazy"
             decoding="async">
      </a>

      ${step.imageCaption ? `
        <figcaption>
          ${escapeHtml(step.imageCaption)}
        </figcaption>
      ` : ""}
    </figure>
  `;
}


/**
 * Gera o bloco de informação adicional de um passo.
 */
function renderStepControls(step) {
  const rows = [
    ["Prazo", step.deadline],
    ["Documentos", step.documents],
    ["Observações", step.notes]
  ].filter(([, value]) => value);

  if (!rows.length) {
    return `
      <div class="step-controls">
        <div class="step-control-row">
          <strong>Controlo</strong>
          <span>Sem requisitos adicionais.</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="step-controls">
      ${rows.map(([label, value]) => `
        <div class="step-control-row">
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(value)}</span>
        </div>
      `).join("")}
    </div>
  `;
}


/**
 * Gera o HTML de um procedimento.
 */
function renderProcedure(procedure, openByDefault = false) {
  const procedureId = `procedure-${slug(
    procedure.id || procedure.title
  )}`;

  const steps = procedure.steps.map(step => `
    <div class="step-item">
      <div class="step-number">${step.number}</div>

      <div class="step-main">
        ${step.title ? `
          <strong>${escapeHtml(step.title)}</strong>
        ` : ""}

        <p>${escapeHtml(step.description)}</p>

        ${renderStepImage(step)}
      </div>

      ${renderStepControls(step)}
    </div>
  `).join("");

  return `
    <details id="${procedureId}"
             class="procedure-card"
             ${openByDefault ? "open" : ""}>
      <summary class="procedure-summary">
        <div class="procedure-summary-main">
          <div class="procedure-title-row">
            <h3>${escapeHtml(procedure.title)}</h3>
            <span class="status-badge">Ativo</span>
          </div>

          <p>${escapeHtml(procedure.objective)}</p>
        </div>

        <div class="procedure-summary-meta">
          <span class="summary-chip">
            ${escapeHtml(procedure.category)}
          </span>

          <span class="summary-chip">
            ${procedure.steps.length} passo(s)
          </span>

          <span class="summary-chip">
            Rev. ${escapeHtml(procedure.version)}
          </span>
        </div>

        <span class="summary-chevron" aria-hidden="true">⌄</span>
      </summary>

      <div class="procedure-body">
        <div class="procedure-toolbar">
          <span class="procedure-reference">
            ${escapeHtml(procedure.id)}
            ·
            ${escapeHtml(procedure.filename)}
          </span>

          <div class="procedure-tools">
            <button class="procedure-action-button"
                    type="button"
                    data-print-procedure="${procedureId}">
              <span aria-hidden="true">▣</span>
              Imprimir procedimento
            </button>

            <button class="procedure-action-button procedure-action-secondary"
                    type="button"
                    data-copy-link="${procedureId}">
              <span aria-hidden="true">↗</span>
              Copiar ligação
            </button>
          </div>
        </div>

        <div class="procedure-metadata">
          <div class="meta-box">
            <strong>Categoria</strong>
            ${escapeHtml(procedure.category)}
          </div>

          <div class="meta-box">
            <strong>Responsável</strong>
            ${escapeHtml(procedure.owner)}
          </div>

          <div class="meta-box">
            <strong>Versão / revisão</strong>
            ${escapeHtml(procedure.version)}
            ${procedure.reviewDate
              ? ` · ${escapeHtml(procedure.reviewDate)}`
              : ""}
          </div>

          <div class="meta-box meta-wide">
            <strong>Objetivo</strong>
            ${escapeHtml(procedure.objective)}
          </div>
        </div>

        <div class="steps-heading">
          Passos do procedimento
        </div>

        <div class="steps-list">
          ${steps}
        </div>
      </div>
    </details>
  `;
}


/**
 * Atualiza a lista de categorias do filtro.
 */
function renderCategoryFilter() {
  const categories = getCategories();
  const selectedValue = elements.categoryFilter.value;

  elements.categoryFilter.innerHTML = `
    <option value="">Todas as categorias</option>
    ${categories.map(category => `
      <option value="${escapeHtml(category)}">
        ${escapeHtml(category)}
      </option>
    `).join("")}
  `;

  if (categories.includes(selectedValue)) {
    elements.categoryFilter.value = selectedValue;
  }
}


/**
 * Atualiza a navegação lateral por categorias.
 */
function renderCategoryNavigation() {
  if (!state.proceduresUnlocked) {
    renderLockedProcedureNavigation();
    return;
  }

  const categories = getCategories();

  elements.categoryCount.textContent = categories.length;

  elements.categoryNavigation.innerHTML = `
    <a class="secondary-link ${state.selectedCategory === "" ? "active" : ""}"
       href="#procedimentos"
       data-category="">
      Todos
    </a>

    ${categories.map(category => `
      <a class="secondary-link ${
        state.selectedCategory === category ? "active" : ""
      }"
         href="#procedimentos"
         data-category="${escapeHtml(category)}">
        ${escapeHtml(category)}
      </a>
    `).join("")}
  `;
}


/**
 * Atualiza a lista lateral de procedimentos visíveis.
 */
function renderProcedureNavigation(procedures) {
  if (!state.proceduresUnlocked) {
    renderLockedProcedureNavigation();
    return;
  }

  elements.sidebarProcedureCount.textContent = procedures.length;

  if (!procedures.length) {
    elements.procedureNavigation.innerHTML = `
      <div class="sidebar-placeholder">
        Nenhum procedimento encontrado.
      </div>
    `;
    return;
  }

  elements.procedureNavigation.innerHTML = procedures.map(procedure => `
    <a class="procedure-link"
       href="#procedure-${slug(procedure.id || procedure.title)}">
      <span>${escapeHtml(procedure.title)}</span>
    </a>
  `).join("");
}


/**
 * Atualiza os indicadores gerais.
 */
function renderOverview() {
  const categories = getCategories();

  elements.procedureCount.textContent = state.procedures.length;
  elements.stepCount.textContent = state.procedures.reduce(
    (total, procedure) => total + procedure.steps.length,
    0
  );
  elements.overviewCategoryCount.textContent = categories.length;
}


/**
 * Apresenta os erros encontrados nos CSV.
 */
function renderErrors() {
  if (!state.errors.length) {
    elements.messageBox.hidden = true;
    elements.messageBox.innerHTML = "";
    return;
  }

  elements.messageBox.hidden = false;
  elements.messageBox.innerHTML = `
    <strong>
      Alguns ficheiros não foram incluídos no manual.
    </strong>

    <ul>
      ${state.errors.map(error => `
        <li>${escapeHtml(error)}</li>
      `).join("")}
    </ul>
  `;
}


/**
 * Atualiza a área principal do manual.
 */
function renderManual() {
  if (!state.proceduresUnlocked) {
    renderLockedProcedureNavigation();
    elements.resultsSummary.textContent = "Acesso protegido";
    return;
  }

  const filtered = sortProcedures(
    state.procedures.filter(matchesFilters)
  );

  const total = state.procedures.length;

  elements.resultsSummary.textContent = filtered.length === total
    ? `${total} procedimento(s)`
    : `${filtered.length} de ${total} procedimento(s)`;

  renderProcedureNavigation(filtered);

  if (!filtered.length) {
    elements.manualContent.innerHTML = `
      <div class="empty-state">
        <strong>Nenhum procedimento encontrado.</strong>
        <span>
          Altere a pesquisa ou limpe os filtros.
        </span>
      </div>
    `;
    return;
  }

  const grouped = filtered.reduce((groups, procedure) => {
    groups[procedure.category] ??= [];
    groups[procedure.category].push(procedure);
    return groups;
  }, {});

  elements.manualContent.innerHTML = Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right, "pt"))
    .map(([category, procedures]) => {
      const renderedProcedures = procedures
        .map(procedure => renderProcedure(procedure))
        .join("");

      return `
        <section id="category-${slug(category)}"
                 class="category-group">
          <h2 class="category-heading">
            ${escapeHtml(category)}
            <span>${procedures.length}</span>
          </h2>

          <div class="procedure-list">
            ${renderedProcedures}
          </div>
        </section>
      `;
    })
    .join("");

  openHashTarget();
}


/**
 * Atualiza todas as áreas dependentes do estado.
 */
function renderAll() {
  renderCategoryFilter();
  renderCategoryNavigation();
  renderOverview();
  renderErrors();
  renderManual();
  syncProceduresAccessUi();

  elements.loadStatus.textContent = state.procedures.length
    ? `${state.procedures.length} procedimento(s)`
    : "Sem procedimentos";
}


/**
 * Abre e destaca o procedimento indicado no URL.
 */
function openHashTarget() {
  const hash = window.location.hash;

  if (
    !state.proceduresUnlocked &&
    hash.startsWith("#procedure-")
  ) {
    requestProceduresAccess(hash);
    return;
  }

  if (!hash || !hash.startsWith("#procedure-")) {
    return;
  }

  const target = document.querySelector(hash);

  if (target instanceof HTMLDetailsElement) {
    target.open = true;

    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }
}


/**
 * Carrega todos os ficheiros definidos em procedimentos/index.js.
 *
 * Nota:
 * Os navegadores bloqueiam pedidos fetch() quando o HTML é aberto
 * diretamente através de file://. Em produção, no GitHub Pages ou
 * no Vercel, os ficheiros são servidos por HTTPS e carregam normalmente.
 */
async function loadProcedures() {
  const files = Array.isArray(window.VERTIS_PROCEDURE_FILES)
    ? window.VERTIS_PROCEDURE_FILES
    : [];

  if (window.location.protocol === "file:") {
    state.procedures = [];
    state.errors = [
      "O manual foi aberto diretamente no computador. Os navegadores bloqueiam a leitura automática dos CSV neste modo.",
      "Publique o projeto no GitHub Pages ou no Vercel, ou utilize um servidor local de pré-visualização."
    ];

    renderAll();

    elements.loadStatus.textContent = "Pré-visualização local bloqueada";
    elements.manualContent.innerHTML = `
      <div class="local-preview-state">
        <div class="local-preview-icon" aria-hidden="true">!</div>

        <strong>Os CSV não podem ser lidos através de file://</strong>

        <p>
          O manual está correto, mas precisa de ser aberto através de
          um endereço HTTP ou HTTPS.
        </p>

        <div class="local-preview-options">
          <div>
            <strong>Publicação final</strong>
            <span>
              Coloque a pasta no GitHub Pages ou no Vercel.
            </span>
          </div>

          <div>
            <strong>Pré-visualização no computador</strong>
            <span>
              No VS Code, utilize a extensão Live Server e escolha
              “Open with Live Server”.
            </span>
          </div>
        </div>
      </div>
    `;

    return;
  }

  if (!files.length) {
    state.errors = [
      "A lista procedimentos/index.js não contém ficheiros."
    ];
    renderAll();
    return;
  }

  const results = await Promise.allSettled(
    files.map(async filename => {
      let response;

      try {
        response = await fetch(
          `./procedimentos/${encodeURIComponent(filename)}?v=2.9.0`,
          { cache: "no-store" }
        );
      } catch {
        throw new Error(
          `${filename}: não foi possível estabelecer ligação ao ficheiro.`
        );
      }

      if (!response.ok) {
        throw new Error(
          `${filename}: resposta HTTP ${response.status}.`
        );
      }

      const rows = parseCsv(await response.text());
      const procedure = rowsToProcedure(rows, filename);

      return procedure;
    })
  );

  state.procedures = [];
  state.errors = [];

  results.forEach((result, index) => {
    const filename = files[index];

    if (result.status === "rejected") {
      state.errors.push(
        result.reason instanceof Error
          ? result.reason.message
          : `${filename}: erro desconhecido.`
      );
      return;
    }

    if (result.value) {
      state.procedures.push(result.value);
    }
  });

  state.procedures.sort((left, right) =>
    left.category.localeCompare(right.category, "pt") ||
    left.order - right.order ||
    left.title.localeCompare(right.title, "pt")
  );

  renderAll();
}


/**
 * Imprime apenas o procedimento escolhido.
 *
 * O cartão é aberto temporariamente e todos os restantes elementos
 * são escondidos através das regras específicas de impressão.
 */
function printProcedure(procedureId) {
  const procedure = document.getElementById(procedureId);

  if (!(procedure instanceof HTMLDetailsElement)) {
    return;
  }

  const category = procedure.closest(".category-group");
  const wasOpen = procedure.open;

  procedure.open = true;
  procedure.classList.add("print-target");
  category?.classList.add("print-category");
  document.body.classList.add("printing-procedure");

  const cleanup = () => {
    document.body.classList.remove("printing-procedure");
    procedure.classList.remove("print-target");
    category?.classList.remove("print-category");

    if (!wasOpen) {
      procedure.open = false;
    }

    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  requestAnimationFrame(() => {
    window.print();
  });
}


/**
 * Copia uma ligação direta para um procedimento.
 */
async function copyProcedureLink(procedureId, button) {
  const url = new URL(window.location.href);
  url.hash = procedureId;

  try {
    await navigator.clipboard.writeText(url.toString());

    const originalText = button.textContent;
    button.textContent = "Ligação copiada";

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1800);
  } catch {
    window.location.hash = procedureId;
  }
}


/**
 * Expande ou recolhe todos os procedimentos visíveis.
 */
function setAllProceduresOpen(open) {
  document
    .querySelectorAll(".procedure-card")
    .forEach(card => {
      card.open = open;
    });
}


/**
 * Atualiza o botão principal ativo na barra lateral.
 */
function setPrimaryNavigationActive(sectionId) {
  const labels = {
    inicio: "Visão geral",
    ferramentas: "Ferramentas",
    procedimentos: "Procedimentos"
  };

  document.querySelectorAll(".primary-link").forEach(link => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("active", targetId === sectionId);
  });

  elements.breadcrumbCurrent.textContent =
    labels[sectionId] || "Portal interno";
}


/**
 * Atualiza a navegação principal de acordo com a posição da página.
 */
function updatePrimaryNavigationFromScroll() {
  const sectionIds = [
    "inicio",
    "ferramentas",
    "procedimentos"
  ];

  const threshold = Number.parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--topbar-height"),
    10
  ) + 100;

  let activeSection = "inicio";

  sectionIds.forEach(sectionId => {
    const section = document.getElementById(sectionId);

    if (
      section &&
      section.getBoundingClientRect().top <= threshold
    ) {
      activeSection = sectionId;
    }
  });

  setPrimaryNavigationActive(activeSection);
}


/**
 * Remove uma ligação direta antiga antes de aplicar filtros.
 *
 * Sem esta limpeza, um URL terminado em #procedure-... podia voltar
 * a abrir um procedimento depois de selecionar uma categoria.
 */
function clearProcedureHash() {
  if (!window.location.hash.startsWith("#procedure-")) {
    return;
  }

  const url = new URL(window.location.href);
  url.hash = "procedimentos";
  window.history.replaceState(null, "", url);
}


/* Eventos da interface */

elements.menuButton.addEventListener("click", toggleSidebar);
elements.sidebarOverlay.addEventListener("click", closeSidebar);

elements.searchInput.addEventListener("input", () => {
  clearProcedureHash();
  renderManual();
});

elements.categoryFilter.addEventListener("change", () => {
  state.selectedCategory = elements.categoryFilter.value;

  clearProcedureHash();
  setPrimaryNavigationActive("procedimentos");
  renderCategoryNavigation();
  renderManual();
});

elements.sortSelect.addEventListener("change", () => {
  clearProcedureHash();
  renderManual();
});

elements.clearFiltersButton.addEventListener("click", () => {
  elements.searchInput.value = "";
  elements.categoryFilter.value = "";
  elements.sortSelect.value = "order";
  state.selectedCategory = "";

  clearProcedureHash();
  setPrimaryNavigationActive("procedimentos");
  renderCategoryNavigation();
  renderManual();
  elements.searchInput.focus();
});

elements.categoryNavigation.addEventListener("click", event => {
  const requestButton = event.target.closest(
    "[data-request-procedures]"
  );

  if (requestButton) {
    requestProceduresAccess("#procedimentos");
    return;
  }

  const link = event.target.closest("[data-category]");

  if (!link) {
    return;
  }

  event.preventDefault();

  const category = link.dataset.category || "";

  state.selectedCategory = category;
  elements.categoryFilter.value = category;

  clearProcedureHash();
  setPrimaryNavigationActive("procedimentos");
  renderCategoryNavigation();
  renderManual();

  document.getElementById("procedimentos").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  closeSidebar();
});

elements.procedureNavigation.addEventListener("click", event => {
  const link = event.target.closest("a");

  if (!link) {
    return;
  }

  setPrimaryNavigationActive("procedimentos");
  closeSidebar();
});

elements.manualContent.addEventListener("click", event => {
  const printButton = event.target.closest("[data-print-procedure]");

  if (printButton) {
    event.preventDefault();
    event.stopPropagation();

    printProcedure(printButton.dataset.printProcedure);
    return;
  }

  const copyButton = event.target.closest("[data-copy-link]");

  if (copyButton) {
    event.preventDefault();
    event.stopPropagation();

    copyProcedureLink(copyButton.dataset.copyLink, copyButton);
  }
});

document.querySelectorAll(".primary-link").forEach(link => {
  link.addEventListener("click", event => {
    const target = link.getAttribute("href") || "#inicio";
    const sectionId = target.replace("#", "");

    if (
      sectionId === "procedimentos" &&
      !state.proceduresUnlocked
    ) {
      event.preventDefault();
      requestProceduresAccess(target);
      closeSidebar();
      return;
    }

    setPrimaryNavigationActive(sectionId);
    closeSidebar();
  });
});

elements.openAccessButton.addEventListener("click", () => {
  requestProceduresAccess("#procedimentos");
});

elements.lockProceduresButton.addEventListener(
  "click",
  lockProcedures
);

elements.accessForm.addEventListener("submit", event => {
  event.preventDefault();
  unlockProcedures(elements.accessCodeInput.value.trim());
});

elements.accessModal.addEventListener("click", event => {
  if (event.target.closest("[data-close-access]")) {
    closeAccessModal();
  }
});

elements.accessCodeInput.addEventListener("input", event => {
  event.target.value = event.target.value
    .replace(/\D/g, "")
    .slice(0, 4);

  elements.accessError.textContent = "";
});

elements.budgetCalculatorForm.addEventListener(
  "submit",
  event => event.preventDefault()
);

elements.budgetAmount.addEventListener(
  "input",
  calculateBudget
);

elements.budgetAmount.addEventListener("blur", () => {
  const value = parsePortugueseNumber(
    elements.budgetAmount.value
  );

  if (Number.isFinite(value) && value >= 0) {
    elements.budgetAmount.value =
      formatEditableAmount(value);
  }
});

elements.addPaymentPhaseButton.addEventListener(
  "click",
  () => {
    const nextPhaseName = getNextPaymentPhaseName();

    elements.paymentPhaseRows.append(
      createPaymentPhaseRow(nextPhaseName, 0)
    );

    refreshPaymentPhaseOptions();

    elements.paymentPhaseRows
      .lastElementChild
      ?.querySelector(".payment-phase-name")
      ?.focus();

    calculateBudget();
  }
);

elements.paymentPhaseRows.addEventListener(
  "input",
  event => {
    if (
      event.target.matches(
        ".payment-phase-name, " +
        ".payment-phase-percentage"
      )
    ) {
      if (event.target.matches(".payment-phase-name")) {
        refreshPaymentPhaseOptions();
      }

      calculateBudget();
    }
  }
);

elements.paymentPhaseRows.addEventListener(
  "click",
  event => {
    const removeButton = event.target.closest(
      "[data-remove-payment-phase]"
    );

    if (!removeButton) {
      return;
    }

    const rows = elements.paymentPhaseRows
      .querySelectorAll(".phase-editor-row");

    if (rows.length <= 1) {
      elements.calculatorMessage.textContent =
        "É necessário manter pelo menos uma fase de pagamento.";
      return;
    }

    removeButton.closest(".phase-editor-row")?.remove();
    refreshPaymentPhaseOptions();
    calculateBudget();
  }
);

elements.addVatRowButton.addEventListener("click", () => {
  elements.vatRows.append(createVatRow(0, 0));

  elements.vatRows
    .lastElementChild
    ?.querySelector(".vat-rate")
    ?.focus();

  calculateBudget();
});

elements.vatRows.addEventListener("input", event => {
  if (
    event.target.matches(".vat-rate, .vat-allocation")
  ) {
    calculateBudget();
  }
});

elements.vatRows.addEventListener("click", event => {
  const removeButton = event.target.closest(
    "[data-remove-vat-row]"
  );

  if (!removeButton) {
    return;
  }

  const rows = elements.vatRows.querySelectorAll(
    ".vat-editor-row"
  );

  if (rows.length <= 1) {
    elements.calculatorMessage.textContent =
      "É necessário manter pelo menos uma taxa de IVA.";
    return;
  }

  removeButton.closest(".vat-editor-row")?.remove();
  calculateBudget();
});

elements.resetBudgetCalculator.addEventListener(
  "click",
  resetBudgetCalculator
);

document.querySelectorAll(
  "[data-copy-budget-template]"
).forEach(button => {
  button.addEventListener("click", () => {
    copyBudgetTemplate(
      button.dataset.copyBudgetTemplate,
      button
    );
  });
});

elements.expandAllButton.addEventListener("click", () => {
  setAllProceduresOpen(true);
});

elements.collapseAllButton.addEventListener("click", () => {
  setAllProceduresOpen(false);
});

elements.backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

window.addEventListener("hashchange", openHashTarget);

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    !elements.accessModal.hidden
  ) {
    closeAccessModal();
  }
});

let navigationFrameRequested = false;

window.addEventListener("scroll", () => {
  if (navigationFrameRequested) {
    return;
  }

  navigationFrameRequested = true;

  requestAnimationFrame(() => {
    updatePrimaryNavigationFromScroll();
    navigationFrameRequested = false;
  });
}, { passive: true });

window.addEventListener("resize", () => {
  syncSidebarWithViewport();
  updatePrimaryNavigationFromScroll();
});

syncSidebarWithViewport();
syncProceduresAccessUi();
updatePrimaryNavigationFromScroll();
refreshPaymentPhaseOptions();
calculateBudget();
loadProcedures().then(() => {
  const hash = window.location.hash;

  if (
    !state.proceduresUnlocked &&
    (
      hash === "#procedimentos" ||
      hash.startsWith("#procedure-")
    )
  ) {
    requestProceduresAccess(hash);
  }
});
