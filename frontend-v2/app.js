const form = document.querySelector('#calculator-form');
const lengthInput = document.querySelector('#room-length');
const widthInput = document.querySelector('#room-width');
const reserveInput = document.querySelector('#reserve');
const areaValue = document.querySelector('#area-value');
const totalValue = document.querySelector('#total-value');
const message = document.querySelector('#form-message');

const formatArea = (value) => value.toLocaleString('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const length = Number(lengthInput.value);
  const width = Number(widthInput.value);
  const reserve = Number(reserveInput.value);

  if (!Number.isFinite(length) || !Number.isFinite(width) || length <= 0 || width <= 0) {
    message.textContent = 'Введите длину и ширину помещения больше нуля.';
    areaValue.textContent = '—';
    totalValue.textContent = '—';
    return;
  }

  if (!Number.isFinite(reserve) || reserve < 0 || reserve > 30) {
    message.textContent = 'Запас должен быть от 0 до 30 процентов.';
    return;
  }

  const area = length * width;
  const total = area * (1 + reserve / 100);

  areaValue.textContent = formatArea(area);
  totalValue.textContent = formatArea(total);
  message.textContent = `Расчёт готов: добавлен запас ${reserve}%.`;
  document.querySelector('#order').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
