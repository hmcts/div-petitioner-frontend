function uppercaseAfterLetter(letter, str) {
  const splitStr = str.split(letter);
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0)
      .toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(letter);
}

function capitalizeName(str) {
  if (!str) {
    return null;
  }
  let result = str;
  result = result.charAt(0).toUpperCase() + result.slice(1);
  result = uppercaseAfterLetter(' ', result);
  result = uppercaseAfterLetter('-', result);
  result = uppercaseAfterLetter('\'', result);
  return result;
}

function capitalizeNames(req, res, next) {
  req.session
    .petitionerFirstName = capitalizeName(req.session.petitionerFirstName);
  req.session
    .petitionerLastName = capitalizeName(req.session.petitionerLastName);
  req.session
    .respondentFirstName = capitalizeName(req.session.respondentFirstName);
  req.session
    .respondentLastName = capitalizeName(req.session.respondentLastName);
  req.session
    .reasonForDivorceAdultery3rdPartyFirstName = capitalizeName(req
      .session.reasonForDivorceAdultery3rdPartyFirstName);
  req.session
    .reasonForDivorceAdultery3rdPartyLastName = capitalizeName(req
      .session.reasonForDivorceAdultery3rdPartyLastName);
  next();
}

module.exports = capitalizeNames;
