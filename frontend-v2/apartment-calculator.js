const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = 'linum-apartments-v2';
const SETTINGS_FIELDS = ['project-name', 'material', 'price', 'roll-widths', 'allowance'];
let state = { apartments: [], activeId: null, settings: {} };

const parseNumber = (value) => Number(String(value).replace(',', '.'));
const format = (value) => value.toLocaleString('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const activeApartment = () => state.apartments.find((apartment) => apartment.id === state.activeId);

function save() {
  state.settings = Object.fromEntries(
    SETTINGS_FIELDS.map((id) => [id, $(`#${id}`).value])
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function restoreSettings() {
  SETTINGS_FIELDS.forEach((id) => {
    if (state.settings?.[id] !== undefined) {
      $(`#${id}`).value = state.settings[id];
    }
  });
}

function createApartment(copy) {
  const apartment = copy
    ? structuredClone(copy)
    : {
        number: `КВ${126 + state.apartments.length}`,
        name: 'Новая квартира',
        comment: '',
        rooms: [{ type: 'Кухня', length: '', width: '', comment: '' }]
      };

  apartment.id = crypto.randomUUID();
  state.apartments.push(apartment);
  state.activeId = apartment.id;
  render();
}

function renderList() {
  const list = $('#apartment-list');
  list.innerHTML = '';

  state.apartments.forEach((apartment) => {
    const button = document.createElement('button');
    button.className = `apartment-item${apartment.id === state.activeId ? ' active' : ''}`;
    button.innerHTML = `<strong>${apartment.number || 'Без номера'}</strong><small>${apartment.name || 'Без названия'} · ${apartment.rooms.length} пом.</small>`;
    button.onclick = () => {
      state.activeId = apartment.id;
      render();
    };
    list.append(button);
  });
}

function roomRow(room, index) {
  const row = $('#room-template').content.firstElementChild.cloneNode(true);
  row.querySelector('.room-index').textContent = index + 1;

  const set = (selector, key) => {
    const field = row.querySelector(selector);
    field.value = room[key];

    const update = () => {
      room[key] = field.value;
      save();
      renderList();
    };

    field.oninput = update;
    field.onchange = update;
  };

  set('.room-type', 'type');
  set('.room-length', 'length');
  set('.room-width', 'width');
  set('.room-comment', 'comment');

  row.querySelector('.delete-room').onclick = () => {
    activeApartment().rooms.splice(index, 1);
    render();
  };

  return row;
}

function renderEditor() {
  const apartment = activeApartment();
  $('#empty-state').hidden = Boolean(apartment);
  $('#apartment-editor').hidden = !apartment;
  if (!apartment) return;

  $('#active-title').textContent = apartment.number || 'Новая квартира';

  [
    ['#apartment-number', 'number'],
    ['#apartment-name', 'name'],
    ['#apartment-comment', 'comment']
  ].forEach(([selector, key]) => {
    const field = $(selector);
    field.value = apartment[key];
    field.oninput = () => {
      apartment[key] = field.value;
      $('#active-title').textContent = apartment.number || 'Новая квартира';
      save();
      renderList();
    };
  });

  const rooms = $('#rooms');
  rooms.innerHTML = '';
  apartment.rooms.forEach((room, index) => rooms.append(roomRow(room, index)));
}

function render() {
  renderList();
  renderEditor();
  save();
}

function calculate() {
  const allowance = parseNumber($('#allowance').value) / 100 || 0;
  const price = parseNumber($('#price').value) || 0;
  const widths = $('#roll-widths').value
    .split(',')
    .map(parseNumber)
    .filter((width) => width > 0)
    .sort((a, b) => a - b);

  let materialArea = 0;
  const result = $('#results');
  result.innerHTML = '';

  state.apartments.forEach((apartment) => {
    apartment.rooms.forEach((room) => {
      const length = parseNumber(room.length);
      const width = parseNumber(room.width);
      if (!(length > 0 && width > 0)) return;

      const withAllowance = (length + allowance * 2) * (width + allowance * 2);
      const roll = widths.find(
        (value) => value >= Math.min(length + allowance * 2, width + allowance * 2)
      ) || widths.at(-1) || 0;

      materialArea += withAllowance;

      const row = document.createElement('div');
      row.className = 'result-row';
      row.innerHTML = `<div><strong>${apartment.number || 'Квартира'} · ${room.type}</strong><small>${format(length)} × ${format(width)} м</small></div><div><small>Площадь</small><strong>${format(length * width)} м²</strong></div><div><small>С запасом</small><strong>${format(withAllowance)} м²</strong></div><div><small>Рулон</small><strong>${roll ? `${format(roll)} м` : '—'}</strong></div>`;
      result.append(row);
    });
  });

  $('#results-panel').hidden = !result.children.length;
  $('#total-cost').textContent = result.children.length
    ? `${format(materialArea)} м² · ${format(materialArea * price)} ₽`
    : 'Нет заполненных помещений';

  save();
}

$('#add-apartment').onclick = () => createApartment();
$('#add-room').onclick = () => {
  activeApartment().rooms.push({
    type: 'Кухня',
    length: '',
    width: '',
    comment: ''
  });
  render();
};
$('#copy-apartment').onclick = () => createApartment(activeApartment());
$('#delete-apartment').onclick = () => {
  state.apartments = state.apartments.filter(
    (apartment) => apartment.id !== state.activeId
  );
  state.activeId = state.apartments[0]?.id || null;
  render();
};
$('#calculate-all').onclick = calculate;

SETTINGS_FIELDS.forEach((id) => {
  $(`#${id}`).addEventListener('input', save);
});

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved?.apartments) state = { ...state, ...saved };
} catch (_) {
  // Если ранее сохранённые данные повреждены, запускаем пустой расчёт.
}

restoreSettings();
if (!state.apartments.length) createApartment();
else render();
