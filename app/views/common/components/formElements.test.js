/* eslint-disable quotes */
const { expect } = require('test/util/chai');
const nunjucks = require('nunjucks');

const date = `
{% from "app/views/common/components/formElements.html" import date %}

{{ date(
    dayField = day,
    monthField = month,
    yearField = year,
    dateField = dateField,
    label = label,
    hint = hint,
    id = id,
    hiddenLegend = hiddenLegend,
    legend = legend
)}}
`;

const textArea = `
{% from "app/views/common/components/formElements.html" import textArea %}
{{ textArea(name,field,label,hint) }}
`;

const textField = `
{% from "app/views/common/components/formElements.html" import textField %}
{{ textField(name, field, label, hint) }}
`;

const yesNoRadioButton = `
{% from "app/views/common/components/formElements.html" import yesNoRadio %}

{{
    yesNoRadio(label = label, hint = hint, name = name, field = field, yes = yes, no = no)
}}

`;

const yesNoRadioHeading = `
{% from "app/views/common/components/formElements.html" import yesNoRadioHeading %}

{{
yesNoRadioHeading(legend = legend, hint = hint, name = name, field = field, yes = yes, no = no, targetYes = targetYes, targetNo = targetNo, screenReader = screenReader)
}}
`;


describe(`Text areas should render as expected`, () => {
  it('name, field and label are rendered correctly', () => {
    const input = {
      name: 'testName',
      field: { value: 'some text' },
      label: 'testLabel'
    };

    const res = nunjucks.renderString(textArea, input);

    expect(res).to.contain('<label class="form-label-bold" for="testName">testLabel</label>');
    expect(res).to.contain('id="testName');
    expect(res).to.contain('name="testName"');
    expect(res).to.contain(input.field.value);
    expect(res).to.not.contain('<span class="form-hint">');
  });

  it('errors are shown if present', () => {
    const input = {
      name: 'testName',
      field: {
        value: 'some text',
        error: true,
        errorMessage: 'error-message'
      },
      label: 'testLabel'
    };

    const res = nunjucks.renderString(textArea, input);


    expect(res).to.contain('<div class="form-group form-group-error">');
    expect(res).to.contain('<span class="error-message">');
    expect(res).to.contain(input.field.errorMessage);
  });

  it('hint is shown when present', () => {
    const input = {
      name: 'testName',
      field: { value: 'some text' },
      label: 'testLabel',
      hint: 'hint'
    };

    const res = nunjucks.renderString(textArea, input);
    expect(res).to.contain('<span class="form-hint">');
    expect(res).to.contain(input.hint);
  });
});

describe(`Text fields should render as expected`, () => {
  it('name, field and label are rendered correctly', () => {
    const input = {
      name: 'testName',
      field: { value: 'some text' },
      label: 'testLabel'
    };

    const res = nunjucks.renderString(textField, input);

    expect(res).to.contain('<label class="form-label text" for="testName">testLabel</label>');
    expect(res).to.contain('id="testName');
    expect(res).to.contain('name="testName"');
    expect(res).to.contain(input.field.value);
    expect(res).to.not.contain('<span class="form-hint">');
  });

  it('errors are shown if present', () => {
    const input = {
      name: 'testName',
      field: {
        value: 'some text',
        error: true,
        errorMessage: 'error-message'
      },
      label: 'testLabel'
    };

    const res = nunjucks.renderString(textField, input);


    expect(res).to.contain('<div class="form-group form-group-error">');
    expect(res).to.contain('<span class="error-message">');
    expect(res).to.contain(input.field.errorMessage);
  });

  it('hint is shown when present', () => {
    const input = {
      name: 'testName',
      field: { value: 'some text' },
      label: 'testLabel',
      hint: 'hint'
    };

    const res = nunjucks.renderString(textField, input);
    expect(res).to.contain('<span class="form-hint text">');
    expect(res).to.contain(input.hint);
  });
});

describe(`Date fields should render as expected`, () => {
  it('name, field and label are rendered correctly', () => {
    const input = {
      day: { value: '01' },
      month: { value: '02' },
      year: { value: '1980' },
      date: {},
      label: 'dateLabel',
      id: 'testDate'
    };

    const res = nunjucks.renderString(date, input);

    expect(res).to.contain('<span class="form-label">dateLabel</span>');
    expect(res).to.contain('name="day" value="01"');
    expect(res).to.contain('name="month" value="02"');
    expect(res).to.contain('name="year" value="1980"');
    expect(res).to.contain('id="testDate"');
    expect(res).to.not.contain('<legend class="form-label-bold">');
    expect(res).to.not.contain('<legend class="visually-hidden">');
    expect(res).to.not.contain('<span class="form-hint">');
    // Test for the absence of HTML5 form validation attributes.
    expect(res).to.not.contain('pattern=');
    expect(res).to.not.contain('type="number"');
    expect(res).to.not.contain('min=');
    expect(res).to.not.contain('max=');
  });

  it('errors are shown if present', () => {
    const input = {
      day: {
        value: '01',
        error: true,
        errorMessage: 'dayErrorMessage'
      },
      month: {
        value: '02',
        error: true,
        errorMessage: 'monthErrorMessage'
      },
      year: {
        value: '1980',
        error: true,
        errorMessage: 'yearErrorMessage'
      },
      dateField: {
        error: true,
        errorMessage: 'dateErrors'
      },
      label: 'dateLabel',
      id: 'testDate'
    };

    const res = nunjucks.renderString(date, input);


    expect(res).to.contain(input.day.errorMessage);
    expect(res).to.contain(input.month.errorMessage);
    expect(res).to.contain(input.year.errorMessage);
    expect(res).to.contain(input.dateField.errorMessage);
    expect(res).to.contain('<fieldset class="form-group form-date form-group-error" id="testDate">');
  });

  it('hint, legend and hidden legend are shown when present', () => {
    const input = {
      day: {},
      month: {},
      year: {},
      date: {},
      label: 'dateLabel',
      id: 'testDate',
      legend: 'testLegend',
      hiddenLegend: 'testHiddenLegend',
      hint: 'testHint'
    };


    const res = nunjucks.renderString(date, input);
    expect(res).to.contain(input.hint);
    expect(res).to.contain(input.legend);
    expect(res).to.contain(input.hiddenLegend);
  });
});

