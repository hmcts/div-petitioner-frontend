const {expect, sinon} = require('test/util/chai');

let documentGetElementsByTagNameStub, documentGetElementByIdStub;
let divElementArray, addExampleObject;

describe('dynamicFields', () => {

    before(() => {
        this.jsdom = require('jsdom-global')();

        //  run the dynamic fields function to populate the global scope with two functions
        require('app/assets/javascripts/dynamicFields');

        //  stubbing out document functions as they are third party
        documentGetElementsByTagNameStub = sinon.stub(document, 'getElementsByTagName');
        documentGetElementByIdStub = sinon.stub(document, 'getElementById');
    });

    after(() => {
        this.jsdom();
    });

    describe('showAnotherExample', () => {

        before(() => {

            const getElementsByTagName = sinon.stub().returns([{ focus: sinon.stub() }]);

            divElementArray = [
                { id : 'how-behaved-example-0', className : 'class js-hidden', getElementsByTagName },
                { id : 'how-behaved-example-1', className : 'class js-hidden', getElementsByTagName },
                { id : 'how-behaved-example-2', className : 'class js-not-hidden', getElementsByTagName },
                { id : 'irrelevent-id-0', className : 'class js-hidden', getElementsByTagName },
                { id : 'irrelevent-id-1', className : 'class js-hidden', getElementsByTagName },
                { id : 'how-behaved-example-3', className : 'class js-hidden', getElementsByTagName },
                { id : 'irrelevent-id-2', className : 'class js-not-hidden', getElementsByTagName },
                { id : 'how-behaved-example-4', className : 'class js-hidden', getElementsByTagName },
                { id : 'how-behaved-example-5', className : 'class js-not-hidden', getElementsByTagName },
                { id : 'how-behaved-example-6', className : 'class js-not-hidden', getElementsByTagName },
                { id : 'irrelevent-id-3', className : 'class js-not-hidden', getElementsByTagName }
            ];

            documentGetElementsByTagNameStub.withArgs('DIV').returns(divElementArray);
            for (const item of divElementArray) {
                documentGetElementByIdStub.withArgs(item.id).returns(item);
            }

            addExampleObject = { style : { display : 'none' }};
            documentGetElementByIdStub.withArgs('add-example').returns(addExampleObject);
        });

        it('should find hidden fields from the how-behaved ids and remove them one at a time', () => {

            addExampleObject.style.display = 'inline';

            window.DIVORCE.showAnotherExample();

            sinon.assert.calledWith(document.getElementById, 'how-behaved-example-0');
            sinon.assert.neverCalledWith(document.getElementById, 'how-behaved-example-1', 'how-behaved-example-2');

            window.DIVORCE.showAnotherExample();

            sinon.assert.calledWith(document.getElementById, 'how-behaved-example-1');
            sinon.assert.neverCalledWith(document.getElementById, 'how-behaved-example-2');

            window.DIVORCE.showAnotherExample();

            sinon.assert.calledWith(document.getElementById, 'how-behaved-example-3');
            sinon.assert.neverCalledWith(document.getElementById, 'how-behaved-example-2, irrelevent-id-0, irrelevent-id-1');

            //  we have 4 hidden fields, so we need to call showAnotherExample again
            window.DIVORCE.showAnotherExample();

            expect(addExampleObject).to.eql({ style : { display : 'none' }});
        });
    });

    describe('showAddExampleButton', () => {

        it('should show the add example button when there are hidden fields left to show', () => {

            divElementArray = [
                { id : 'how-behaved-example-0', className : 'class js-hidden' }
            ];

            documentGetElementsByTagNameStub.withArgs('DIV').returns(divElementArray);

            addExampleObject = { style : { display : 'none' }};

            documentGetElementByIdStub.withArgs('add-example').returns(addExampleObject);

            window.DIVORCE.showAddExampleButton();

            expect(addExampleObject).to.eql({ style : { display : 'inline' }});
        });

        it('should show the add example button when there are no hidden fields left to show', () => {

            divElementArray = [
                { id : 'how-behaved-example-0', className : 'class js-not-hidden' }
            ];

            documentGetElementsByTagNameStub.withArgs('DIV').returns(divElementArray);

            addExampleObject = { style : { display : 'inline' }};

            documentGetElementByIdStub.withArgs('add-example').returns(addExampleObject);

            window.DIVORCE.showAddExampleButton();

            expect(addExampleObject).to.eql({ style : { display : 'none' }});
        });
    });
});
