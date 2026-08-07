export function initUI() {
  const { roomTypes } = window.linoleumData;

  function createRoom(container) {
    const tpl = document.getElementById('roomTpl').content.cloneNode(true);
    const room = tpl.querySelector('.room');
    const typeSelect = room.querySelector('.room-type');
    const customInput = room.querySelector('.room-custom');
    const codeInput = room.querySelector('.room-code');

    typeSelect.innerHTML = '';
    roomTypes.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.code;
      opt.textContent = t.name;
      typeSelect.appendChild(opt);
    });

    typeSelect.addEventListener('change', () => {
      const isCustom = typeSelect.value === 'custom';
      customInput.hidden = !isCustom;
      codeInput.hidden = isCustom;
    });

    room.querySelector('.delete-room').addEventListener('click', () => room.remove());
    room.querySelector('.copy-room').addEventListener('click', () => {
      const clone = createRoom(container);
      clone.querySelector('.room-type').value = room.querySelector('.room-type').value;
      clone.querySelector('.room-type').dispatchEvent(new Event('change'));
      clone.querySelector('.room-custom').value = room.querySelector('.room-custom').value;
      clone.querySelector('.room-code').value = room.querySelector('.room-code').value;
      clone.querySelector('.room-length').value = room.querySelector('.room-length').value;
      clone.querySelector('.room-width').value = room.querySelector('.room-width').value;
      clone.querySelector('.room-comment').value = room.querySelector('.room-comment').value;
    });

    container.appendChild(room);
    return room;
  }

  function createApartment() {
    const tpl = document.getElementById('apartmentTpl').content.cloneNode(true);
    const apt = tpl.querySelector('.apartment');
    const roomsContainer = apt.querySelector('.rooms');

    apt.querySelector('.add-room').addEventListener('click', () => createRoom(roomsContainer));
    apt.querySelector('.delete-apt').addEventListener('click', () => apt.remove());
    apt.querySelector('.copy-apt').addEventListener('click', () => {
      const clone = createApartment();
      clone.querySelector('.apt-number').value = apt.querySelector('.apt-number').value;
      clone.querySelector('.apt-name').value = apt.querySelector('.apt-name').value;
      clone.querySelector('.apt-comment').value = apt.querySelector('.apt-comment').value;
      const cloneRooms = clone.querySelector('.rooms');
      roomsContainer.querySelectorAll('.room').forEach((r) => {
        const nr = createRoom(cloneRooms);
        nr.querySelector('.room-type').value = r.querySelector('.room-type').value;
        nr.querySelector('.room-type').dispatchEvent(new Event('change'));
        nr.querySelector('.room-custom').value = r.querySelector('.room-custom').value;
        nr.querySelector('.room-code').value = r.querySelector('.room-code').value;
        nr.querySelector('.room-length').value = r.querySelector('.room-length').value;
        nr.querySelector('.room-width').value = r.querySelector('.room-width').value;
        nr.querySelector('.room-comment').value = r.querySelector('.room-comment').value;
      });
    });

    document.getElementById('apartments').appendChild(apt);
    createRoom(roomsContainer);
    return apt;
  }

  function bind() {
    document.getElementById('addApartmentBottom').addEventListener('click', createApartment);
    document.getElementById('clearApartments').addEventListener('click', () => {
      document.getElementById('apartments').innerHTML = '';
    });

    createApartment();
  }

  bind();
}
