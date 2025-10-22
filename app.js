document.addEventListener('DOMContentLoaded', () => {
  const ui = {
    appView: document.getElementById('app-view'),
    errorView: document.getElementById('error-view'),
    errorMessage: document.getElementById('error-message'),
    topicLabel: document.getElementById('topic-label'),
    questionText: document.getElementById('question-text'),
    translationBlock: document.getElementById('translation-block'),
    translationText: document.getElementById('translation-text'),
    tipBlock: document.getElementById('tip-block'),
    tipText: document.getElementById('tip-text'),
    translateButton: document.getElementById('translate-button'),
    tipButton: document.getElementById('tip-button'),
    nextButton: document.getElementById('next-button'),
  };

  const dataState = {
    topic: 'Svar på spørsmålene',
    questions: [],
    queue: [],
    currentIndex: null,
  };

  const hintState = {
    translationVisible: false,
    tipVisible: false,
  };

  ui.translateButton.addEventListener('click', toggleTranslation);
  ui.tipButton.addEventListener('click', toggleTip);
  ui.nextButton.addEventListener('click', showNextQuestion);

  fetchQuestions();

  async function fetchQuestions() {
    setNextEnabled(false);
    setHintButtonsEnabled(false);
    hideError();
    ui.appView.classList.add('hidden');

    const dataUrl = new URL('data/questions.json', window.location.href);
    let rawData = null;
    let loadErrorMessage;
    try {
      const response = await fetch(dataUrl.href, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(
          `Запрос завершился с кодом ${response.status}. Проверьте наличие файла questions.json.`
        );
      }
      rawData = await response.json();
    } catch (loadError) {
      loadErrorMessage = loadError?.message;
      console.error('Primary data load failed', loadError);
    }

    if (!rawData) {
      handleEmptyData(loadErrorMessage);
      return;
    }

    try {
      const parsed = validateQuestionData(rawData);
      handleLoadedData(parsed);
    } catch (validationError) {
      console.error('Validation failed', validationError);
      showError(
        'Не удалось обработать questions.json. Сверьтесь с ожидаемой структурой и исправьте файл.',
        validationError.message
      );
    }
  }

  function handleLoadedData(parsed) {
    dataState.topic = parsed.topic;
    dataState.questions = parsed.questions;
    dataState.queue = [];
    dataState.currentIndex = null;

    updateTopicLabel();
    setNextEnabled(true);
    ui.appView.classList.remove('hidden');
    showNextQuestion();
  }

  function updateTopicLabel() {
    ui.topicLabel.textContent = dataState.topic;
  }

  function showNextQuestion() {
    if (dataState.questions.length === 0) {
      renderEmptyQuestion();
      return;
    }

    const nextIndex = getNextQuestionIndex();
    if (nextIndex == null) {
      renderEmptyQuestion();
      return;
    }

    dataState.currentIndex = nextIndex;

    const question = dataState.questions[nextIndex];
    ui.questionText.textContent = question.text;
    ui.translationText.textContent = question.translation;
    renderTipContent(question.tip);

    resetHintBlocks();
    setHintButtonsEnabled(true);
  }

  function getNextQuestionIndex() {
    if (dataState.questions.length === 0) {
      return null;
    }

    if (dataState.queue.length === 0) {
      dataState.queue = createShuffledQueue(dataState.questions.length);

      if (dataState.queue.length > 1 && dataState.queue[0] === dataState.currentIndex) {
        const swapIndex = dataState.queue.findIndex((idx) => idx !== dataState.currentIndex);
        if (swapIndex > 0) {
          [dataState.queue[0], dataState.queue[swapIndex]] = [
            dataState.queue[swapIndex],
            dataState.queue[0],
          ];
        }
      }
    }

    if (dataState.queue.length === 0) {
      return dataState.currentIndex ?? 0;
    }

    return dataState.queue.shift();
  }

  function createShuffledQueue(count) {
    const indices = Array.from({ length: count }, (_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }

  function resetHintBlocks() {
    hintState.translationVisible = false;
    hintState.tipVisible = false;

    setHintVisibility(
      ui.translationBlock,
      ui.translateButton,
      false,
      'Скрыть перевод',
      'Показать перевод'
    );
    setHintVisibility(
      ui.tipBlock,
      ui.tipButton,
      false,
      'Скрыть подсказку',
      'Показать подсказку'
    );
  }

  function toggleTranslation() {
    if (dataState.currentIndex == null) {
      return;
    }
    hintState.translationVisible = !hintState.translationVisible;
    setHintVisibility(
      ui.translationBlock,
      ui.translateButton,
      hintState.translationVisible,
      'Скрыть перевод',
      'Показать перевод'
    );
  }

  function toggleTip() {
    if (dataState.currentIndex == null) {
      return;
    }
    hintState.tipVisible = !hintState.tipVisible;
    setHintVisibility(
      ui.tipBlock,
      ui.tipButton,
      hintState.tipVisible,
      'Скрыть подсказку',
      'Показать подсказку'
    );
  }

  function setHintVisibility(block, button, visible, activeLabel, inactiveLabel) {
    if (!block || !button) {
      return;
    }
    block.classList.toggle('hidden', !visible);
    button.setAttribute('aria-pressed', visible ? 'true' : 'false');
    button.textContent = visible ? activeLabel : inactiveLabel;
  }

  function setNextEnabled(enabled) {
    ui.nextButton.disabled = !enabled;
  }

  function setHintButtonsEnabled(enabled) {
    ui.translateButton.disabled = !enabled;
    ui.tipButton.disabled = !enabled;
  }

  function hideError() {
    ui.errorView.classList.add('hidden');
  }

  function showError(message, detail) {
    ui.appView.classList.add('hidden');
    setNextEnabled(false);
    setHintButtonsEnabled(false);
    ui.errorView.classList.remove('hidden');
    ui.errorMessage.textContent = detail ? `${message} (${detail})` : message;
  }

  function handleEmptyData(detailMessage) {
    hideError();
    dataState.topic = 'Svar på spørsmålene';
    dataState.questions = [];
    dataState.queue = [];
    dataState.currentIndex = null;

    updateTopicLabel();
    renderEmptyQuestion(detailMessage);
    ui.appView.classList.remove('hidden');
  }

  function renderEmptyQuestion(detailMessage) {
    ui.questionText.textContent =
      detailMessage && detailMessage.length > 0
        ? `Вопросы не найдены (${detailMessage}).`
        : 'Вопросы не найдены. Добавьте файл data/questions.json.';
    ui.translationText.textContent = '';
    ui.tipText.textContent = '';
    resetHintBlocks();
    setHintButtonsEnabled(false);
    setNextEnabled(false);
  }

  function renderTipContent(rawTip) {
    if (!ui.tipText) {
      return;
    }

    ui.tipText.textContent = '';

    if (typeof rawTip !== 'string') {
      return;
    }

    const trimmedTip = rawTip.trim();
    if (trimmedTip.length === 0) {
      return;
    }

    const segments = splitTipSegments(trimmedTip);

    if (segments.length <= 1) {
      ui.tipText.textContent = trimmedTip;
      return;
    }

    segments.forEach((segment, index) => {
      const span = document.createElement('span');
      span.className = index === 0 ? 'block' : 'block mt-2';
      span.textContent = segment;
      ui.tipText.appendChild(span);
    });
  }

  function splitTipSegments(rawTip) {
    if (typeof rawTip !== 'string') {
      return [];
    }

    const sanitized = rawTip.trim();
    if (sanitized.length === 0) {
      return [];
    }

    const segmented = sanitized
      .split(/\s\/\s|\s\/|\/\s/g)
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);

    if (segmented.length <= 1) {
      return [sanitized];
    }

    return segmented;
  }

  function validateQuestionData(raw) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new Error('Корневой объект JSON должен содержать массив "questions".');
    }

    const { topic, questions } = raw;

    if (!Array.isArray(questions)) {
      throw new Error('Поле "questions" должно быть массивом объектов вопросов.');
    }

    const sanitized = questions.map((item, index) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        throw new Error(`Вопрос с индексом ${index} имеет неверный формат.`);
      }

      const { text, translation, tip } = item;

      if (typeof text !== 'string' || text.trim().length === 0) {
        throw new Error(`У вопроса с индексом ${index} отсутствует текстовое поле "text".`);
      }
      if (typeof translation !== 'string' || translation.trim().length === 0) {
        throw new Error(`У вопроса "${text}" отсутствует строка "translation".`);
      }
      if (typeof tip !== 'string' || tip.trim().length === 0) {
        throw new Error(`У вопроса "${text}" отсутствует строка "tip".`);
      }

      return {
        text: text.trim(),
        translation: translation.trim(),
        tip: tip.trim(),
      };
    });

    return {
      topic:
        typeof topic === 'string' && topic.trim().length > 0
          ? topic.trim()
          : 'Svar på spørsmålene',
      questions: sanitized,
    };
  }
});