describe(`Yes no radio buttons should render as expected`, () => {
  it('name, field and label are rendered correctly', () => {
    const input = {
      name: 'testName',
      field: { value: 'Yes' },
      label: 'testLabel',
      yes: 'Yes',
      no: 'No'
    };

    const res = nunjucks.renderString(yesNoRadioButton, input);

    expect(res).to.contain('<legend class="form-label text">testLabel</legend>');
    expect(res).to.contain('id="testName_No');
    expect(res).to.contain('id="testName_Yes');
    expect(res).to.contain('value="Yes" checked=checked');
    expect(res).to.contain('value="No"');
  });

  it('errors are shown if present', () => {
    const input = {
      name: 'testName',
      field: {
        value: 'Yes',
        error: true,
        errorMessage: "Error Message"
      },
      label: 'testLabel',
      yes: 'Yes',
      no: 'No'
    };

    const res = nunjucks.renderString(yesNoRadioButton, input);

    expect(res).to.contain('class="form-group form-group-error">');
    expect(res).to.contain('<span class="error-message">');
    expect(res).to.contain(input.field.errorMessage);
  });

  it('hint is shown when present', () => {
    const input = {
      name: 'testName',
      field: { value: 'Yes' },
      label: 'testLabel',
      yes: 'Yes',
      no: 'No',
      hint: 'hintText'
    };

    const res = nunjucks.renderString(yesNoRadioButton, input);

    expect(res).to.contain('<p class="form-hint text">hintText</p>');
  });
});

describe(`Yes no radio button headings should render as expected`, () => {
  it('name, field and label are rendered correctly', () => {
    const input = {
      name: 'testName',
      field: { value: 'Yes' },
      legend: 'testLabel',
      yes: 'Yes',
      no: 'No',
      screenReader: 'screenReader'
    };

    const res = nunjucks.renderString(yesNoRadioHeading, input);

    expect(res).to.contain(' <legend class="visually-hidden">testLabel</legend>');
    expect(res).to.contain('id="testName_No');
    expect(res).to.contain('id="testName_Yes');
    expect(res).to.contain('value="Yes" checked=checked');
    expect(res).to.contain('value="No"');
    expect(res).to.contain('for="testName_Yes"');
    expect(res).to.contain('for="testName_No"');
    expect(res).to.contain('data-target=');
    expect(res).to.contain('<span class="visually-hidden">screenReader</span>');
  });

  it('targets are rendered if present', () => {
    const input = {
      name: 'testName',
      field: { value: 'Yes' },
      legend: 'testLabel',
      yes: 'Yes',
      no: 'No',
      targetYes: 'targetYes',
      targetNo: 'targetNo'
    };

    const res = nunjucks.renderString(yesNoRadioHeading, input);

    expect(res).to.contain(' <legend class="visually-hidden">testLabel</legend>');
    expect(res).to.contain('id="testName_No');
    expect(res).to.contain('id="testName_Yes');
    expect(res).to.contain('value="Yes" checked=checked');
    expect(res).to.contain('value="No"');
    expect(res).to.contain('for="testName_Yes" ');
    expect(res).to.contain('for="testName_No" ');
    expect(res).to.contain('data-target="targetYes"');
    expect(res).to.contain('data-target="targetNo"');
  });

  it('errors are shown if present', () => {
    const input = {
      name: 'testName',
      field: {
        value: 'Yes',
        error: true,
        errorMessage: "Error Message"
      },
      legend: 'testLabel',
      yes: 'Yes',
      no: 'No'
    };

    const res = nunjucks.renderString(yesNoRadioHeading, input);

    expect(res).to.contain('class="form-group form-group-error">');
    expect(res).to.contain('<span class="error-message">');
    expect(res).to.contain(input.field.errorMessage);
  });

  it('hint is shown when present', () => {
    const input = {
      name: 'testName',
      field: { value: 'Yes' },
      legend: 'testLabel',
      yes: 'Yes',
      no: 'No',
      hint: 'hintText'
    };

    const res = nunjucks.renderString(yesNoRadioHeading, input);

    expect(res).to.contain('<p class="text form-hint">hintText</p>');
  });
});

/* eslint-enable quotes */
