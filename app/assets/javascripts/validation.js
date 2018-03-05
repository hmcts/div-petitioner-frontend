function validate(errorIds) { // eslint-disable-line no-unused-vars
  document.getElementById('error-summary').className = document.getElementById('error-summary').className.replace(/\bhidden\b/, '');
  var errorDetails = document.getElementsByClassName('error-message');
  for (var i = 0; i < errorDetails.length; i++) {
    errorDetails[i].style.display = '';
  }
  for (var j = 0; j < errorIds.length; j++) {
    document.getElementById(errorIds[j]).className += ' error';
  }
}
