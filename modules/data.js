export function initData() {
  const roomTypes = [
    { code: 'living', name: 'гостиная' },
    { code: 'bedroom', name: 'спальня' },
    { code: 'kitchen', name: 'кухня' },
    { code: 'hall', name: 'коридор' },
    { code: 'bath', name: 'санузел' },
    { code: 'custom', name: 'своё помещение' }
  ];

  window.linoleumData = { roomTypes };
}
