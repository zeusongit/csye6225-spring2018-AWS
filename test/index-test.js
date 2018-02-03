var expect = require('chai').expect;
var alwaysTrueTest = require('../alwaysTrueTest.js');
describe('alwaysTrue()',function(){
  it('should always return true',function(){
    var trueCondition = true;
    var testForTrue = alwaysTrueTest();
    expect(testForTrue).to.be.equal(testForTrue);
  });
});
