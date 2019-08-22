(function (global) {

    var DIVORCE = global.DIVORCE || {};

    function findHiddenFields() {

        var exampleFields = /^how-behaved-example-/;

        var hiddenFields = [], els = document.getElementsByTagName('DIV');
        for (var i = els.length; i--;) if (exampleFields.test(els[i].id) && els[i].className.indexOf('js-hidden') > -1) hiddenFields.push(els[i]);

        return hiddenFields;
    }

    function showAnotherExample() { // eslint-disable-line no-unused-vars
        //  don't log error
        try {

            var hiddenFields = findHiddenFields();

            removeHiddenClass(hiddenFields[hiddenFields.length - 1].id, 'js-hidden');
            focusElement(hiddenFields[hiddenFields.length - 1].id);

            if (hiddenFields.length === 1)
                hideAddExampleButton();

        } catch (error) {
            //  don't do anything
        }
    }

    function removeHiddenClass(elementId, className) {
        document.getElementById(elementId).className =
                document.getElementById(elementId).className
                        .replace(new RegExp('(?:^|\\s)' + className + '(?:\\s|$)'), ' ');
    }

    function focusElement(elementId) {
        document.getElementById(elementId)
            .getElementsByTagName('textarea')[0]
            .focus();
    }

    function addAttributeWhenVisible(){
        var hiddenFields = findHiddenFields();
        var textAreaElementParent =  document.getElementById(hiddenFields[hiddenFields.length - 1].id);
        var textAreaElement = textAreaElementParent.getElementsByTagName('textarea')[0];
        textAreaElement.setAttribute('onfocus', 'this.value=this.value.replace(/\\.\\.\\.$/, \'\')');
    }

    function hideAddExampleButton() {
        document.getElementById('add-example').style.display = 'none';
    }

    function showAddExampleButton() {

        var hiddenFields = findHiddenFields();

        if (hiddenFields.length === 0) {
            document.getElementById('add-example').style.display = 'none';
        } else {
            document.getElementById('add-example').style.display = 'inline';
        }
    }

    DIVORCE.showAnotherExample = showAnotherExample;
    DIVORCE.showAddExampleButton = showAddExampleButton;
    DIVORCE.addAttributeWhenVisible = addAttributeWhenVisible;

    global.DIVORCE = DIVORCE;

})(window);
