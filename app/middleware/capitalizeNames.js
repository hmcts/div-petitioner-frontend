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
  if (req.session.petitionerFirstName) {
    req.session
      .petitionerFirstName = capitalizeName(req.session.petitionerFirstName);
  }
  if (req.session.petitionerLastName) {
    req.session
      .petitionerLastName = capitalizeName(req.session.petitionerLastName);
  }
  if (req.session.respondentFirstName) {
    req.session
      .respondentFirstName = capitalizeName(req.session.respondentFirstName);
  }
  if (req.session.respondentLastName) {
    req.session
      .respondentLastName = capitalizeName(req.session.respondentLastName);
  }
  if (req.session.reasonForDivorceAdultery3rdPartyFirstName) {
    req.session
      .reasonForDivorceAdultery3rdPartyFirstName = capitalizeName(req
        .session.reasonForDivorceAdultery3rdPartyFirstName);
  }
  if (req.session.reasonForDivorceAdultery3rdPartyLastName) {
    req.session
      .reasonForDivorceAdultery3rdPartyLastName = capitalizeName(req
        .session.reasonForDivorceAdultery3rdPartyLastName);
  }
  next();
}

module.exports = capitalizeNames;
