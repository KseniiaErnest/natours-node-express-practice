
export const hideAlert = () => {
  const elAlert = document.querySelector('.alert');
  if (elAlert) elAlert.parentElement.removeChild(elAlert);
}

// type is 'success' or 'error'
export const showAlert = (type, message) => {
hideAlert();
const markUp = `<div class='alert alert--${type}'>${message}</div>`;
document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);

window.setTimeout(hideAlert, 5000);
}